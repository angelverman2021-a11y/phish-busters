const User = require('../models/User');

const messages = {
  easy: [
    { id: 1, text: "URGENT: Your account will be suspended! Click here NOW!", isPhish: true, redFlags: ['urgency', 'suspicious_link'] },
    { id: 2, text: "Hi! Meeting at 3 PM tomorrow. See you!", isPhish: false, redFlags: [] }
  ],
  medium: [
    { id: 3, text: "Your package delivery failed. Update address: amaz0n-track.com", isPhish: true, redFlags: ['suspicious_link', 'grammar'] },
    { id: 4, text: "Reminder: Project deadline Friday. Let me know if you need help.", isPhish: false, redFlags: [] }
  ],
  hard: [
    { id: 5, text: "Dear customer, your recent transaction requires verification. Please confirm via the secure link provided.", isPhish: true, redFlags: ['asking_otp', 'suspicious_link'] },
    { id: 6, text: "Your order #12345 has been confirmed. Delivery expected by Friday.", isPhish: false, redFlags: [] }
  ]
};

exports.getQuestion = async (req, res) => {
  try {
    const { userId, difficulty = 'easy' } = req.body;
    const dataset = messages[difficulty];
    
    const msgA = dataset[Math.floor(Math.random() * dataset.length)];
    let msgB = dataset[Math.floor(Math.random() * dataset.length)];
    while (msgB.id === msgA.id) msgB = dataset[Math.floor(Math.random() * dataset.length)];

    res.json({ messageA: { id: msgA.id, text: msgA.text }, messageB: { id: msgB.id, text: msgB.text }, difficulty });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAnswer = async (req, res) => {
  try {
    const { userId, selectedId, timeTaken, clueUsed } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allMessages = [...messages.easy, ...messages.medium, ...messages.hard];
    const selected = allMessages.find(m => m.id === selectedId);
    const isCorrect = selected && selected.isPhish;

    let xp = 0;
    if (isCorrect) {
      xp = Math.max(20 - timeTaken, 5);
      if (clueUsed) xp -= 5;
      user.streak += 1;
      user.stats.correctAnswers += 1;
      if (user.streak % 5 === 0) xp += 50;
    } else {
      user.streak = 0;
      user.mistakeHistory.push({ messageId: selectedId, timestamp: new Date() });
    }

    user.xp += xp;
    user.stats.totalGames += 1;
    if (clueUsed) user.stats.cluesUsed += 1;
    user.updateRank();
    await user.save();

    res.json({
      isCorrect,
      xp,
      totalXp: user.xp,
      streak: user.streak,
      streakBonus: isCorrect && user.streak % 5 === 0 ? 50 : 0,
      rank: user.rank,
      redFlags: selected ? selected.redFlags : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitReason = async (req, res) => {
  try {
    const { userId, messageId, reason } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allMessages = [...messages.easy, ...messages.medium, ...messages.hard];
    const message = allMessages.find(m => m.id === messageId);
    const isCorrect = message && message.redFlags.includes(reason);
    
    let bonusXp = 0;
    if (isCorrect) {
      bonusXp = 10;
      user.xp += bonusXp;
      user.updateRank();
      await user.save();
    }

    res.json({
      isCorrect,
      bonusXp,
      totalXp: user.xp,
      explanation: isCorrect 
        ? `Correct! This message uses ${reason.replace('_', ' ')} to trick victims.`
        : `Not quite. The main red flag is: ${message.redFlags[0]}.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClue = async (req, res) => {
  try {
    const { messageId } = req.body;
    const clues = {
      1: "Look for urgent language and suspicious links",
      2: "This looks like a normal message",
      3: "Check the domain name carefully",
      4: "Professional work communication",
      5: "Banks never ask for verification via links",
      6: "Legitimate order confirmation"
    };
    res.json({ clue: clues[messageId] || "Check for red flags carefully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitRunnerScore = async (req, res) => {
  try {
    const { userId, score, level, distance, accuracy } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.xp += score;
    user.stats.totalGames += 1;
    if (level >= 5) user.stats.correctAnswers += 10;
    user.updateRank();
    await user.save();

    res.json({ totalXp: user.xp, rank: user.rank, levelReached: level });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
