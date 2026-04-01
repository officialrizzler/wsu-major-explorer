import OpenAI from "openai";
import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

let redis: Redis | null = null;
if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });
  } catch (e) {
    console.error("Failed to initialize Redis:", e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  if (!openai) {
    return res.status(500).json({ error: "AI comparison is not configured on the server." });
  }

  try {
    const { programs } = req.body;
    if (!programs || !Array.isArray(programs) || programs.length < 2 || programs.length > 4) {
      return res.status(400).json({ error: "Please provide exactly 2 to 4 programs for comparison." });
    }

    // Generate a deterministic cache key based on the sorted program names
    const programNames = programs.map((p: any) => p.program_name).sort().join("|");
    const cacheKey = `ai_compare:${Buffer.from(programNames).toString("base64")}`;

    if (redis) {
      try {
        const cached = await redis.get<string>(cacheKey);
        if (cached) {
          console.log(`Cache hit for comparison: ${programNames}`);
          return res.status(200).json({ text: cached });
        }
      } catch (e) {
        console.error("Cache read error:", e);
      }
    }

    const systemInstruction = `You are a thoughtful Winona State University academic advisor helping a student choose between specific programs.
Your job is to COMPARE the selected programs against each other, not to merely restate catalog facts the student can already read in a table.
Write in smooth, direct paragraphs with occasional short bullet points only when they make the comparison clearer.
Use **bold** sparingly for key distinctions.
Focus on higher-value guidance such as:
- how the programs differ in academic focus, skill development, and day-to-day coursework style
- what type of student tends to thrive in each option
- what kinds of career directions, work environments, or next steps each program opens up
- when continuing education, licensure, certifications, internships, or graduate study may matter
- practical tradeoffs or questions a student should think through before choosing
Do not pretend the programs are identical.
Do not give the same generic comparison every time.
Ground your answer in the actual programs provided, make meaningful distinctions, and help the student understand why someone might choose one over another.
Avoid a long intro or outro. Start with the comparison itself.`;

    const userQuery = `Please compare these following Winona State programs:
${programs.map((p: any) => `- ${p.program_name} (${p.degree_type}): ${p.short_description || "No description provided."} Credits: ${p.program_credits || "Varies"}`).join("\n")}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userQuery }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "Sorry, I could not generate a comparison at this time.";

    // Cache the result for 30 days (2592000 seconds) since program data rarely changes
    if (redis && responseText) {
      try {
        await redis.set(cacheKey, responseText, { ex: 2592000 });
        console.log(`Cached response for comparison: ${programNames}`);
      } catch (e) {
        console.error("Cache write error:", e);
      }
    }

    return res.status(200).json({ text: responseText });
  } catch (error: any) {
    console.error("Error in /api/compare:", error);
    return res.status(500).json({ error: `Server Error: ${error.message}` });
  }
}
