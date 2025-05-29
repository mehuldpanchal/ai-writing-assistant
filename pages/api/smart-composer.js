/**
 * API route for Smart Composer to call Deepseek LLM.
 * Uses the prompt format: "Write a [tone] message for [format] based on the following input: [user text]"
 * Requires DEEPSEEK_API_KEY in .env.local.
 */
import { deductCredit, checkCredits } from '../../lib/utils'

export default async function handler(req, res) {
  // Generate or retrieve persistent user ID from localStorage
  let userId = req.headers['x-user-id'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // In development, DO NOT override userId with a random value; use the one from header/localStorage

  if (req.method === "GET") {
    // Just return credits, do not deduct
    const credits = checkCredits(userId)
    return res.status(200).json({
      creditsRemaining: credits.smartComposerCredits,
      resetTime: credits.lastReset
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input, format, tone } = req.body;
  if (!input || !format || !tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check and deduct credit
  if (!deductCredit(userId, 'smartComposer')) {
    const credits = checkCredits(userId)
    return res.status(429).json({
      error: 'Daily credit limit reached',
      creditsRemaining: credits.smartComposerCredits,
      resetTime: credits.lastReset
    })
  }

  const prompt = `Compose a ${tone} message suitable for ${format} based on the following input: "${input}". Return only the final composed message. DO NOT include any introductions, greeting, explanations, or comments. DO NOT say anything like "Heres your text" or "Sure". DO NOT wrap the text in quotes. ONLY return the rewritten version of the input text, NOTHING MORE.`;


  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Example Deepseek LLM API call (replace with actual endpoint and payload as needed)
    const apiRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!apiRes.ok) {
      const err = await apiRes.json();
      return res.status(500).json({ error: err.error || "Deepseek API error" });
    }

    const data = await apiRes.json();
    const result = data.choices?.[0]?.message?.content || "";
    const credits = checkCredits(userId);
    return res.status(200).json({
      result,
      creditsRemaining: credits.smartComposerCredits,
      resetTime: credits.lastReset
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}