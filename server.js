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
const IS_LOCAL = process.env.NODE_ENV !== "production";

if (!OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is missing. AI Advisor will return error responses until set.");
}
if (!TAVILY_API_KEY) {
  console.warn("⚠️ TAVILY_API_KEY is missing. Web search will be skipped.");
} else {
  console.log("✅ Tavily web search enabled.");
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

function shouldUseWebSearch(query) {
  return /advisor|advising|tuition|cost|fees|deadline|application|admission|housing|meal plan|financial aid|scholarship|visit|tour|parking|calendar|semester|start date|campus|dorm|residence life|email|phone|address|hours|requirements|gpa|transfer|international|fafsa|test optional|event/i.test(query);
}

async function runTavilySearch(query) {
  if (!TAVILY_API_KEY) return "";

  const normalizedQuery = buildWsuSearchQuery(query).toLowerCase().replace(/\s+/g, " ").trim();
  const searchCacheKey = `tavily_cache:${Buffer.from(normalizedQuery).toString("base64").slice(0, 40)}`;

  try {
    if (redis) {
      const cached = await redis.get(searchCacheKey);
      if (cached) return cached;
    }
  } catch (e) { }

  const tavilyRes = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: normalizedQuery,
      search_depth: "basic",
      max_results: 3,
      include_answer: false,
      include_domains: ["winona.edu"],
    }),
  });

  if (!tavilyRes.ok) {
    throw new Error(`Tavily responded with status ${tavilyRes.status}`);
  }

  const tavilyData = await tavilyRes.json();
  const snippets = (tavilyData.results || [])
    .slice(0, 3)
    .map((result, index) => {
      const title = result.title || `Result ${index + 1}`;
      const url = result.url || "No URL provided";
      const content = (result.content || "").replace(/\s+/g, " ").trim().slice(0, 280);
      return `${index + 1}. ${title}\nSource: ${url}\nSnippet: ${content}`;
    })
    .join("\n\n");

  const formatted = [
    "Web search results for context. Prefer official Winona State University pages and cite the source URL briefly when used.",
    snippets,
  ].filter(Boolean).join("\n\n");

  try {
    if (redis && formatted) {
      await redis.set(searchCacheKey, formatted, { ex: 60 * 60 * 12 });
    }
  } catch (e) { }

  return formatted;
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
    const { chatHistory, userQuery } = req.body || {};

    if (typeof userQuery !== "string" || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // --- Backend Cache (Redis) ---
    const cacheKey = `ai:cache:${Buffer.from(userQuery).toString('base64').slice(0, 32)}`;
    try {
      if (redis) {
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
      return { role, content: String(text).slice(0, 700) };
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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemInstruction + extraContext + tavilyContext +
            "\n\nRules: Concise plain text only. No markdown. Refer to WSU academic advisors."
        },
        ...trimmedHistory,
        { role: "user", content: userQuery.slice(0, 1500) },
      ],
      max_tokens: 180,
      temperature: 0.7,
    });

    const responseText = trimToNaturalEnding(
      completion.choices[0]?.message?.content ?? "",
      completion.choices[0]?.finish_reason === "length"
    );

    // Store in cache for 1 hour
    try {
      if (redis) {
        await redis.set(cacheKey, responseText, { ex: 3600 });
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
