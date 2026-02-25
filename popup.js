// Rank system configuration
const RANKS = [
  { name: 'Rookie', minXP: 0, maxXP: 100 },
  { name: 'Scout', minXP: 100, maxXP: 250 },
  { name: 'Detective', minXP: 250, maxXP: 500 },
  { name: 'Guardian', minXP: 500, maxXP: 1000 },
  { name: 'Cyber Guardian', minXP: 1000, maxXP: Infinity }
];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserStats();
  setupEventListeners();
});

// Load user statistics from storage
async function loadUserStats() {
  const data = await chrome.storage.local.get(['userStats']);
  const stats = data.userStats || {
    xp: 0,
    totalScans: 0,
    phishingDetected: 0,
    correctGuesses: 0,
    incorrectGuesses: 0
  };

  updateUI(stats);
}

// Update UI with user stats
function updateUI(stats) {
  const rank = getRank(stats.xp);
  const accuracy = stats.totalScans > 0 
    ? Math.round((stats.correctGuesses / stats.totalScans) * 100) 
    : 0;

  document.getElementById('userRank').textContent = rank.name;
  document.getElementById('userXP').textContent = stats.xp;
  document.getElementById('userAccuracy').textContent = `${accuracy}%`;
  document.getElementById('totalScans').textContent = stats.totalScans;
  document.getElementById('phishingDetected').textContent = stats.phishingDetected;
  document.getElementById('correctGuesses').textContent = stats.correctGuesses;

  // Update progress bar
  const progressPercent = ((stats.xp - rank.minXP) / (rank.maxXP - rank.minXP)) * 100;
  document.getElementById('progressBar').style.width = `${Math.min(progressPercent, 100)}%`;
  document.getElementById('progressText').textContent = 
    `${stats.xp} / ${rank.maxXP === Infinity ? '∞' : rank.maxXP} XP to next rank`;
}

// Get rank based on XP
function getRank(xp) {
  return RANKS.find(rank => xp >= rank.minXP && xp < rank.maxXP) || RANKS[0];
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('scanSelectedText').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'scanSelectedText' }, (response) => {
      if (chrome.runtime.lastError) {
        alert('Please select text on a supported webpage (Gmail, WhatsApp Web, etc.)');
      }
    });
  });

  document.getElementById('viewHistory').addEventListener('click', () => {
    alert('History feature coming soon!');
  });
}

// Listen for stat updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStats') {
    loadUserStats();
  }
});
