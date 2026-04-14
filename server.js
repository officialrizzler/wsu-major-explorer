import { systemInstruction } from "./utils/ai_config.js";
import { enforceAiLimits, redis } from "./utils/rateLimit.js";
import {
  buildWsuSearchQuery,
  chatResponseCacheKey,
  extractQueryTerms,
  getChatResponseCacheTtlSec,
  getTavilyCacheTtlSec,
  isLikelyUniversitySpecificQuestion,
  isTimeSensitiveQuery,
  normalizeChatCacheQuery,
  pickOfficialTavilyResults,
  shouldPrefetchWebSearch,
  tavilyResponseCacheKey,
} from "./utils/advisorSearch.js";
import cors from "cors";
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.local" });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const IS_LOCAL = process.env.NODE_ENV !== "production";

if (!OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is missing. AI Advisor will return error responses until set.");
}
if (!TAVILY_API_KEY) {
  console.warn("⚠️ TAVILY_API_KEY is missing. Web search will be skipped.");
} else {
  console.log("✅ Tavily web search enabled.");
}
if (!TURNSTILE_SECRET_KEY) {
  console.warn("⚠️ TURNSTILE_SECRET_KEY is missing. Advisor security check is bypassed.");
}
if (IS_LOCAL) {
  console.log("🔓 Running locally — rate limiting bypassed.");
}

const app = express();

app.use(cors({ origin: true, credentials: false }));
app.use(express.json());

const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

function trimToNaturalEnding(text, wasTruncated) {
  const normalized = String(text || "").trim();
  if (!normalized) return normalized;
  if (!wasTruncated) return normalized;

  const sentenceMatches = [...normalized.matchAll(/[\s\S]*?[.!?](?=\s|$)/g)];
  const lastSentence = sentenceMatches.at(-1)?.[0]?.trim();
  if (lastSentence && lastSentence.length >= normalized.length * 0.55) {
    return lastSentence;
  }

  const lastParagraphBreak = Math.max(
    normalized.lastIndexOf("\n\n"),
    normalized.lastIndexOf("\n- "),
    normalized.lastIndexOf("\n")
  );
  if (lastParagraphBreak > normalized.length * 0.55) {
    return normalized.slice(0, lastParagraphBreak).trim();
  }

  const lastSpace = normalized.lastIndexOf(" ");
  if (lastSpace > normalized.length * 0.7) {
    return `${normalized.slice(0, lastSpace).trim()}...`;
  }

  return `${normalized}...`;
}

async function verifyTurnstileToken(token, remoteIp) {
  if (!TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const params = new URLSearchParams({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
  });

  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) return false;

  const data = await response.json();
  return !!data?.success;
}

async function runTavilySearch(query) {
  if (!TAVILY_API_KEY) return "";

  const searchMode = (isTimeSensitiveQuery(query) || isLikelyUniversitySpecificQuestion(query))
    ? "high_accuracy"
    : "standard";

  const normalizedQuery = buildWsuSearchQuery(query).toLowerCase().replace(/\s+/g, " ").trim();
  const searchCacheKey = tavilyResponseCacheKey(searchMode, normalizedQuery);

  try {
    if (redis) {
      const cached = await redis.get(searchCacheKey);
      if (cached) return cached;
    }
  } catch (e) { }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const tavilyRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        apiKey: TAVILY_API_KEY,
        query: normalizedQuery,
        search_depth: searchMode === "high_accuracy" ? "advanced" : "basic",
        max_results: searchMode === "high_accuracy" ? 6 : 4,
        include_answer: searchMode === "high_accuracy",
        include_domains: [
          "winona.edu",
          "winonastate.edu",
          "catalog.winona.edu",
          "blogs.winona.edu",
          "library.winona.edu",
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!tavilyRes.ok) {
      let errorDetail = "";
      try {
        const errJson = await tavilyRes.json();
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch (e) {}
      console.error(`[Tavily] API Error [${tavilyRes.status}]: ${errorDetail}`);
      return "";
    }

    const tavilyData = await tavilyRes.json();
    const queryTerms = extractQueryTerms(query);
    
    const rawResults = tavilyData.results || [];
    if (rawResults.length === 0 && !tavilyData.answer) {
      console.log(`[Tavily] 0 results for: ${normalizedQuery}`);
      return "";
    }

    const filteredResults = pickOfficialTavilyResults(rawResults, queryTerms, searchMode).slice(
      0,
      searchMode === "high_accuracy" ? 5 : 3,
    );

    const snippets = filteredResults
      .map((result, index) => {
        const title = result.title || `Result ${index + 1}`;
        const url = result.url || "No URL provided";
        const content = (result.content || "").replace(/\s+/g, " ").trim().slice(0, 2000);
        return `${index + 1}. ${title}\nSource: ${url}\nSnippet: ${content}`;
      })
      .join("\n\n");

    const formatted = [
      "Web search results for context. Prefer official Winona State University pages and cite the source URL briefly when used.",
      searchMode === "high_accuracy" && tavilyData.answer ? `Answer summary: ${tavilyData.answer}` : "",
      snippets,
    ].filter(Boolean).join("\n\n");

    try {
      if (redis && formatted) {
        await redis.set(searchCacheKey, formatted, { ex: getTavilyCacheTtlSec(query, searchMode) });
      }
    } catch (e) { }

    return formatted;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("[Tavily] search execution error:", error);
    return "";
  }
}

