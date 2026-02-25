// Optional Backend Server for AI Integration
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Phishing analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // TODO: Integrate with LLaMA-3 or other AI model
    // Example using Hugging Face API:
    /*
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3-8b', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `Analyze this message for phishing indicators: "${text}". 
                 Respond with: isPhishing (true/false), confidence (0-1), 
                 explanation (user-friendly), and redFlags (array).`
      })
    });
    const aiResult = await response.json();
    */

    // Fallback: Rule-based analysis
    const analysis = analyzeText(text);

    res.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Rule-based analysis function
function analyzeText(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const redFlags = [];

  // Phishing patterns
  const patterns = {
    urgent: ['urgent', 'immediate', 'act now', 'verify now', 'suspended', 'expires'],
    indian: ['kyc', 'aadhaar', 'pan card', 'upi', 'paytm', 'phonepe', 'gpay'],
    money: ['prize', 'lottery', 'winner', 'claim', 'reward', 'free', 'congratulations'],
    threats: ['blocked', 'legal action', 'arrest', 'police', 'court', 'fine'],
    suspicious: ['click here', 'verify account', 'confirm identity', 'update details']
  };

  // Check patterns
  Object.entries(patterns).forEach(([category, words]) => {
    words.forEach(word => {
      if (lowerText.includes(word)) {
        score += 2;
        redFlags.push(`${category}: "${word}"`);
      }
    });
  });

  // Check for URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  if (urls.length > 0) {
    score += urls.length;
    redFlags.push(`Contains ${urls.length} link(s)`);
  }

  // Check for phone numbers
  if (/\d{10,}/.test(text)) {
    score += 1;
    redFlags.push('Contains phone/account numbers');
  }

  const confidence = Math.min(score / 10, 1);
  const isPhishing = score >= 5;

  return {
    isPhishing,
    confidence: Math.round(confidence * 100) / 100,
    explanation: isPhishing
      ? 'This message shows multiple phishing indicators. Verify the sender through official channels before taking action.'
      : score >= 3
      ? 'This message has some suspicious elements. Exercise caution and verify before responding.'
      : 'This message appears relatively safe, but always verify important requests independently.',
    redFlags: redFlags.slice(0, 5) // Limit to top 5
  };
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Phish Busters API is running' });
});

app.listen(PORT, () => {
  console.log(`🛡️ Phish Busters API running on http://localhost:${PORT}`);
  console.log(`Test endpoint: POST http://localhost:${PORT}/api/analyze`);
});

// Example usage:
/*
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "URGENT: Your account will be suspended. Click here to verify now!"}'
*/
