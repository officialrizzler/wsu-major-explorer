

import OpenAI from "openai";
import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import {
  buildTavilySearchQuery,
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
} from "../utils/advisorSearch.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const AI_ENABLED = process.env.AI_ENABLED ?? "true";

const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 15);
const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS ?? 2000);
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS ?? 512);
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

function needsGroundedFactAnswer(userQuery: string): boolean {
  const query = String(userQuery || "").toLowerCase();
  return (
    /\b(advisor|advisors|advising|contact|coordinator|director|chair|phone|email|office|accredited|accreditation|aacsb|deadline|tuition|cost|fees|requirements|policy|policies)\b/i.test(
      query,
    ) ||
    /\b(who|what|when|where|how much|is|are|does)\b/i.test(query)
  );
}

function isDeflectiveAnswer(text: string): boolean {
  return /\b(check|visit|refer to|recommend(?:ed)?\s+.*website|official site|contact admissions|please see|not in (?:the )?provided snippets|not specified in (?:the )?snippets)\b/i.test(
    String(text || ""),
  );
}

function isPeopleLookupQuestion(userQuery: string): boolean {
  const query = String(userQuery || "").trim();
  const lower = query.toLowerCase();
  const peopleIntent =
    /\b(faculty|professor|instructor|advisor|adviser|coordinator|director|dean|chair|staff|who is|who's|who are)\b/i.test(
      lower,
    );
  const hasLikelyName = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/.test(query);
  return peopleIntent || hasLikelyName;
}

function buildPeopleLookupQuery(userQuery: string): string {
  const cleaned = String(userQuery || "").replace(/[?]+/g, " ").replace(/\s+/g, " ").trim();
  return `${cleaned} Winona State faculty profile directory email phone office hours`;
}

function isSnippetMissingAnswer(text: string): boolean {
  return /\b(not in (?:the )?provided snippets|not specified in (?:the )?snippets|don'?t have (?:that|enough) information|couldn'?t find enough detail)\b/i.test(
    String(text || ""),
  );
}

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

