/**
 * Shared Warrior Bot / Tavily helpers for api/chat.ts (Vercel) and server.js (local).
 * Bump AI_CACHE_VERSION (or set env AI_CACHE_VERSION) after prompt or search-logic changes to invalidate Redis.
 */

export const AI_CACHE_VERSION = String(process.env.AI_CACHE_VERSION || "5").replace(/[^a-zA-Z0-9._-]/g, "") || "5";

/**
 * Plain "who is the X advisor" often ranks poorly vs. how WSU titles pages ("Academic advising", "Department contacts").
 * Expand with generic page-intent words — not specific names or hardcoded advisors.
 */
export function buildTavilySearchQuery(userQuery) {
  const raw = String(userQuery || "").trim();
  let q = buildWsuSearchQuery(raw);

  const advisorIntent =
    /\b(advisor|advisors|advising|advise|who\s+is|who\s+are|who\s+should|who\s+do\s+i\s+(talk|speak|see|ask|contact)|whom\s+should|assigned\s+advisor|academic\s+advisor)\b/i.test(
      raw,
    );
  if (advisorIntent && !/\bacademic\s+advising|department\s+contact|faculty\s+staff|directory\b/i.test(q)) {
    q = `${q} Winona State academic advising department faculty staff contact`.trim();
  }

  return q;
}

export function buildWsuSearchQuery(query) {
  if (/winona state|wsu|winona\.edu/i.test(query)) {
    return query.trim();
  }
  return `Winona State University site:winona.edu ${query}`.trim();
}

export function isTimeSensitiveQuery(query) {
  return /\b(latest|current|currently|today|now|right now|this year|this semester|this fall|this spring|up to date|updated|as of|2025|2026|2027|deadline|deadlines|tuition|cost|fees|housing|admission|admissions|requirements|application|calendar|event|events|start date|semester|fafsa|scholarship|financial aid)\b/i.test(
    query,
  );
}

export function isLikelyUniversitySpecificQuestion(query) {
  return /\b(wsu|winona state|university|campus|department|program|major|minor|housing|residence|admission|admissions|financial aid|tuition|fees|deadline|requirements|advisor|professor|faculty|student services|dorm|meal plan|visit|tour|catalog|registrar|bursar)\b/i.test(
    query,
  );
}

/** Skip Tavily for obvious greetings — saves quota. */
export function isChitchatQuery(query) {
  const q = String(query || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s']/g, "");
  if (q.length === 0) return true;
  if (q.length > 80) return false;
  if (/^(yes|no|yep|yeah|nah|nope)\.?$/i.test(q)) return true;
  return /^(hi|hey|hello|yo|sup|thanks|thank you|thx|ok|okay|cool|great|nice|bye|goodbye|good morning|good afternoon)\b/.test(
    q,
  );
}

export function extractQueryTerms(query) {
  return Array.from(
    new Set(
      String(query)
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length >= 4)
        .filter(
          (term) =>
            ![
              "winona",
              "state",
              "university",
              "with",
              "from",
              "what",
              "when",
              "where",
              "which",
              "about",
              "that",
              "this",
              "have",
              "does",
              "been",
              "were",
              "many",
              "much",
              "they",
              "their",
              "there",
            ].includes(term),
        ),
    ),
  ).slice(0, 8);
}

export function scoreSearchResult(result, queryTerms) {
  const haystack = `${result.title || ""} ${result.url || ""} ${result.content || ""}`.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    if (haystack.includes(term)) score += 2;
  }
  if (/winona\.edu|winonastate\.edu/i.test(result.url || "")) score += 2;
  const titleOrUrl = `${result.title || ""} ${result.url || ""}`;
  if (/housing|residence|admission|tuition|financial aid|program|department|student|catalog|registrar/i.test(titleOrUrl))
    score += 1;
  if (/advis|chair|coordinator|director|faculty|directory|contact|meet\s+the|staff/i.test(titleOrUrl)) score += 2;
  if (/advis|chair|coordinator|directory|contact|staff/i.test(String(result.content || "").slice(0, 400))) score += 1;
  return score;
}

/**
 * When to pre-fetch Tavily (before first model call). Broad enough to ground most WSU questions;
 * chitchat excluded to save API calls.
 */
