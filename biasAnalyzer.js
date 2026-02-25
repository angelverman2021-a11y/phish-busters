const analyzeBiases = (scamMessage, target, tactic) => {
  const biases = [];
  const redFlags = [];
  const text = scamMessage.toLowerCase();
  let manipulationScore = 0;
  let detectabilityScore = 0;
  const tactics = [];

  // Fear Detection
  const fearWords = ['suspended', 'blocked', 'frozen', 'compromised', 'fraud', 'arrest', 'penalty', 'fine', 'legal action', 'terminate', 'stop'];
  const fearCount = fearWords.filter(word => text.includes(word)).length;
  if (fearCount > 0) {
    manipulationScore += fearCount * 15;
    detectabilityScore += fearCount * 10;
    tactics.push('Fear');
    redFlags.push('Threat-based tone');
    biases.push({
      type: 'Fear Appeal',
      icon: '😱',
      explanation: 'Uses threat-based manipulation to create panic, forcing quick decisions to avoid perceived negative consequences.',
      impact: 'High',
      defenseTip: 'Fear is a manipulation tool. Real problems are communicated officially, not through threatening messages.',
      color: '#e91e63'
    });
  }

  // Urgency Detection
  const urgencyWords = ['urgent', 'immediately', 'now', 'today', 'expires', 'limited time', 'hurry', 'act now', '24 hours', 'deadline', 'within', 'minutes'];
  const urgencyCount = urgencyWords.filter(word => text.includes(word)).length;
  if (urgencyCount > 0) {
    manipulationScore += urgencyCount * 12;
    detectabilityScore += urgencyCount * 8;
    tactics.push('Urgency');
    redFlags.push('Urgency language');
    biases.push({
      type: 'Urgency Bias',
      icon: '⏰',
      explanation: 'Creates artificial time pressure that reduces rational thinking and forces quick decisions without proper verification.',
      impact: 'High',
      defenseTip: 'Pause and verify. Legitimate organizations never force immediate action.',
      color: '#ff3b3b'
    });
  }

  // Authority Detection
  const authorityWords = ['bank', 'government', 'rbi', 'police', 'court', 'official', 'aadhaar', 'pan', 'tax', 'legal', 'compliance', 'mandate', 'income tax'];
  const authorityCount = authorityWords.filter(word => text.includes(word)).length;
  if (authorityCount > 0) {
    manipulationScore += authorityCount * 14;
    detectabilityScore += authorityCount * 5;
    tactics.push('Authority');
    redFlags.push('Authority impersonation');
    biases.push({
      type: 'Authority Bias',
      icon: '👮',
      explanation: 'Impersonates trusted institutions to exploit natural human tendency to comply with authority figures.',
      impact: 'High',
      defenseTip: 'Verify sender identity. Real authorities use official channels.',
      color: '#ffc107'
    });
  }

  // Reward Detection
  const rewardWords = ['won', 'prize', 'reward', 'cashback', 'free', 'bonus', 'gift', 'lottery', 'congratulations', 'winner', '₹', 'rs'];
  const rewardCount = rewardWords.filter(word => text.includes(word)).length;
  if (rewardCount > 0) {
    manipulationScore += rewardCount * 13;
    detectabilityScore += rewardCount * 12;
    tactics.push('Reward');
    redFlags.push('Reward trigger');
    biases.push({
      type: 'Reward Bias',
      icon: '🎁',
      explanation: 'Offers large rewards to trigger dopamine response and impulsive action.',
      impact: 'High',
      defenseTip: 'If you didn\'t enter a contest, you didn\'t win.',
      color: '#4caf50'
    });
  }

  // Scarcity Detection
  const scarcityWords = ['limited', 'only', 'last chance', 'few left', 'exclusive', 'rare'];
  const scarcityCount = scarcityWords.filter(word => text.includes(word)).length;
  if (scarcityCount > 0) {
    manipulationScore += scarcityCount * 10;
    detectabilityScore += scarcityCount * 7;
    tactics.push('Scarcity');
    redFlags.push('Scarcity effect');
  }

  // Detectability Factors
  if (/[a-z][A-Z]|\s{2,}|[.]{2,}/.test(scamMessage)) {
    detectabilityScore += 15;
    redFlags.push('Grammar mistakes');
  }

  if (text.includes('click') || text.includes('link') || text.includes('http')) {
    detectabilityScore += 12;
    redFlags.push('Suspicious link');
  }

  if (text.includes('otp') || text.includes('pin') || text.includes('password')) {
    detectabilityScore += 18;
    manipulationScore += 10;
    redFlags.push('Requests sensitive info');
  }

  if (text.includes('bit.ly') || text.includes('tinyurl')) {
    detectabilityScore += 20;
    redFlags.push('Shortened URL');
  }

  manipulationScore = Math.min(Math.max(manipulationScore, 0), 100);
  detectabilityScore = Math.min(Math.max(detectabilityScore, 0), 100);

  return { 
    biases, 
    manipulationScore: Math.round(manipulationScore),
    detectabilityScore: Math.round(detectabilityScore),
    redFlags: [...new Set(redFlags)],
    tactics: [...new Set(tactics)],
    redFlagCount: [...new Set(redFlags)].length
  };
};

exports.analyzeScam = async (req, res) => {
  try {
    const { userId, scamMessage, target, tactic } = req.body;
    const analysis = analyzeBiases(scamMessage, target, tactic);
    
    res.json({
      success: true,
      ...analysis,
      xp: Math.round(analysis.manipulationScore / 2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeBiases, analyzeScam: exports.analyzeScam };
