

import OpenAI from "openai";
import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const AI_ENABLED = process.env.AI_ENABLED ?? "true";

const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 15);
const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS ?? 2000);
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS ?? 400);
const MAX_HISTORY_MESSAGES = Number(process.env.MAX_HISTORY_MESSAGES ?? 4);
const MAX_HISTORY_MSG_CHARS = Number(process.env.MAX_HISTORY_MSG_CHARS ?? 1500);
const MAX_PROGRAM_CONTEXT_ITEMS = Number(process.env.MAX_PROGRAM_CONTEXT_ITEMS ?? 3);
const MAX_PROFESSOR_CONTEXT_ITEMS = Number(process.env.MAX_PROFESSOR_CONTEXT_ITEMS ?? 2);
const TAVILY_MAX_RESULTS = Number(process.env.TAVILY_MAX_RESULTS ?? 3);
const TAVILY_SNIPPET_CHARS = Number(process.env.TAVILY_SNIPPET_CHARS ?? 2000);
const DAILY_LIMIT_MESSAGE = "You've reached the 15-message daily limit for Warrior Bot. Please come back tomorrow, or contact Winona State directly if you need immediate help.";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

let redis: Redis | null = null;
try {
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });
  }
} catch (e) {
  console.error("Failed to initialize Redis:", e);
}

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilySearchResponse = {
  answer?: string;
  results?: TavilyResult[];
};

type SearchMode = "standard" | "high_accuracy";

function getClientIp(req: NextApiRequest) {
  const xf = req.headers["x-forwarded-for"];
  const first = (Array.isArray(xf) ? xf[0] : xf ?? "").split(",")[0].trim();
  return first || req.socket.remoteAddress || "unknown";
}

function trimToNaturalEnding(text: string, wasTruncated: boolean): string {
  const normalized = text.trim();
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

function buildWsuSearchQuery(query: string): string {
  if (/winona state|wsu|winona\.edu/i.test(query)) {
    return query.trim();
  }

  return `Winona State University site:winona.edu ${query}`.trim();
}

function isTimeSensitiveQuery(query: string): boolean {
  return /\b(latest|current|currently|today|now|right now|this year|this semester|this fall|this spring|up to date|updated|as of|2025|2026|deadline|deadlines|tuition|cost|fees|housing|admission|admissions|requirements|application|calendar|event|events|start date|semester|fafsa|scholarship|financial aid)\b/i.test(query);
}

function isLikelyUniversitySpecificQuestion(query: string): boolean {
  return /\b(wsu|winona state|university|campus|department|program|major|minor|housing|residence|admission|admissions|financial aid|tuition|fees|deadline|requirements|advisor|professor|faculty|student services|dorm|meal plan|visit|tour)\b/i.test(query);
}

function extractQueryTerms(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length >= 4)
        .filter((term) => !["winona", "state", "university", "with", "from", "what", "when", "where", "which", "about", "that", "this", "have", "does", "been", "were", "many", "much"].includes(term))
    )
  ).slice(0, 8);
}

function scoreSearchResult(result: TavilyResult, queryTerms: string[]): number {
  const haystack = `${result.title || ""} ${result.url || ""} ${result.content || ""}`.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    if (haystack.includes(term)) score += 2;
  }

  if (/winona\.edu/i.test(result.url || "")) score += 2;
  if (/housing|residence|admission|tuition|financial aid|program|department|student/i.test(result.title || "")) score += 1;

  return score;
}

function shouldUseWebSearch(
  userQuery: string,
  programContext: unknown,
  professorContext: unknown
): boolean {
  const query = userQuery.toLowerCase();
  const hasProgramMatches = Array.isArray(programContext) && programContext.length > 0;
  const hasProfessorMatches = Array.isArray(professorContext) && professorContext.length > 0;

  const currentInfoPattern = /tuition|cost|fees|deadline|application|admission|housing|meal plan|financial aid|scholarship|visit|tour|parking|calendar|semester|start date|campus|dorm|residence life|email|phone|address|hours|requirements|gpa|transfer|international|fafsa|test optional|event/i;
  const factualQuestionPattern = /\b(what|when|where|how much|how many|can i|do they|is there|are there)\b/i;

  if (isTimeSensitiveQuery(userQuery) || currentInfoPattern.test(query)) {
    return true;
  }

  return factualQuestionPattern.test(query) || isTimeSensitiveQuery(userQuery);
}

