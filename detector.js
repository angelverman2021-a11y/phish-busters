// Phishing detection patterns (India-specific + common patterns)
const PHISHING_PATTERNS = {
  urgentWords: ['urgent', 'immediate', 'act now', 'verify now', 'suspended', 'locked', 'expires', 'limited time'],
  indianScams: ['kyc', 'aadhaar', 'pan card', 'upi', 'paytm', 'phonepe', 'gpay', 'refund', 'cashback'],
  moneyWords: ['prize', 'lottery', 'winner', 'claim', 'reward', 'free', 'congratulations'],
  threatWords: ['account blocked', 'legal action', 'arrest', 'police', 'court', 'fine'],
  suspicious: ['click here', 'verify account', 'confirm identity', 'update details', 'reset password']
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scanSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
      analyzeText(selectedText);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No text selected' });
    }
  }
});

// Auto-detect suspicious content on page load
window.addEventListener('load', () => {
  createFloatingButton();
  setTimeout(autoDetectSuspiciousContent, 2000);
});

// Create floating button
function createFloatingButton() {
  const floatingBtn = document.createElement('div');
  floatingBtn.id = 'phish-floating-btn';
  
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('assets/icons/icon8.png');
  img.style.width = '65px';
  img.style.height = '65px';
  floatingBtn.appendChild(img);
  
  floatingBtn.title = 'Phish Busters - Open Dashboard';
  floatingBtn.onclick = () => {
    showDashboardModal();
  };
  
  document.body.appendChild(floatingBtn);
}

