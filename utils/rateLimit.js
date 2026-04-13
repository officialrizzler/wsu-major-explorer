import dotenv from "dotenv";
import { Redis } from "@upstash/redis";

dotenv.config({ path: ".env.local" });

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const DAILY_LIMIT = 15;
const BURST_LIMIT = 20;
const BURST_WINDOW_SEC = 600;
const MAX_CHARS = 6000;
const DAILY_LIMIT_MESSAGE = "You've reached the 15-message daily limit for Warrior Bot. Please come back tomorrow, or contact Winona State directly if you need immediate help.";

const COMPARE_DAILY_LIMIT = 20;
const COMPARE_DAILY_LIMIT_MESSAGE =
  "You've reached the daily limit of 20 AI program comparisons. Please try again tomorrow.";

export const redis = (REDIS_URL && REDIS_TOKEN) ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;
if (!redis) console.warn("Rate limiting disabled: Redis environment variables are missing.");

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return (req.ip || req.socket?.remoteAddress || "unknown").toString();
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Limits fresh AI comparison generations (not cache hits). Uses client IP as identity.
 * @returns {Promise<boolean>} false if response was already sent (429/503)
 */
export async function enforceCompareDailyLimit(req, res) {
  const ip = getClientIp(req);
  const day = todayKey();

  if (!redis) {
    console.warn("[rateLimit] Compare daily limit skipped: Redis environment variables are missing.");
    return true;
  }

  try {
    const dailyKey = `ai_compare:quota:${ip}:${day}`;
    const dailyCount = await redis.incr(dailyKey);
    if (dailyCount === 1) await redis.expire(dailyKey, 36 * 60 * 60);

    if (dailyCount > COMPARE_DAILY_LIMIT) {
      res.status(429).json({
        error: COMPARE_DAILY_LIMIT_MESSAGE,
        limit: COMPARE_DAILY_LIMIT,
        used: dailyCount,
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("[rateLimit] compare quota error:", err?.message || err);
    res.status(503).json({ error: "Rate limiter unavailable", detail: err?.message || String(err) });
    return false;
  }
}

export async function enforceAiLimits(req, res) {
  const ip = getClientIp(req);
  const day = todayKey();

  const msg = req.body?.message ?? req.body?.text ?? req.body?.userQuery ?? "";
  if (typeof msg === "string" && msg.length > MAX_CHARS) {
    res.status(413).json({ error: "Prompt too long", maxChars: MAX_CHARS });
    return false;
  }

  if (!redis) return true;

  try {
    const dailyKey = `ai:quota:${ip}:${day}`;
    const burstKey = `ai:burst:${ip}`;

    const dailyCount = await redis.incr(dailyKey);
    if (dailyCount === 1) await redis.expire(dailyKey, 36 * 60 * 60);

    if (dailyCount > DAILY_LIMIT) {
      res.status(429).json({
        error: DAILY_LIMIT_MESSAGE,
        limit: DAILY_LIMIT,
        used: dailyCount,
      });
      return false;
    }

    const burstCount = await redis.incr(burstKey);
    if (burstCount === 1) await redis.expire(burstKey, BURST_WINDOW_SEC);

    if (burstCount > BURST_LIMIT) {
      res.status(429).json({
        error: "Too many requests",
        windowSeconds: BURST_WINDOW_SEC,
        limit: BURST_LIMIT,
        used: burstCount,
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("[rateLimit] error:", err?.message || err);

    res.status(503).json({ error: "Rate limiter unavailable", detail: (err?.message || String(err)) });
    return false;
  }
}
