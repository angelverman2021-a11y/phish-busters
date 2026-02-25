const express = require('express');
const router = express.Router();
const User = require('../models/UserMinimal');

// Message database
const messages = {
  easy: [
    { id: 1, text: "URGENT! Click now or account suspended!", isPhish: true, redFlags: ['urgency', 'suspicious_link'] },
    { id: 2, text: "Meeting at 3pm tomorrow", isPhish: false, redFlags: [] }
  ],
  medium: [
    { id: 3, text: "Your package failed. Update: amaz0n.com/track", isPhish: true, redFlags: ['suspicious_link'] },
    { id: 4, text: "Project deadline Friday", isPhish: false, redFlags: [] }
  ],
  hard: [
    { id: 5, text: "Verify transaction via secure link", isPhish: true, redFlags: ['asking_otp'] },
    { id: 6, text: "Order confirmed. Delivery Friday", isPhish: false, redFlags: [] }
  ]
};

// Check answer
router.post('/check-answer', async (req, res) => {
  const { userId, selectedId, timeTaken, clueUsed } = req.body;
  
  const user = await User.findById(userId);
  const allMsgs = [...messages.easy, ...messages.medium, ...messages.hard];
  const msg = allMsgs.find(m => m.id === selectedId);
  
  const isCorrect = msg?.isPhish;
  let xp = isCorrect ? Math.max(20 - timeTaken, 5) : 0;
  if (clueUsed) xp -= 5;
  
  user.streak = isCorrect ? user.streak + 1 : 0;
  const streakBonus = (user.streak % 5 === 0 && isCorrect) ? 50 : 0;
  xp += streakBonus;
  
  user.xp += xp;
  await user.save();
  
  res.json({ isCorrect, xp, streak: user.streak, streakBonus, redFlags: msg?.redFlags || [] });
});

// Submit reason
router.post('/submit-reason', async (req, res) => {
  const { userId, messageId, reason } = req.body;
  
  const user = await User.findById(userId);
  const allMsgs = [...messages.easy, ...messages.medium, ...messages.hard];
  const msg = allMsgs.find(m => m.id === messageId);
  
  const isCorrect = msg?.redFlags.includes(reason);
  const bonusXp = isCorrect ? 10 : 0;
  
  user.xp += bonusXp;
  await user.save();
  
  res.json({ isCorrect, bonusXp, explanation: isCorrect ? 'Correct!' : 'Try again' });
});

// Get clue
router.post('/get-clue', (req, res) => {
  res.json({ clue: 'Check for urgent language and suspicious links' });
});

module.exports = router;