app.post("/api/chat", async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: "AI Advisor not configured. Please set OPENAI_API_KEY environment variable." });
  }

  // Skip rate limiting in local dev
  if (!IS_LOCAL) {
    const ok = await enforceAiLimits(req, res);
    if (!ok) return;
  }

  try {
    const { chatHistory, userQuery, turnstileToken } = req.body || {};

    if (typeof userQuery !== "string" || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const remoteIp = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket?.remoteAddress || "";
    const isTurnstileValid = await verifyTurnstileToken(typeof turnstileToken === "string" ? turnstileToken : "", remoteIp);
    if (!isTurnstileValid) {
      return res.status(403).json({ error: "Security check failed. Please refresh and try again." });
    }

    const isTimeSensitive = isTimeSensitiveQuery(userQuery);
    const normalizedForCache = normalizeChatCacheQuery(userQuery);
    const cacheKey = chatResponseCacheKey(normalizedForCache);
    try {
      if (redis && !isTimeSensitive) {
        const cached = await redis.get(cacheKey);
        if (cached) return res.json({ text: cached });
      }
    } catch (e) { }

    // --- Hybrid Search / Local Context ---
    // Simple top-hit context to avoid AI halluncinations
    const lowerQuery = userQuery.toLowerCase();
    const keywords = ["business", "nursing", "computer", "math", "art", "science", "social work", "accounting"];
    const matched = keywords.filter(k => lowerQuery.includes(k));
    let extraContext = "";
    if (matched.length > 0) {
      extraContext = `\n\nUser is interested in: ${matched.join(", ")}. Ensure you mention relevant WSU programs like ${matched[0]} if appropriate.`;
    }

    // --- History Trimming (Cost Reduction) ---
    const trimmedHistory = chatHistory.slice(-4).map((msg) => {
      const text = msg?.parts?.[0]?.text ?? "";
      const role = msg?.role === "model" ? "assistant" : "user";
      return { role, content: String(text).slice(0, 1500) };
    });

    // --- Tavily Web Search ---
    let tavilyContext = "";
    if (TAVILY_API_KEY && shouldPrefetchWebSearch(userQuery, undefined, undefined)) {
      try {
        tavilyContext = await runTavilySearch(userQuery);
        if (tavilyContext) {
          tavilyContext = `\n\n${tavilyContext}`;
          console.log(`[Tavily] fetched context for: "${userQuery}"`);
        }
      } catch (e) {
        console.warn("[Tavily] search failed:", e?.message || e);
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemInstruction + extraContext + tavilyContext +
            "\n\nRules: Concise plain text only. No markdown. Refer to WSU academic advisors."
        },
        ...trimmedHistory,
        { role: "user", content: userQuery.slice(0, 1500) },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const responseText = trimToNaturalEnding(
      completion.choices[0]?.message?.content ?? "",
      completion.choices[0]?.finish_reason === "length"
    );

    // Store in cache
    const isBadResponse = /I['’]?m sorry|I couldn['’]?t|I was(?:n['’]t| not) able to|I recommend checking the official|I cannot process/i.test(responseText);
    try {
      if (redis && responseText && !isBadResponse) {
        await redis.set(cacheKey, responseText, {
          ex: getChatResponseCacheTtlSec(userQuery, normalizedForCache, isTimeSensitive),
        });
      }
    } catch (e) { }

    return res.json({ text: responseText });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "AI error" });
  }
});


app.use(express.static(path.join(__dirname, "dist")));



app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
