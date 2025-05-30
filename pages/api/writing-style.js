import { deductCredit, checkCredits } from '../../lib/utils'

export default async function handler(req, res) {
  // Common declarations
  const userId = req.headers['x-user-id'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const credits = checkCredits(userId)

  if (req.method === 'GET') {
    res.status(200).json({
      creditsRemaining: credits.credits,
      resetTime: credits.lastReset
    })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Check credits before processing POST request
  if (credits.credits <= 0) {
    res.status(429).json({
      error: 'Daily credit limit reached',
      creditsRemaining: credits.credits,
      resetTime: credits.lastReset
    })
    return
  }

  const { text, style } = req.body

  if (!text || typeof text !== 'string' || !style || typeof style !== 'string') {
    res.status(400).json({ error: 'Invalid input' })
    return
  }

  if (credits.credits <= 0) {
    res.status(429).json({
      error: 'Daily credit limit reached',
      creditsRemaining: credits.credits,
      resetTime: credits.lastReset
    })
    return
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'API key not configured' })
      return
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a writing assistant. Your ONLY task is to rewrite the provided text in the specified style: Professional, Casual, Social Media, Polite, Emojify, Funny, Sarcastic, Puns, Shorten, Proofread, or Supportive. DO NOT include any introductions, explanations, or comments. DO NOT say anything like "Heres your text" or "Sure". DO NOT wrap the text in quotes. ONLY return the rewritten version of the input text, NOTHING MORE.'
          },
          {
            role: 'user',
            content: `Style: ${style}\n\nText: ${text}`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      res.status(response.status).json({ error: errorText })
      return
    }

    const data = await response.json()

    // Assuming the API returns the styled text in data.choices[0].message.content
    const styledText = data.choices?.[0]?.message?.content || text
    // Only deduct credit after successful API response
    deductCredit(userId)
    const updatedCredits = checkCredits(userId)

    res.status(200).json({
      styledText,
      creditsRemaining: updatedCredits.credits,
      resetTime: updatedCredits.lastReset
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to process text' })
  }
}