// Background service worker for AI integration and message handling

// Groq API Configuration with LLaMA
// TODO: Add your Groq API key here (Get one free at https://console.groq.com)
const AI_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const AI_API_KEY = 'YOUR_GROQ_API_KEY_HERE'; // Replace with your actual API key

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeWithAI') {
    analyzeWithAI(message.text)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('AI analysis failed:', error);
        sendResponse(null);
      });
    return true; // Keep message channel open for async response
  }
});

// Analyze text with Groq LLaMA
async function analyzeWithAI(text) {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a phishing detection expert. Analyze messages and respond in JSON format with: {"isPhishing": boolean, "confidence": 0-1, "explanation": string, "redFlags": [string array]}'
          },
          {
            role: 'user',
            content: `Analyze this message for phishing: "${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) throw new Error('Groq API failed');

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return {
      isPhishing: aiResponse.isPhishing,
      confidence: aiResponse.confidence,
      explanation: aiResponse.explanation,
      redFlags: aiResponse.redFlags
    };

  } catch (error) {
    console.log('AI failed, using local analysis:', error);
    return localAnalysis(text);
  }
}

// Local rule-based analysis (fallback)
function localAnalysis(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const redFlags = [];

  // Check for urgent language
  const urgentWords = ['urgent', 'immediate', 'act now', 'verify now', 'suspended'];
  urgentWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 2;
      redFlags.push(`Contains urgent language: "${word}"`);
    }
  });

  // Check for Indian scam patterns
  const indianPatterns = ['kyc', 'aadhaar', 'pan card', 'upi'];
  indianPatterns.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      score += 2;
      redFlags.push(`Mentions sensitive service: "${pattern}"`);
    }
  });

  // Check for suspicious links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  if (urls.length > 0) {
    score += 1;
    redFlags.push(`Contains ${urls.length} link(s)`);
  }

  // Check for money/prize mentions
  const moneyWords = ['prize', 'lottery', 'winner', 'claim', 'reward'];
  moneyWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 2;
      redFlags.push(`Mentions rewards/prizes: "${word}"`);
    }
  });

  const confidence = Math.min(score / 10, 1);
  const isPhishing = score >= 5;

  return {
    isPhishing: isPhishing,
    confidence: confidence,
    explanation: isPhishing 
      ? 'This message shows multiple signs of phishing. Be cautious and verify the sender before taking any action.'
      : 'This message appears relatively safe, but always verify important requests through official channels.',
    redFlags: redFlags
  };
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Phish Busters extension installed');
  
  // Initialize default stats
  chrome.storage.local.get(['userStats'], (data) => {
    if (!data.userStats) {
      chrome.storage.local.set({
        userStats: {
          xp: 0,
          totalScans: 0,
          phishingDetected: 0,
          correctGuesses: 0,
          incorrectGuesses: 0
        }
      });
    }
  });
});

// Context menu for quick scan
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'scanText',
    title: 'Scan with Phish Busters',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scanText') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'scanSelectedText'
    });
  }
});