async function runTavilySearch(query: string): Promise<string> {
  if (!TAVILY_API_KEY) {
    return "";
  }

  const searchMode: SearchMode =
    isTimeSensitiveQuery(query) || isLikelyUniversitySpecificQuestion(query)
      ? "high_accuracy"
      : "standard";

  const normalizedQuery = buildWsuSearchQuery(query).toLowerCase().replace(/\s+/g, " ").trim();
  const searchCacheKey = `tavily_cache:${searchMode}:${Buffer.from(normalizedQuery).toString("base64").slice(0, 40)}`;

  if (redis) {
    try {
      const cached = await redis.get<string>(searchCacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.error("Tavily cache get error:", error);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        apiKey: TAVILY_API_KEY, // Modern Tavily uses apiKey
        query: normalizedQuery,
        search_depth: searchMode === "high_accuracy" ? "advanced" : "basic",
        include_answer: searchMode === "high_accuracy",
        max_results: searchMode === "high_accuracy" ? 6 : 4,
        include_domains: ["winona.edu", "winonastate.edu", "catalog.winona.edu", "blogs.winona.edu"]
      })
    });

    clearTimeout(timeoutId);

    if (!tavilyResponse.ok) {
      let errorDetail = "";
      try {
        const errJson = await tavilyResponse.json() as any;
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch (e) {}
      console.error(`Tavily API Error [${tavilyResponse.status}]: ${errorDetail}`);
      return "";
    }

    const searchResults = await tavilyResponse.json() as TavilySearchResponse;
    const queryTerms = extractQueryTerms(query);
    
    const rawResults = searchResults.results || [];
    if (rawResults.length === 0 && !searchResults.answer) {
      console.log(`Tavily returned 0 results for: ${normalizedQuery}`);
      return "";
    }

    const filteredResults = rawResults
      .map((result) => ({ result, score: scoreSearchResult(result, queryTerms) }))
      .filter(({ score, result }) => {
        const url = (result.url || "").toLowerCase();
        const isOfficial = url.includes("winona.edu") || url.includes("winonastate.edu");
        if (!isOfficial) return false;
        
        if (queryTerms.length === 0) return true;
        // Moderate threshold: 2 for any official site match + some content overlap
        return score >= (searchMode === "high_accuracy" ? 2 : 1);
      })
      .sort((a, b) => b.score - a.score)
      .map(({ result }) => result)
      .slice(0, searchMode === "high_accuracy" ? 5 : TAVILY_MAX_RESULTS);

    const summarizedResults = filteredResults
      .map((result, index) => {
        const title = result.title || `Result ${index + 1}`;
        const url = result.url || "No URL provided";
        const content = (result.content || "").replace(/\s+/g, " ").trim().slice(0, TAVILY_SNIPPET_CHARS);
        return `${index + 1}. ${title}\nURL: ${url}\nSnippet: ${content}`;
      })
      .join("\n\n");

    if (!searchResults.answer && !summarizedResults) {
      return "";
    }

    const formatted = [
      "Web search results for context. Prefer official Winona State University pages and cite them with markdown links when used.",
      searchMode === "high_accuracy" && searchResults.answer ? `Answer summary: ${searchResults.answer}` : "",
      summarizedResults
    ].filter(Boolean).join("\n\n");

    if (redis && formatted) {
      try {
        await redis.set(searchCacheKey, formatted, { ex: isTimeSensitiveQuery(query) ? 60 * 60 * 3 : searchMode === "high_accuracy" ? 60 * 60 * 24 : 60 * 60 * 24 * 7 });
      } catch (error) {
        console.error("Tavily cache set error:", error);
      }
    }

    return formatted;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Tavily search execution error:", error);
    return "";
  }
}

/**
 * Rate limiter: 15 requests per day per IP address
 * - Uses Redis for persistent storage (survives server restarts)
 * - IP-based tracking (cannot be bypassed by clearing browser data)
 * - Resets daily at midnight UTC
 * - Returns false if limit exceeded, true if request is allowed
 */