// Show dashboard modal
function showDashboardModal() {
  const existing = document.getElementById('phish-dashboard-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'phish-dashboard-modal';
  modal.innerHTML = `
    <div class="phish-modal-overlay">
      <div class="phish-dashboard-content">
        <div class="phish-modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${chrome.runtime.getURL('assets/icons/icon8.png')}" alt="Logo" style="width: 85px; height: 85px;">
            <div>
              <h2>Phish Busters</h2>
              <p id="user-name-display" style="color:#00eaff;font-size:16px;font-weight:bold;margin-top:5px;cursor:pointer;" title="Click to change name">Loading...</p>
            </div>
          </div>
          <button class="phish-close-btn">&times;</button>
        </div>
        
        <div class="phish-dashboard-stats" id="dashboard-stats">
          <div class="stat-item">
            <div class="stat-label">Rank</div>
            <div class="stat-value" id="modal-rank">Loading...</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">XP</div>
            <div class="stat-value" id="modal-xp">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value" id="modal-accuracy">0%</div>
          </div>
        </div>

        <div class="phish-actions">
          <button class="phish-action-btn" id="full-threat-scan-btn">
            🔍 Full Threat Scan
          </button>
        </div>

        <div class="game-modes">
          <h3 style="margin:20px 0 10px;text-align:center;color:#333;">🎮 Game Modes</h3>
          <button class="game-mode-btn" id="phish-vs-legit-btn">
            ⚡ Phish vs Legit
          </button>
          <button class="game-mode-btn" id="build-scam-btn">
            🛠️ Build a Scam
          </button>
          <button class="game-mode-btn" id="escape-room-btn">
            🔐 Scam Escape Room
          </button>
          <button class="game-mode-btn" id="memory-match-btn">
            🧠 Memory Match
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  loadDashboardStats();
  loadUserName();

  document.querySelector('.phish-close-btn').onclick = () => modal.remove();
  
  document.getElementById('full-threat-scan-btn').onclick = () => {
    modal.remove();
    performFullThreatScan();
  };

  document.getElementById('phish-vs-legit-btn').onclick = () => {
    modal.remove();
    startPhishVsLegit();
  };

  document.getElementById('build-scam-btn').onclick = () => {
    modal.remove();
    startBuildAScam();
  };

  document.getElementById('escape-room-btn').onclick = () => {
    modal.remove();
    startScamEscapeRoom();
  };

  document.getElementById('memory-match-btn').onclick = () => {
    modal.remove();
    startMemoryMatch();
  };
}

// Helper function to create game modal
function createGameModal(title, content) {
  const existing = document.getElementById('phish-game-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'phish-game-modal';
  modal.innerHTML = `
    <div class="phish-modal-overlay">
      <div class="phish-modal-content">
        <div class="phish-modal-header">
          <h2>${title}</h2>
          <button class="phish-close-btn" onclick="this.closest('#phish-game-modal').remove()">&times;</button>
        </div>
        ${content}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// Load dashboard stats
async function loadDashboardStats() {
  const data = await chrome.storage.local.get(['userStats']);
  const stats = data.userStats || { xp: 0, totalScans: 0, correctGuesses: 0 };
  
  const ranks = [
    { name: 'Rookie', minXP: 0 },
    { name: 'Scout', minXP: 100 },
    { name: 'Detective', minXP: 250 },
    { name: 'Guardian', minXP: 500 },
    { name: 'Cyber Guardian', minXP: 1000 }
  ];
  
  const rank = ranks.reverse().find(r => stats.xp >= r.minXP) || ranks[0];
  const accuracy = stats.totalScans > 0 ? Math.round((stats.correctGuesses / stats.totalScans) * 100) : 0;
  
  document.getElementById('modal-rank').textContent = rank.name;
  document.getElementById('modal-rank').style.cursor = 'pointer';
  document.getElementById('modal-rank').onclick = () => showRankingSystem(stats.xp, ranks.reverse());
  document.getElementById('modal-xp').textContent = stats.xp;
  document.getElementById('modal-accuracy').textContent = accuracy + '%';
}

function showRankingSystem(currentXP, ranks) {
  const currentRank = ranks.reverse().find(r => currentXP >= r.minXP) || ranks[0];
  const nextRank = ranks.find(r => r.minXP > currentXP);
  const xpNeeded = nextRank ? nextRank.minXP - currentXP : 0;
  
  const modal = document.createElement('div');
  modal.id = 'rank-modal';
  modal.innerHTML = `
    <div class="phish-modal-overlay" style="z-index:10000000;">
      <div class="phish-modal-content" style="max-width:500px;">
        <div class="phish-modal-header">
          <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;">🏆 Ranking System</h2>
          <button class="phish-close-btn" id="close-rank-modal">&times;</button>
        </div>
        
        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:2px solid #00eaff;margin-bottom:20px;text-align:center;">
          <div style="font-size:48px;margin-bottom:10px;">🎖️</div>
          <h3 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin-bottom:10px;">Current Rank: ${currentRank.name}</h3>
          <p style="color:#00ff88;font-size:24px;font-weight:bold;text-shadow:0 0 10px #00ff88;">${currentXP} XP</p>
          ${nextRank ? `
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid #333;">
              <p style="color:#ccc;margin-bottom:8px;">Next Rank: <span style="color:#00eaff;font-weight:bold;">${nextRank.name}</span></p>
              <p style="color:#ffc107;font-size:18px;font-weight:bold;">${xpNeeded} XP needed</p>
              <div style="background:#2a2a2a;height:20px;border-radius:10px;overflow:hidden;margin-top:10px;">
                <div style="height:100%;background:linear-gradient(90deg,#00eaff,#00ff88);width:${((currentXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP) * 100)}%;transition:width 0.3s;"></div>
              </div>
            </div>
          ` : '<p style="color:#00ff88;margin-top:15px;font-weight:bold;">🎉 Maximum Rank Achieved!</p>'}
        </div>

        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:1px solid #555;">
          <h3 style="color:#fff;margin-bottom:15px;">📊 All Ranks</h3>
          ${ranks.reverse().map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;margin:8px 0;background:${currentXP >= r.minXP ? '#2a2a2a' : '#1a1a1a'};border-radius:6px;border:1px solid ${currentXP >= r.minXP ? '#00eaff' : '#333'};">
              <div>
                <span style="color:${currentXP >= r.minXP ? '#00eaff' : '#888'};font-weight:bold;font-size:16px;">${r.name}</span>
                ${currentRank.name === r.name ? '<span style="color:#00ff88;margin-left:10px;font-size:12px;">← You are here</span>' : ''}
              </div>
              <span style="color:${currentXP >= r.minXP ? '#00ff88' : '#666'};font-weight:bold;">${r.minXP}+ XP</span>
            </div>
          `).join('')}
        </div>

        <button class="phish-continue-btn" id="close-rank-btn" style="margin-top:20px;width:100%;">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('close-rank-modal').onclick = () => modal.remove();
  document.getElementById('close-rank-btn').onclick = () => modal.remove();
  document.querySelector('#rank-modal .phish-modal-overlay').onclick = (e) => {
    if (e.target.classList.contains('phish-modal-overlay')) modal.remove();
  };
}