export function shouldPrefetchWebSearch(userQuery, programContext, professorContext) {
  if (isChitchatQuery(userQuery)) return false;

  const query = userQuery.toLowerCase();
  const hasProgramMatches = Array.isArray(programContext) && programContext.length > 0;
  const hasProfessorMatches = Array.isArray(professorContext) && professorContext.length > 0;

  const currentInfoPattern =
    /tuition|cost|fees|deadline|application|admission|housing|meal plan|financial aid|scholarship|visit|tour|parking|calendar|semester|start date|campus|dorm|residence life|email|phone|address|hours|requirements|gpa|transfer|international|fafsa|test optional|event|policy|refund|withdraw|credit hour|per credit|advisor|advising|who\s+is|who\s+are/i;
  const factualPattern =
    /\b(what|when|where|why|how|who|how much|how many|can i|could i|should i|do i|does|is there|are there|tell me|explain|describe|need to know|looking for|interested in|thinking about|information about|sign up|register|enroll|orientation|offer|offered|available)\b/i;

  if (isTimeSensitiveQuery(userQuery) || currentInfoPattern.test(query)) return true;
  if (factualPattern.test(query)) return true;
  if (/\?/.test(userQuery)) return true;
  if (isLikelyUniversitySpecificQuestion(userQuery)) return true;

  // User is asking about academics but we didn't match a program string — still worth grounding on winona.edu
  if (/program|major|minor|degree|course|class|credit|graduate|undergrad|department/i.test(query)) return true;

  // Short messages without clear intent: still search if we have no local program/professor context
  if (!hasProgramMatches && !hasProfessorMatches && userQuery.trim().length > 12) return true;

  return false;
}

/** Shorter TTLs = fresher answers; version prefix avoids stale cache after you change prompts. */
export function getTavilyCacheTtlSec(query, searchMode) {
  if (isTimeSensitiveQuery(query)) return 60 * 90; // 90 min
  if (searchMode === "high_accuracy") return 60 * 60 * 4; // 4 h
  return 60 * 60 * 12; // 12 h (was up to 7d)
}

export function getChatResponseCacheTtlSec(userQuery, normalizedQuery, isTimeSensitive) {
  if (isTimeSensitive) return 60 * 60 * 2; // 2 h if we ever read cache for semi-static (we usually skip read)
  const n = `${normalizedQuery} ${userQuery}`.toLowerCase();
  const isCommon = /cost|tuition|fees|admission|deadline|program|major|housing|financial aid|gpa|credit/i.test(n);
  if (isCommon) return 60 * 60 * 8; // 8 h (was 7d)
  return 60 * 60 * 4; // 4 h default (was 24h)
}

export function normalizeChatCacheQuery(query) {
  return String(query)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/winona state university|wsu|winona state/gi, "wsu")
    .replace(/how much does|what does|whats the cost|what is the cost/gi, "cost")
    .replace(/tuition|fees|price/gi, "cost");
}

export function chatResponseCacheKey(normalizedQuery) {
  const hash = Buffer.from(normalizedQuery).toString("base64").slice(0, 40);
  return `chat_cache:v${AI_CACHE_VERSION}:${hash}`;
}

export function tavilyResponseCacheKey(searchMode, normalizedQuery) {
  const hash = Buffer.from(normalizedQuery).toString("base64").slice(0, 40);
  return `tavily_cache:v${AI_CACHE_VERSION}:${searchMode}:${hash}`;
}

/**
 * Prefer winona.edu results that overlap the query; if filtering removes everything, fall back to
 * top official hits by Tavily score so we don't return empty context.
 */
export function pickOfficialTavilyResults(rawResults, queryTerms, searchMode) {
  const official = (r) => {
    const u = String(r.url || "").toLowerCase();
    return u.includes("winona.edu") || u.includes("winonastate.edu");
  };

  const officialRows = (rawResults || []).filter(official);
  const scored = officialRows.map((result) => ({
    result,
    overlap: scoreSearchResult(result, queryTerms),
    tavily: typeof result.score === "number" ? result.score : 0,
  }));

  const threshold = searchMode === "high_accuracy" ? 2 : 1;
  let picked = scored;
  if (queryTerms.length > 0) {
    picked = scored.filter(({ overlap }) => overlap >= threshold);
  }
  if (picked.length === 0 && scored.length > 0) {
    picked = [...scored].sort((a, b) => b.tavily - a.tavily || b.overlap - a.overlap).slice(0, searchMode === "high_accuracy" ? 5 : 4);
  }

  return picked.map((x) => x.result);
}
