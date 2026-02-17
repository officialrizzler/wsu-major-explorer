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

Current settings in `/api/chat.ts`:
```typescript
RATE_LIMIT_MAX_REQUESTS = 15  // Max messages per day
MAX_HISTORY_MESSAGES = 5      // Conversation memory (last 5 exchanges)
MAX_INPUT_CHARS = 1000        // Max question length
MAX_OUTPUT_TOKENS = 300       // Max response length
```

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

16th request should return 429 error.