// Auto-detect suspicious messages
function autoDetectSuspiciousContent() {
  const platform = detectPlatform();
  
  if (platform === 'gmail') {
    monitorGmail();
  } else if (platform === 'whatsapp') {
    monitorWhatsApp();
  }
}

// Detect which platform we're on
function detectPlatform() {
  const url = window.location.href;
  if (url.includes('mail.google.com')) return 'gmail';
  if (url.includes('web.whatsapp.com')) return 'whatsapp';
  if (url.includes('outlook')) return 'outlook';
  return 'unknown';
}

// Monitor Gmail for suspicious emails
function monitorGmail() {
  const observer = new MutationObserver(() => {
    const emailBody = document.querySelector('[data-message-id] .a3s');
    if (emailBody && !emailBody.dataset.scanned) {
      emailBody.dataset.scanned = 'true';
      const text = emailBody.innerText;
      const score = calculatePhishingScore(text);
      
      if (score > 3) {
        showQuickAlert(emailBody, score);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Monitor WhatsApp for suspicious messages
function monitorWhatsApp() {
  const observer = new MutationObserver(() => {
    const messages = document.querySelectorAll('[data-id^="true_"]');
    messages.forEach(msg => {
      if (!msg.dataset.scanned) {
        msg.dataset.scanned = 'true';
        const text = msg.innerText;
        const score = calculatePhishingScore(text);
        
        if (score > 3) {
          showQuickAlert(msg, score);
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Calculate phishing score
function calculatePhishingScore(text) {
  const lowerText = text.toLowerCase();
  let score = 0;

  // Check for patterns
  Object.values(PHISHING_PATTERNS).forEach(patterns => {
    patterns.forEach(pattern => {
      if (lowerText.includes(pattern)) score++;
    });
  });

  // Check for suspicious URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  urls.forEach(url => {
    if (url.includes('bit.ly') || url.includes('tinyurl') || url.length > 50) {
      score += 2;
    }
  });

  return score;
}

// Show quick alert badge
function showQuickAlert(element, score) {
  const badge = document.createElement('div');
  badge.className = 'phish-alert-badge';
  badge.innerHTML = `⚠️ Suspicious (${score})`;
  badge.onclick = () => analyzeText(element.innerText);
  
  element.style.position = 'relative';
  element.appendChild(badge);
}

// Perform comprehensive full threat scan
async function performFullThreatScan() {
  showScanningModal();
  
  const threats = {
    selectedText: null,
    pageContent: null,
    links: [],
    qrCodes: [],
    overallRisk: 'safe'
  };

  // 1. Check selected text
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    threats.selectedText = {
      text: selectedText.substring(0, 200),
      score: calculatePhishingScore(selectedText),
      flags: findRedFlags(selectedText)
    };
  }

  // 2. Scan page content
  const pageText = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button'))
    .map(el => el.textContent)
    .join(' ')
    .substring(0, 2000);
  threats.pageContent = {
    score: calculatePhishingScore(pageText),
    flags: findRedFlags(pageText)
  };

  // 3. Analyze all links
  const links = document.querySelectorAll('a[href]');
  links.forEach((link, i) => {
    if (i < 20) {
      const href = link.href;
      const isSuspicious = href.includes('bit.ly') || href.includes('tinyurl') || 
                          href.length > 100 || /[0-9]{10,}/.test(href);
      if (isSuspicious) {
        threats.links.push({
          url: href.substring(0, 80),
          reason: href.includes('bit.ly') ? 'Shortened URL' : 
                  href.length > 100 ? 'Unusually long URL' : 'Suspicious pattern'
        });
      }
    }
  });

  // 4. Scan for QR codes
  const images = document.querySelectorAll('img');
  images.forEach((img, i) => {
    if (i < 10 && (img.src.includes('qr') || img.alt.toLowerCase().includes('qr'))) {
      threats.qrCodes.push({
        src: img.src.substring(0, 80),
        note: 'QR code detected - verify before scanning'
      });
    }
  });

  // Calculate overall risk
  const totalScore = (threats.selectedText?.score || 0) + threats.pageContent.score;
  const totalFlags = (threats.selectedText?.flags.length || 0) + threats.pageContent.flags.length;
  const linkCount = threats.links.length;
  const qrCount = threats.qrCodes.length;
  
  if (totalScore >= 6 || totalFlags >= 3 || linkCount >= 3 || qrCount >= 2) {
    threats.overallRisk = 'high';
  } else if (totalScore >= 3 || totalFlags >= 1 || linkCount >= 1 || qrCount >= 1) {
    threats.overallRisk = 'suspicious';
  }

  showThreatReport(threats);
}

function showScanningModal() {
  const modal = document.createElement('div');
  modal.id = 'phish-scanning-modal';
  modal.innerHTML = `
    <div class="phish-modal-overlay">
      <div class="phish-modal-content" style="text-align:center;">
        <div style="font-size:64px;animation:spin 2s linear infinite;">🔍</div>
        <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin:20px 0;">Full Threat Scan</h2>
        <p style="color:#ccc;margin:10px 0;">Analyzing selected text...</p>
        <p style="color:#ccc;margin:10px 0;">Scanning page content...</p>
        <p style="color:#ccc;margin:10px 0;">Checking links...</p>
        <p style="color:#ccc;margin:10px 0;">Detecting QR codes...</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showThreatReport(threats) {
  const existing = document.getElementById('phish-scanning-modal');
  if (existing) existing.remove();

  const riskColors = {
    safe: { color: '#00ff88', icon: '✅', text: 'SAFE' },
    suspicious: { color: '#ffc107', icon: '⚠️', text: 'SUSPICIOUS' },
    high: { color: '#ff3b3b', icon: '🚨', text: 'HIGH RISK' }
  };

  const risk = riskColors[threats.overallRisk];

  const modal = document.createElement('div');
  modal.id = 'phish-game-modal';
  modal.innerHTML = `
    <div class="phish-modal-overlay">
      <div class="phish-modal-content" style="max-height:80vh;overflow-y:auto;">
        <div class="phish-modal-header">
          <h2>🔍 Full Threat Scan Report</h2>
          <button class="phish-close-btn" onclick="this.closest('#phish-game-modal').remove()">&times;</button>
        </div>

        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:2px solid ${risk.color};margin:20px 0;text-align:center;">
          <div style="font-size:48px;margin-bottom:10px;">${risk.icon}</div>
          <h3 style="color:${risk.color};text-shadow:0 0 10px ${risk.color};font-size:28px;">${risk.text}</h3>
        </div>

        ${threats.selectedText ? `
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin:15px 0;">
            <h4 style="color:#00eaff;margin-bottom:10px;">📝 Selected Text Analysis</h4>
            <p style="color:#ccc;font-size:14px;margin-bottom:10px;">${threats.selectedText.text}...</p>
            <p style="color:#fff;">Threat Score: <span style="color:${threats.selectedText.score >= 5 ? '#ff3b3b' : '#00ff88'};font-weight:bold;">${threats.selectedText.score}/10</span></p>
            ${threats.selectedText.flags.length > 0 ? `
              <div style="margin-top:10px;">
                <p style="color:#ff3b3b;font-weight:bold;margin-bottom:5px;">🚩 Red Flags:</p>
                <ul style="color:#ccc;margin-left:20px;">
                  ${threats.selectedText.flags.map(f => `<li>${f}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin:15px 0;">
          <h4 style="color:#00eaff;margin-bottom:10px;">📄 Page Content Analysis</h4>
          <p style="color:#fff;">Threat Score: <span style="color:${threats.pageContent.score >= 5 ? '#ff3b3b' : '#00ff88'};font-weight:bold;">${threats.pageContent.score}/10</span></p>
          ${threats.pageContent.flags.length > 0 ? `
            <div style="margin-top:10px;">
              <p style="color:#ff3b3b;font-weight:bold;margin-bottom:5px;">🚩 Red Flags:</p>
              <ul style="color:#ccc;margin-left:20px;">
                ${threats.pageContent.flags.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          ` : '<p style="color:#00ff88;margin-top:10px;">✅ No suspicious patterns detected</p>'}
        </div>

        ${threats.links.length > 0 ? `
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ff3b3b;margin:15px 0;">
            <h4 style="color:#ff3b3b;margin-bottom:10px;">🔗 Suspicious Links (${threats.links.length})</h4>
            ${threats.links.slice(0, 5).map(link => `
              <div style="background:#2a2a2a;padding:10px;border-radius:6px;margin:8px 0;">
                <p style="color:#ccc;font-size:12px;word-break:break-all;margin-bottom:5px;">${link.url}</p>
                <p style="color:#ff3b3b;font-size:13px;">⚠️ ${link.reason}</p>
              </div>
            `).join('')}
            ${threats.links.length > 5 ? `<p style="color:#888;margin-top:10px;">+${threats.links.length - 5} more suspicious links</p>` : ''}
          </div>
        ` : '<div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;margin:15px 0;"><h4 style="color:#00ff88;">🔗 Links: All Clear</h4><p style="color:#ccc;margin-top:10px;">No suspicious links detected</p></div>'}

        ${threats.qrCodes.length > 0 ? `
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ffc107;margin:15px 0;">
            <h4 style="color:#ffc107;margin-bottom:10px;">📱 QR Codes Detected (${threats.qrCodes.length})</h4>
            ${threats.qrCodes.map(qr => `
              <div style="background:#2a2a2a;padding:10px;border-radius:6px;margin:8px 0;">
                <p style="color:#ffc107;font-size:13px;">⚠️ ${qr.note}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin:15px 0;">
          <h4 style="color:#00eaff;margin-bottom:10px;">🛡️ Recommended Actions</h4>
          <ul style="color:#ccc;margin-left:20px;line-height:1.8;">
            ${threats.overallRisk === 'high' ? `
              <li>Do not interact with any links or forms on this page</li>
              <li>Close this page immediately</li>
              <li>Report this site to your security team</li>
              <li>Run a full antivirus scan</li>
            ` : threats.overallRisk === 'suspicious' ? `
              <li>Verify the website URL carefully</li>
              <li>Do not enter sensitive information</li>
              <li>Contact the organization directly through official channels</li>
              <li>Avoid clicking suspicious links</li>
            ` : `
              <li>Page appears safe, but stay vigilant</li>
              <li>Always verify sender identity</li>
              <li>Never share OTPs or passwords</li>
              <li>Check URLs before clicking</li>
            `}
          </ul>
        </div>

        <button class="phish-continue-btn" onclick="this.closest('#phish-game-modal').remove()">Close Report</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.querySelector('#phish-game-modal .phish-close-btn').onclick = () => modal.remove();
  document.querySelector('#phish-game-modal .phish-continue-btn').onclick = () => modal.remove();
  updateUserStats(true);
}

// Analyze text and show game modal
function analyzeText(text) {
  const score = calculatePhishingScore(text);
  const redFlags = findRedFlags(text);
  
  showGameModal(text, score, redFlags);
}

// Find specific red flags in text
function findRedFlags(text) {
  const flags = [];
  const lowerText = text.toLowerCase();

  if (PHISHING_PATTERNS.urgentWords.some(w => lowerText.includes(w))) {
    flags.push('Uses urgent language to pressure you');
  }
  if (PHISHING_PATTERNS.indianScams.some(w => lowerText.includes(w))) {
    flags.push('Mentions sensitive Indian services (KYC/UPI/Aadhaar)');
  }
  if (PHISHING_PATTERNS.threatWords.some(w => lowerText.includes(w))) {
    flags.push('Contains threats or legal warnings');
  }
  if (/(https?:\/\/[^\s]+)/.test(text)) {
    flags.push('Contains suspicious links');
  }
  if (/\d{10,}/.test(text)) {
    flags.push('Contains phone numbers or account numbers');
  }

  return flags;
}

// Show game modal
function showGameModal(text, score, redFlags) {
  // Remove existing modal
  const existing = document.getElementById('phish-game-modal');
  if (existing) existing.remove();

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'phish-game-modal';
  modal.innerHTML = `
    <div class="phish-modal-overlay">
      <div class="phish-modal-content">
        <div class="phish-modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${chrome.runtime.getURL('assets/icons/icon8.png')}" alt="Logo" style="width: 32px; height: 32px;">
            <h2>Spot the Phish!</h2>
          </div>
          <button class="phish-close-btn">&times;</button>
        </div>
        
        <div class="phish-timer">
          <span>Time: <span id="phish-timer-value">30</span>s</span>
        </div>

        <div class="phish-message-box">
          <p>${text.substring(0, 300)}${text.length > 300 ? '...' : ''}</p>
        </div>

        <div class="phish-question">
          <h3>Is this message safe?</h3>
          <div class="phish-options">
            <button class="phish-option safe" data-answer="safe">✅ Safe</button>
            <button class="phish-option suspicious" data-answer="suspicious">⚠️ Suspicious</button>
            <button class="phish-option phishing" data-answer="phishing">🚨 Phishing</button>
          </div>
        </div>

        <div class="phish-feedback" id="phish-feedback" style="display:none;">
          <h3 id="feedback-title"></h3>
          <div id="feedback-content"></div>
          <div class="phish-redflags" id="phish-redflags"></div>
          <button class="phish-continue-btn" id="phish-continue">Continue</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Start timer
  let timeLeft = 30;
  const timerInterval = setInterval(() => {
    timeLeft--;
    const timerEl = document.getElementById('phish-timer-value');
    if (timerEl) timerEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showFeedback('timeout', score, redFlags);
    }
  }, 1000);

  // Handle answer selection
  document.querySelectorAll('.phish-option').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(timerInterval);
      const answer = btn.dataset.answer;
      const correct = determineCorrectAnswer(score);
      showFeedback(answer, score, redFlags, correct);
      updateUserStats(answer === correct);
    });
  });

  // Close button
  document.querySelector('.phish-close-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    modal.remove();
  });

  // Continue button
  document.getElementById('phish-continue').addEventListener('click', () => {
    modal.remove();
  });
}

// Determine correct answer based on score
function determineCorrectAnswer(score) {
  if (score >= 5) return 'phishing';
  if (score >= 3) return 'suspicious';
  return 'safe';
}

// Show feedback
function showFeedback(userAnswer, score, redFlags, correctAnswer) {
  const feedbackDiv = document.getElementById('phish-feedback');
  const titleEl = document.getElementById('feedback-title');
  const contentEl = document.getElementById('feedback-content');
  const redFlagsEl = document.getElementById('phish-redflags');

  document.querySelector('.phish-question').style.display = 'none';
  feedbackDiv.style.display = 'block';

  const isCorrect = userAnswer === correctAnswer;
  const xpGained = isCorrect ? 20 : 5;

  if (isCorrect) {
    titleEl.textContent = '🎉 Correct!';
    titleEl.style.color = '#28a745';
    contentEl.innerHTML = `<p>Great job! You earned <strong>${xpGained} XP</strong>.</p>`;
  } else {
    titleEl.textContent = '❌ Not Quite';
    titleEl.style.color = '#dc3545';
    contentEl.innerHTML = `<p>The correct answer was: <strong>${correctAnswer}</strong>. You earned <strong>${xpGained} XP</strong> for trying.</p>`;
  }

  // Show red flags
  if (redFlags.length > 0) {
    redFlagsEl.innerHTML = `
      <h4>🚩 Red Flags Detected:</h4>
      <ul>${redFlags.map(flag => `<li>${flag}</li>`).join('')}</ul>
    `;
  }

  // Get AI analysis
  const messageText = document.querySelector('.phish-message-box p').textContent;
  chrome.runtime.sendMessage({
    action: 'analyzeWithAI',
    text: messageText
  }, (response) => {
    if (response && response.explanation) {
      contentEl.innerHTML += `<div style="margin-top:15px;padding:15px;background:#e7f3ff;border-radius:8px;"><strong>🤖 AI Analysis:</strong><br>${response.explanation}</div>`;
    }
  });
}

// Update user stats
async function updateUserStats(isCorrect) {
  const data = await chrome.storage.local.get(['userStats']);
  const stats = data.userStats || {
    xp: 0,
    totalScans: 0,
    phishingDetected: 0,
    correctGuesses: 0,
    incorrectGuesses: 0
  };

  stats.totalScans++;
  stats.xp += isCorrect ? 20 : 5;
  
  if (isCorrect) {
    stats.correctGuesses++;
  } else {
    stats.incorrectGuesses++;
  }

  await chrome.storage.local.set({ userStats: stats });
  
  // Notify popup to refresh
  chrome.runtime.sendMessage({ action: 'updateStats' });
}

// Show quick notification
function showQuickNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'phish-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}


async function loadUserName() {
  const data = await chrome.storage.local.get(['userName']);
  const userName = data.userName || null;
  const displayEl = document.getElementById('user-name-display');
  
  if (!displayEl) return;
  
  if (!userName) {
    displayEl.textContent = '👤 Click to set your name';
    displayEl.style.color = '#ffc107';
    promptUserName();
  } else {
    displayEl.textContent = `👤 ${userName}`;
    displayEl.style.color = '#00eaff';
  }
  
  displayEl.onclick = () => promptUserName();
}

function promptUserName() {
  const existing = document.getElementById('name-modal');
  if (existing) existing.remove();
  
  const nameModal = document.createElement('div');
  nameModal.id = 'name-modal';
  nameModal.innerHTML = `
    <div class="phish-modal-overlay" style="z-index:10000001;">
      <div class="phish-modal-content" style="max-width:400px;">
        <div class="phish-modal-header">
          <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;">👤 Set Your Name</h2>
          <button class="phish-close-btn" id="close-name-modal">&times;</button>
        </div>
        
        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:1px solid #00eaff;margin-bottom:20px;">
          <p style="color:#ccc;margin-bottom:15px;">Enter your name to personalize your profile:</p>
          <input type="text" id="user-name-input" placeholder="Enter your name" maxlength="20" style="width:100%;padding:12px;background:#2a2a2a;border:2px solid #00eaff;border-radius:6px;color:#fff;font-size:16px;" />
        </div>

        <button class="phish-continue-btn" id="save-name-btn" style="width:100%;">Save Name</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(nameModal);
  document.getElementById('user-name-input').focus();
  
  const saveName = async () => {
    const name = document.getElementById('user-name-input').value.trim();
    if (name) {
      await chrome.storage.local.set({ userName: name });
      nameModal.remove();
      loadUserName();
    }
  };
  
  document.getElementById('save-name-btn').onclick = saveName;
  document.getElementById('user-name-input').onkeypress = (e) => {
    if (e.key === 'Enter') saveName();
  };
  document.getElementById('close-name-modal').onclick = () => nameModal.remove();
}
