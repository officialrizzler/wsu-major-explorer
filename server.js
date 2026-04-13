import { systemInstruction } from "./utils/ai_config.js";
import { enforceAiLimits, redis } from "./utils/rateLimit.js";
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

function buildWsuSearchQuery(query) {
  if (/winona state|wsu|winona\.edu/i.test(query)) {
    return query.trim();
  }

  return `Winona State University site:winona.edu ${query}`.trim();
}

function isTimeSensitiveQuery(query) {
  return /\b(latest|current|currently|today|now|right now|this year|this semester|this fall|this spring|up to date|updated|as of|2025|2026|deadline|deadlines|tuition|cost|fees|housing|admission|admissions|requirements|application|calendar|event|events|start date|semester|fafsa|scholarship|financial aid)\b/i.test(query);
}

function isLikelyUniversitySpecificQuestion(query) {
  return /\b(wsu|winona state|university|campus|department|program|major|minor|housing|residence|admission|admissions|financial aid|tuition|fees|deadline|requirements|advisor|professor|faculty|student services|dorm|meal plan|visit|tour)\b/i.test(query);
}

function extractQueryTerms(query) {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length >= 4)
        .filter((term) => !["winona", "state", "university", "with", "from", "what", "when", "where", "which", "about", "that", "this", "have", "does"].includes(term))
    )
  ).slice(0, 8);
}

function scoreSearchResult(result, queryTerms) {
  const haystack = `${result.title || ""} ${result.url || ""} ${result.content || ""}`.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    if (haystack.includes(term)) score += 2;
  }

  if (/winona\.edu/i.test(result.url || "")) score += 2;
  if (/housing|residence|admission|tuition|financial aid|program|department|student/i.test(result.title || "")) score += 1;

  return score;
}

function shouldUseWebSearch(query) {
  const q = query.toLowerCase();
  const trigger = isTimeSensitiveQuery(query) || /advisor|advising|tuition|cost|fees|deadline|application|admission|housing|meal plan|financial aid|scholarship|visit|tour|parking|calendar|semester|start date|campus|dorm|residence life|email|phone|address|hours|requirements|gpa|transfer|international|fafsa|test optional|event/i.test(q);
  return trigger;
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
  const searchCacheKey = `tavily_cache:${searchMode}:${Buffer.from(normalizedQuery).toString("base64").slice(0, 40)}`;

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
        include_domains: ["winona.edu", "winonastate.edu", "catalog.winona.edu", "blogs.winona.edu"],
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

    const filteredResults = rawResults
      .map((result) => ({ result, score: scoreSearchResult(result, queryTerms) }))
      .filter(({ score, result }) => {
        const url = (result.url || "").toLowerCase();
        const isOfficial = url.includes("winona.edu") || url.includes("winonastate.edu");
        if (!isOfficial) return false;
        
        if (queryTerms.length === 0) return true;
        return score >= (searchMode === "high_accuracy" ? 2 : 1);
      })
      .sort((a, b) => b.score - a.score)
      .map(({ result }) => result)
      .slice(0, searchMode === "high_accuracy" ? 5 : 3);

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
        await redis.set(searchCacheKey, formatted, { ex: isTimeSensitiveQuery(query) ? 60 * 60 * 3 : searchMode === "high_accuracy" ? 60 * 60 * 24 : 60 * 60 * 24 * 7 });
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

    // --- Backend Cache (Redis) ---
    const cacheKey = `ai:cache:${Buffer.from(userQuery).toString('base64').slice(0, 32)}`;
    try {
      if (redis && !isTimeSensitiveQuery(userQuery)) {
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
    if (TAVILY_API_KEY && shouldUseWebSearch(userQuery)) {
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
        await redis.set(cacheKey, responseText, { ex: 60 * 60 * 24 * 3 }); // 3 days for base server cache
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
