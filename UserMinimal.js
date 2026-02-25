const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  xp: { type: Number, default: 0 },
  rank: { type: String, default: 'Rookie' },
  streak: { type: Number, default: 0 },
  difficultyLevel: { type: String, default: 'easy' },
  mistakeHistory: [{ messageId: String, timestamp: Date }]
});

module.exports = mongoose.model('User', userSchema);
