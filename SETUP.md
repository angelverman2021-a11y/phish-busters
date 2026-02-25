# 🛡️ Phish Busters - Setup Instructions

## Prerequisites
- Node.js (v16+)
- MongoDB (running on localhost:27017)
- Logo file at: `/frontend/public/icon8/logo.png`

## Backend Setup

```bash
cd react-app/backend
npm install
node server.js
```

Server runs on: http://localhost:5000

## Frontend Setup

```bash
cd react-app/frontend
npm install
npm start
```

App runs on: http://localhost:3000

## Features Implemented

✅ Dark cyber theme with glowing effects
✅ Logo in navbar and favicon
✅ 15-second animated timer
✅ Streak system (+50 XP every 5 correct)
✅ Why-mode (reason selection, +10 XP)
✅ Clue system (-5 XP penalty)
✅ Difficulty levels (Easy/Medium/Hard)
✅ Animated risk meter
✅ XP formula: 20 - seconds_taken (min 5)
✅ Neon green for correct, neon red for wrong
✅ Cyan glowing for XP/streak
✅ Glowing borders and hover animations

## Theme Colors

- Background: #0f0f0f (dark gradient)
- Correct: #00ff88 (neon green)
- Wrong: #ff3b3b (neon red)
- XP/Streak: #00eaff (cyan)
- All text: white with glow effect

## API Endpoints

POST /api/game/get-question
POST /api/game/check-answer
POST /api/game/submit-reason
POST /api/game/get-clue

## MongoDB Schema

User model includes:
- username, email
- xp, rank, streak
- difficultyLevel
- mistakeHistory
- stats (totalGames, correctAnswers, cluesUsed, averageTime)

## Rank System

- Rookie: 0-100 XP
- Scout: 100-250 XP
- Detective: 250-500 XP
- Guardian: 500-1000 XP
- Cyber Guardian: 1000+ XP
