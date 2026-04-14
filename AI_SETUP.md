# AI Advisor Setup Instructions

## Required Environment Variables

Add these to your Vercel project settings:

### 1. OpenAI API Key (Required)
```
OPENAI_API_KEY=sk-...your-key-here
```
Get from: https://platform.openai.com/api-keys

### 2. Upstash Redis (Required - for rate limiting)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```
Get from: https://upstash.com (free tier available)

### 3. Tavily Search API (Optional - enables web search)
```
TAVILY_API_KEY=tvly-...your-key-here
```
Get from: https://tavily.com
- Sign up for free account
- Get API key from dashboard
- Free tier: 1000 searches/month

## Rate Limiting

**STRICT ENFORCEMENT:**
- 15 messages per day per user (IP-based)
- Cannot be bypassed by clearing cookies/browser data
- Stored in Redis (persists across server restarts)
- Resets daily at midnight UTC

Current defaults in `/api/chat.ts` (override with env vars):
- `RATE_LIMIT_MAX_REQUESTS` — 15 messages/day per IP
- `MAX_HISTORY_MESSAGES` — 4
- `MAX_INPUT_CHARS` — 2000
- `MAX_OUTPUT_TOKENS` — 512

### Cache invalidation (after prompt or search changes)

Redis keys are **versioned** so old answers are not reused after you improve the AI:

- Set in Vercel: `AI_CACHE_VERSION` to a new value (e.g. `6`) any time you change Warrior Bot instructions, Tavily query shaping, or cache TTL logic.
- Default in code is `5` until you bump it again after future changes.

Chat responses cache for **4–8 hours** (not days). Tavily snippets cache **90 minutes–12 hours** depending on query type.

## How Web Search Works

1. User asks: "How much does WSU cost?"
2. AI recognizes it needs current info
3. AI calls Tavily search: "Winona State tuition 2025"
4. Gets top 3 results from the web
5. AI synthesizes answer from search results

**Without Tavily API key:** Falls back to directing users to winona.edu

## Testing

Test rate limiting locally:
```bash
# Make 16 requests to trigger limit
for i in {1..16}; do curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"chatHistory": [], "userQuery": "test"}'; done
```

## Data Layer & Fit Traits

The application uses a two-tier data system for program insights ("Why this is/isn't for you"):

1. **Primary Data (`data/wsuData.ts`)**: Contains core program metadata. Generic traits have been removed to prioritize specialized insights.
2. **Specialized Insights (`utils/programFit.ts`)**: Contains unique `choose` and `avoid` traits for all 237 programs. This file acts as the source of truth for the "Fit" widgets.

### Maintenance
- **Overrides**: Use `programFitOverrides` in `utils/programFit.ts` for manual corrections.
- **Deduplication**: The `rawProgramFitTraits` object should contain one unique key per `program_id`.
- **Fallbacks**: If a program is missing from `programFit.ts`, the system falls back to `defaultTraits`.

## Testing
... (existing content)