async function runTavilySearch(query: string): Promise<string> {
  if (!TAVILY_API_KEY) {
    return "";
  }

  const searchMode: SearchMode =
    isTimeSensitiveQuery(query) || isLikelyUniversitySpecificQuestion(query)
      ? "high_accuracy"
      : "standard";

  const normalizedQuery = buildTavilySearchQuery(query).toLowerCase().replace(/\s+/g, " ").trim();
  const searchCacheKey = tavilyResponseCacheKey(searchMode, normalizedQuery);

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
        include_domains: [
          "winona.edu",
          "winonastate.edu",
          "catalog.winona.edu",
          "blogs.winona.edu",
          "library.winona.edu",
        ],
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

    const filteredResults = pickOfficialTavilyResults(rawResults, queryTerms, searchMode).slice(
      0,
      searchMode === "high_accuracy" ? 5 : TAVILY_MAX_RESULTS,
    );

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
        await redis.set(searchCacheKey, formatted, { ex: getTavilyCacheTtlSec(query, searchMode) });
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

    const isTimeSensitive = isTimeSensitiveQuery(userQuery);

    if (redis && !isTimeSensitive) {
      try {
        const normalizedForCache = normalizeChatCacheQuery(userQuery);
        const cacheKey = chatResponseCacheKey(normalizedForCache);
        const cached = await redis.get<string>(cacheKey);
        if (cached) {
          console.log(`Chat cache hit: ${cacheKey.slice(0, 24)}…`);
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

    const baseSystemInstruction =
      `You are Warrior Bot, WSU's AI advisor. Help students explore programs using the provided WSU data first. ` +
      `For anything factual about Winona State (policies, dates, costs, requirements, offerings, advising contacts) that is not explicitly in the provided context, you MUST rely on the web search context below and/or call the web_search tool — do not guess from general knowledge. ` +
      `When snippets include advising coordinators, faculty names, emails, phone numbers, or office locations, state them clearly and link to the page. Do not say the information is not specified if those details appear in the snippets (even briefly). ` +
      `Answer directly without narrating that you searched. Prefer official winona.edu / catalog links and cite them briefly in markdown when you use them. ` +
      `If the user asks for people/contacts/accreditation/status, start with the direct answer in the first sentence, then list key facts with citations. ` +
      `Never say "not in the provided snippets" to the user. If context is weak, provide the best verified details you do have and say what remains unconfirmed. ` +
      `If the search context includes a page that likely has the answer, extract what is known from the snippet itself before suggesting verification. Do not default to "check the page" when concrete facts are already present. ` +
      `If web snippets are incomplete, say what you can confirm from them and what students should double-check on the linked page. Only refuse if there is truly no relevant WSU information. ` +
      `If timing matters, note the timeframe or suggest confirming on the live site. ` +
      contextSnippet;

    const requiresGroundedFacts = needsGroundedFactAnswer(userQuery) || shouldPrefetchWebSearch(userQuery, programContext, professorContext);
    const canSearch = !!TAVILY_API_KEY;

    let preFetchedSearchContext = "";
    if (requiresGroundedFacts && canSearch) {
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
          description:
            "Search the official WSU web presence (winona.edu) for current, specific facts. Call this whenever the user asks for Winona State details that are not fully in the provided context (costs, deadlines, requirements, policies, contacts, dates, programs). Prefer queries that include 'Winona State' or 'WSU'.",
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

    const shouldEnableToolSearch =
      canSearch &&
      requiresGroundedFacts &&
      (!preFetchedSearchContext || preFetchedSearchContext.trim().length < 220);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        ...trimmedHistory,
        { role: "user", content: userQuery },
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.2,
      tools: shouldEnableToolSearch ? tools : undefined,
      tool_choice: shouldEnableToolSearch && !preFetchedSearchContext ? "required" : shouldEnableToolSearch ? "auto" : undefined
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
            let searchContext = preFetchedSearchContext;
            const normalizedUserQuery = userQuery.toLowerCase().replace(/\s+/g, " ").trim();
            const normalizedSearchQuery = String(searchQuery).toLowerCase().replace(/\s+/g, " ").trim();
            const shouldRefreshFromToolQuery =
              !searchContext ||
              searchContext.trim().length < 450 ||
              normalizedSearchQuery !== normalizedUserQuery;

            if (shouldRefreshFromToolQuery) {
              const refinedSearchContext = await runTavilySearch(searchQuery);
              if (refinedSearchContext) {
                searchContext = refinedSearchContext;
                preFetchedSearchContext = refinedSearchContext;
              }
            }

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
                temperature: 0.2
              });

              responseText = trimToNaturalEnding(
                followUp.choices[0]?.message?.content || "I found some information but couldn't process it properly.",
                followUp.choices[0]?.finish_reason === "length"
              );
            } else {
              responseText = "I couldn't find enough detail in the current WSU search snippets to give a reliable answer. If you want, I can try a narrower query (for example: department + advisor/contact page) and return exactly what I find.";
            }
          } catch (error) {
            console.error("Tavily search error:", error);
            responseText = "I couldn't complete live WSU lookup right now because search failed temporarily. Please retry in a moment, and I can provide the direct answer with citations.";
          }
        } else {
          // No Tavily API key configured
          responseText = `Live WSU fact lookup is currently unavailable because \`TAVILY_API_KEY\` is not configured on the server. Add that key to environment variables so I can answer questions like advisors/accreditation directly instead of redirecting to websites.`;
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
        temperature: 0.2
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

    if (
      requiresGroundedFacts &&
      canSearch &&
      isPeopleLookupQuestion(userQuery) &&
      (isSnippetMissingAnswer(responseText) || !preFetchedSearchContext)
    ) {
      try {
        const peopleSearchContext = await runTavilySearch(buildPeopleLookupQuery(userQuery));
        if (peopleSearchContext) {
          preFetchedSearchContext = peopleSearchContext;
          const peopleRetry = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "Answer the user's faculty/person lookup directly from WSU context. If a person is identified, state their role and contact details clearly with markdown links. If identity is still ambiguous, list the closest verified matches and what is confirmed.",
              },
              {
                role: "user",
                content: `Question:\n${userQuery}\n\nWSU search context:\n${peopleSearchContext}`,
              },
            ],
            max_tokens: MAX_OUTPUT_TOKENS,
            temperature: 0.1,
          });
          const retried = trimToNaturalEnding(
            peopleRetry.choices[0]?.message?.content ?? "",
            peopleRetry.choices[0]?.finish_reason === "length",
          );
          if (retried) {
            responseText = retried;
          }
        }
      } catch (error) {
        console.error("People lookup retry error:", error);
      }
    }

    if (requiresGroundedFacts && canSearch && preFetchedSearchContext && isDeflectiveAnswer(responseText)) {
      const rewrite = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Rewrite the assistant response to be direct and factual. Lead with the answer immediately, include concrete details from the provided WSU snippets, and cite pages with markdown links. Do not tell the user to just check a website unless a specific detail is missing from snippets.",
          },
          {
            role: "user",
            content: `User question:\n${userQuery}\n\nWSU snippets:\n${preFetchedSearchContext}\n\nDraft answer:\n${responseText}`,
          },
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.1,
      });
      const rewritten = trimToNaturalEnding(
        rewrite.choices[0]?.message?.content ?? "",
        rewrite.choices[0]?.finish_reason === "length",
      );
      if (rewritten) {
        responseText = rewritten;
      }
    }


    // Smart cache storage with longer TTL for common patterns
    const isBadResponse = /I['’]?m sorry|I couldn['’]?t|I was(?:n['’]t| not) able to|I recommend checking the official|I cannot process|not in (?:the )?provided snippets|not specified in (?:the )?snippets/i.test(responseText);

    if (redis && responseText && !isBadResponse) {
      try {
        const normalizedForCache = normalizeChatCacheQuery(userQuery);
        const cacheKey = chatResponseCacheKey(normalizedForCache);
        const ttl = getChatResponseCacheTtlSec(userQuery, normalizedForCache, isTimeSensitive);

        await redis.set(cacheKey, responseText, { ex: ttl });
        console.log(`Cached response ${cacheKey.slice(0, 28)}… TTL ${ttl}s`);
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
