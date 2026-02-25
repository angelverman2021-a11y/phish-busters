/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0f0f0f',
          darker: '#050505',
          correct: '#00ff88',
          wrong: '#ff3b3b',
          cyan: '#00eaff',
          purple: '#a855f7',
        }
      },
      boxShadow: {
        'glow-green': '0 0 10px #00ff88',
        'glow-red': '0 0 10px #ff3b3b',
        'glow-cyan': '0 0 10px #00eaff',
        'glow-white': '0 0 8px rgba(255,255,255,0.7)',
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
