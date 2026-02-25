const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  rank: { type: String, default: 'Rookie' },
  streak: { type: Number, default: 0 },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  mistakeHistory: [{
    messageId: String,
    incorrectAnswer: String,
    correctAnswer: String,
    timestamp: { type: Date, default: Date.now }
  }],
  stats: {
    totalGames: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    cluesUsed: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Calculate rank based on XP
userSchema.methods.updateRank = function() {
  if (this.xp >= 1000) this.rank = 'Cyber Guardian';
  else if (this.xp >= 500) this.rank = 'Guardian';
  else if (this.xp >= 250) this.rank = 'Detective';
  else if (this.xp >= 100) this.rank = 'Scout';
  else this.rank = 'Rookie';
};

module.exports = mongoose.model('User', userSchema);
