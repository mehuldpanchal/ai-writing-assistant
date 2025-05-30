import { checkCredits } from '../../lib/utils'

let creditStore = null;
try {
  creditStore = require('../../creditStore.json');
} catch {
  creditStore = {};
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(400).json({ error: 'Missing user ID' });
    return;
  }

  // Reset credits for the user
  if (!creditStore[userId]) {
    creditStore[userId] = { credits: 10, lastReset: Date.now() };
  } else {
    creditStore[userId].credits = 10;
    creditStore[userId].lastReset = Date.now();
  }

  // Save to file (sync for simplicity)
  const fs = require('fs');
  fs.writeFileSync(
    require('path').resolve(process.cwd(), 'creditStore.json'),
    JSON.stringify(creditStore, null, 2)
  );

  const credits = checkCredits(userId);
  res.status(200).json({
    creditsRemaining: credits.credits,
    resetTime: credits.lastReset
  });
}