async function applyRateLimiter(req: NextApiRequest): Promise<boolean> {
  if (!redis) return true;
  const ip = getClientIp(req);
  if (ip === "unknown") return true;
  const dayKey = new Date().toISOString().slice(0, 10);
  const key = `rate_limit:${ip}:${dayKey}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60 * 60 * 24);
  return count <= RATE_LIMIT_MAX_REQUESTS;
}

async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    return true;
  }

  if (!token) {
    return false;
  }

  const params = new URLSearchParams({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
  });

  if (remoteIp && remoteIp !== "unknown") {
    params.set("remoteip", remoteIp);
  }

  const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!verifyResponse.ok) {
    return false;
  }

  const verification = await verifyResponse.json() as { success?: boolean };
  return !!verification.success;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API Handler Start. Method:", req.method);
  console.log("OpenAI Key Present:", !!OPENAI_API_KEY);
  console.log("Redis Present:", !!redis);

  if (!openai) {
    console.error("OPENAI_API_KEY is missing from environment variables.");
    return res.status(500).json({
      error: "The AI Advisor is not configured correctly on the server. Please ensure OPENAI_API_KEY is set in the Vercel project settings."
    });
  }

  if (AI_ENABLED !== "true") {
    return res.status(503).json({ error: "The AI Advisor is temporarily disabled." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    if (!(await applyRateLimiter(req))) {
      return res.status(429).json({ error: DAILY_LIMIT_MESSAGE });
    }

    const { chatHistory, userQuery, programContext, professorContext, wsuStats, turnstileToken } = req.body;

    if (!userQuery || typeof userQuery !== "string" || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const isTurnstileValid = await verifyTurnstileToken(
      typeof turnstileToken === "string" ? turnstileToken : "",
      getClientIp(req)
    );

    if (!isTurnstileValid) {
      return res.status(403).json({ error: "Security check failed. Please refresh and try again." });
    }

    // Smart cache: Normalize queries to catch common variations
    const normalizeQuery = (query: string): string => {
      return query
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim()
        .replace(/winona state university|wsu|winona state/gi, 'wsu') // Normalize school name
        .replace(/how much does|what does|whats the cost|what is the cost/gi, 'cost')
        .replace(/tuition|fees|price/gi, 'cost');
    };

    // Check cache with normalized query
    const isTimeSensitive = isTimeSensitiveQuery(userQuery);

    if (redis && !isTimeSensitive) {
      try {
        const normalizedQuery = normalizeQuery(userQuery);
        const cacheKey = `chat_cache:${Buffer.from(normalizedQuery).toString('base64').slice(0, 40)}`;
        const cached = await redis.get<string>(cacheKey);
        if (cached) {
          console.log(`Cache hit for: ${normalizedQuery}`);
          return res.status(200).json({ text: cached });
        }
      } catch (e) {
        console.error("Cache get error:", e);
      }
    }

    if (userQuery.length > MAX_INPUT_CHARS) {
      return res.status(413).json({ error: `Message too long.` });
    }

    // Build context with WSU statistics
    let contextSnippet = "";
    if (wsuStats) {
      contextSnippet = `\n\nWSU Quick Facts:\n` +
        `- Total Programs: ${wsuStats.total_programs}\n` +
        `- Bachelor's Degrees: ${wsuStats.bachelor_programs}\n` +
        `- Minors: ${wsuStats.minor_programs}\n` +
        `- Master's Programs: ${wsuStats.master_programs}\n` +
        `- Total Professors: ${wsuStats.total_professors}`;
    }

    // Only add program context if programs were found
    if (programContext && Array.isArray(programContext) && programContext.length > 0) {
      contextSnippet += "\n\nRelevant WSU Programs:\n" +
        programContext.slice(0, MAX_PROGRAM_CONTEXT_ITEMS).map((p: any) =>
          `- ${p.program_name} (${p.degree_type}): ${p.program_credits || 'varies'} credits. ${p.short_description || ''}`
        ).join("\n");
    }

    // Only add professor context if professors were found
    if (professorContext && Array.isArray(professorContext) && professorContext.length > 0) {
      contextSnippet += "\n\nRelevant WSU Professors:\n" +
        professorContext.slice(0, MAX_PROFESSOR_CONTEXT_ITEMS).map((prof: any) =>
          `- ${prof.name} (${prof.title}): Rating ${prof.avg_rating}/5, Courses: ${prof.courses_taught}`
        ).join("\n");
    }

    const trimmedHistory = chatHistory
      .slice(-MAX_HISTORY_MESSAGES)
      .map((msg: any) => {
        const text = msg?.parts?.[0]?.text ?? "";
        const role = (msg?.role === "model" ? "assistant" : "user") as "assistant" | "user";
        return { role, content: String(text).slice(0, MAX_HISTORY_MSG_CHARS) };
      });

    const requiresHighAccuracy = shouldUseWebSearch(userQuery, programContext, professorContext) &&
      (isTimeSensitiveQuery(userQuery) || isLikelyUniversitySpecificQuestion(userQuery));

    const baseSystemInstruction =
      `You are Warrior Bot, WSU's AI advisor. Help students explore programs using the provided WSU data first. ` +
      `For current website information not covered by the provided context, use the available web search context or web_search tool before answering. ` +
      `Answer directly without narrating searches. Prefer official winona.edu sources and include markdown links when they help. ` +
      `Keep responses concise by default while still being helpful. Use exact program details from context, and prioritize giving a helpful answer. ` +
      `For university-specific questions, answer directly using the provided search evidence. Even if the evidence is not perfectly complete, provide the information you have. Do not refuse to answer or say you could not verify unless absolutely no information was found. ` +
      `If timing matters, briefly note the relevant date or timeframe. ` +
      contextSnippet;

    let preFetchedSearchContext = "";
    if (shouldUseWebSearch(userQuery, programContext, professorContext) && TAVILY_API_KEY) {
      try {
        preFetchedSearchContext = await runTavilySearch(userQuery);
        if (preFetchedSearchContext) {
          console.log(`Pre-fetched Tavily context for: ${userQuery}`);
        }
      } catch (error) {
        console.error("Pre-search Tavily error:", error);
      }
    }

    const systemInstruction = preFetchedSearchContext
      ? `${baseSystemInstruction}\n\n${preFetchedSearchContext}`
      : baseSystemInstruction;

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "web_search",
          description: "Searches the web for current information about Winona State University. Use this when asked about information not in the provided WSU data, such as tuition costs, admission requirements, campus events, deadlines, etc.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query. Include 'Winona State' or 'WSU' to get WSU-specific results."
              }
            },
            required: ["query"]
          }
        }
      }
    ];

    const shouldEnableToolSearch = !preFetchedSearchContext && !!TAVILY_API_KEY;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        ...trimmedHistory,
        { role: "user", content: userQuery },
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.7,
      tools: shouldEnableToolSearch ? tools : undefined,
      tool_choice: shouldEnableToolSearch ? "auto" : undefined
    });

    let responseText = trimToNaturalEnding(
      completion.choices[0]?.message?.content ?? "",
      completion.choices[0]?.finish_reason === "length"
    );
    const toolCalls = completion.choices[0]?.message?.tool_calls;

    // Handle web search function call
    if (toolCalls && toolCalls.length > 0) {
      const searchCall = toolCalls[0];
      if (searchCall.function.name === "web_search") {
        const args = JSON.parse(searchCall.function.arguments || "{}");
        const searchQuery = args.query || userQuery;

        if (TAVILY_API_KEY) {
          try {
            const searchContext = preFetchedSearchContext || await runTavilySearch(searchQuery);

            if (searchContext) {

              // Make a second API call with the search results
              const followUp = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  { role: "system", content: systemInstruction },
                  ...trimmedHistory,
                  { role: "user", content: userQuery },
                  { role: "assistant", content: null, tool_calls: [searchCall] },
                  { role: "tool", content: searchContext, tool_call_id: searchCall.id }
                ],
                max_tokens: MAX_OUTPUT_TOKENS,
                temperature: 0.7
              });

              responseText = trimToNaturalEnding(
                followUp.choices[0]?.message?.content || "I found some information but couldn't process it properly.",
                followUp.choices[0]?.finish_reason === "length"
              );
            } else {
              responseText = "I searched the WSU website but couldn't find a clear answer. Please check the official Winona State site at [winona.edu](https://www.winona.edu/) for the most current details.";
            }
          } catch (error) {
            console.error("Tavily search error:", error);
            responseText = "I wasn't able to search for that information right now. For current details, please visit the official Winona State website at [winona.edu](https://www.winona.edu/).";
          }
        } else {
          // No Tavily API key configured
          responseText = `For current information about ${searchQuery.toLowerCase()}, I recommend visiting the official Winona State University website at [winona.edu](https://www.winona.edu/) or contacting the admissions office directly.`;
        }
      }
    } else if (!responseText && preFetchedSearchContext) {
      const followUp = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction },
          ...trimmedHistory,
          { role: "user", content: userQuery }
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7
      });

      responseText = trimToNaturalEnding(
        followUp.choices[0]?.message?.content || "",
        followUp.choices[0]?.finish_reason === "length"
      );

      if (!responseText) {
        responseText = "I found some WSU website information but couldn't turn it into a clean answer. Please try rephrasing your question.";
      }
    } else if (!responseText) {
      responseText = "I'm sorry, I couldn't process that.";
    }


    // Smart cache storage with longer TTL for common patterns
    const isBadResponse = /I['’]?m sorry|I couldn['’]?t|I was(?:n['’]t| not) able to|I recommend checking the official|I cannot process/i.test(responseText);

    if (redis && responseText && !isBadResponse) {
      try {
        const normalizedQuery = normalizeQuery(userQuery);
        const cacheKey = `chat_cache:${Buffer.from(normalizedQuery).toString('base64').slice(0, 40)}`;

        // Longer cache for common question patterns (24 hours vs 1 hour)
        const isCommonQuestion = /cost|tuition|fees|admission|deadline|program|major|housing|financial aid/i.test(normalizedQuery);
        const ttl = isTimeSensitive
          ? 60 * 60 * 3 // 3 hours
          : isCommonQuestion
            ? 60 * 60 * 24 * 7 // 7 days
            : 60 * 60 * 24; // 24 hours

        await redis.set(cacheKey, responseText, { ex: ttl });
        console.log(`Cached response for: ${normalizedQuery} (TTL: ${ttl}s)`);
      } catch (e) {
        console.error("Cache set error:", e);
      }
    }

    return res.status(200).json({ text: responseText });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    // Return the actual error message if possible for debugging
    const message = error instanceof Error ? error.message : "An internal server error occurred.";
    return res.status(500).json({ error: `Server Error: ${message}` });
  }
}
