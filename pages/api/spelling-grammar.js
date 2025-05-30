import { deductCredit, checkCredits } from '../../lib/utils'

export default async function handler(req, res) {
  // Generate or retrieve persistent user ID from localStorage
  let userId = req.headers['x-user-id'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // In development, DO NOT override userId with a random value; use the one from header/localStorage

  if (req.method === 'GET') {
    const credits = checkCredits(userId)
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

  const { text } = req.body

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Invalid text input' })
    return
  }

  // Check and deduct credit (userId already defined above)
  const credits = checkCredits(userId)
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

    console.log('Calling DeepSeek API with text:', text.substring(0, 50) + '...')
    let response
    try {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
              content: 'You are a grammar correction assistant. Return only the corrected version of the users text, with no explanation, greeting, or extra commentary. Output only the corrected text.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.2
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DeepSeek API error:', response.status, errorText)
        res.status(response.status).json({
          error: 'Grammar check service unavailable',
          details: errorText
        })
        return
      }

      const data = await response.json()
      console.log('DeepSeek API response:', data)

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API')
      }

      const correctedText = data.choices[0].message.content
      // Only deduct credit after successful API response
      deductCredit(userId)
      const updatedCredits = checkCredits(userId)

      res.status(200).json({
        correctedText,
        creditsRemaining: updatedCredits.credits,
        resetTime: updatedCredits.lastReset
      })
    } catch (innerError) {
      console.error('Inner API error:', innerError)
      throw innerError // Rethrow to outer catch
    }
  } catch (error) {
    console.error('Error in spelling-grammar API:', error)
    res.status(500).json({
      error: 'Failed to process text',
      details: error.message
    })
  }
}