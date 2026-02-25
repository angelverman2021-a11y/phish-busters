// Scam Escape Room - Endless Runner Game
function startScamEscapeRoom() {
  const obstacles = [
    { type: 'email', text: 'URGENT: Account suspended!', action: 'jump', bias: 'Urgency', explanation: 'Urgency creates panic and bypasses rational thinking', xp: 10, height: 60 },
    { type: 'link', text: 'amaz0n-verify.com', action: 'duck', bias: 'Fake Domain', explanation: 'Typosquatting mimics legitimate domains', xp: 15, height: 40 },
    { type: 'otp', text: 'Share OTP to verify', action: 'verify', bias: 'Credential Theft', explanation: 'Real services never ask for OTP via message', xp: 20, height: 50 },
    { type: 'kyc', text: 'Complete KYC NOW', action: 'jump', bias: 'Fear + Urgency', explanation: 'Combines fear and urgency to force action', xp: 25, height: 65 },
    { type: 'call', text: 'Bank calling: Share CVV', action: 'verify', bias: 'Authority Impersonation', explanation: 'Banks never call asking for sensitive details', xp: 30, height: 55 },
    { type: 'prize', text: 'You won ₹50,000!', action: 'duck', bias: 'Reward Manipulation', explanation: 'Too good to be true offers exploit greed', xp: 15, height: 45 },
    { type: 'aadhaar', text: 'Aadhaar deactivated', action: 'jump', bias: 'Identity Threat', explanation: 'Government impersonation to steal data', xp: 20, height: 60 }
  ];

  const powerUps = [
    { type: 'shield', name: 'Fact Check Shield', duration: 5000, color: '#ffaa00' },
    { type: 'scanner', name: 'Hover Scanner', duration: 5000, color: '#00eaff' },
    { type: 'clear', name: 'Call Bank', duration: 0, color: '#00ff88' }
  ];

  let level = 1, score = 0, health = 3, combo = 0, speed = 5, distance = 0, survivalTime = 0;
  let playerY = 200, playerState = 'normal';
  let currentObstacle = null, powerUpList = [], activePowerUps = {};
  let gameRunning = true, paused = false, gameStarted = false;
  let mistakeTypes = {}, canvas, ctx;
  let startTime = Date.now();
  const playerSpeed = 5;
  let obstacleCleared = false;
  let clearDelay = 0;
  let playerMovementHistory = [];
  let optimalMovementHistory = [];

  showStartScreen();

  function showStartScreen() {
    const modal = createGameModal('🎮 Scam Escape Room', `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:64px;margin-bottom:20px;">🎮</div>
        <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin-bottom:20px;">Endless Runner Mode</h2>
        <p style="color:#ccc;font-size:16px;margin-bottom:30px;">Dodge scam obstacles by moving up and down!</p>
        
        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:1px solid #00eaff;margin-bottom:20px;text-align:left;">
          <h3 style="color:#00eaff;margin-bottom:15px;">🎮 Controls</h3>
          <p style="color:#fff;margin:8px 0;"><kbd>↑</kbd> Move Up</p>
          <p style="color:#fff;margin:8px 0;"><kbd>↓</kbd> Move Down</p>
          <p style="color:#fff;margin:8px 0;"><kbd>Space</kbd> Verify - Check suspicious traps</p>
        </div>

        <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ff3b3b;margin-bottom:20px;">
          <p style="color:#ff3b3b;font-weight:bold;margin-bottom:8px;">⚠️ Power-Ups</p>
          <p style="color:#ccc;font-size:14px;">🛡️ Shield | 🔍 Scanner | 📞 Call Bank</p>
        </div>

        <button class="phish-continue-btn" id="start-game-btn">Start Game</button>
      </div>
    `);

    const closeBtn = modal.querySelector('.phish-close-btn');
    if (closeBtn) closeBtn.onclick = () => modal.remove();

    document.getElementById('start-game-btn').onclick = () => {
      modal.remove();
      startGame();
    };
  }

  function startGame() {
    gameStarted = true;
    startTime = Date.now();
    renderGame();
    document.addEventListener('keydown', handleInput);
    document.addEventListener('keyup', handleKeyUp);
    updateGame();
  }

  function renderGame() {
    const modal = createGameModal('🎮 Scam Escape Room', `
    <canvas id="runner-canvas" width="600" height="400" style="background:#0f0f0f;border:2px solid #00eaff;border-radius:8px;"></canvas>
    <div style="margin-top:15px;display:flex;justify-content:space-between;color:#fff;">
      <div>❤️ Health: <span id="runner-health">3</span></div>
      <div>🎯 Score: <span id="runner-score">0</span></div>
      <div>🔥 Combo: <span id="runner-combo">0</span></div>
      <div>📈 Level: <span id="runner-level">1</span></div>
      <div>⏱️ Time: <span id="runner-time">0s</span></div>
    </div>
    <div style="margin-top:10px;color:#00eaff;font-size:13px;text-align:center;">
      <kbd>↑</kbd> Move Up | <kbd>↓</kbd> Move Down | <kbd>Space</kbd> Verify
    </div>
    <div id="runner-feedback" style="margin-top:10px;min-height:40px;background:#1a1a1a;padding:10px;border-radius:6px;color:#fff;text-align:center;">Ready to start!</div>
    <div id="powerup-display" style="margin-top:10px;display:flex;gap:10px;justify-content:center;"></div>
  `);

    canvas = document.getElementById('runner-canvas');
    ctx = canvas.getContext('2d');
    
    document.querySelector('.phish-close-btn').onclick = () => {
      gameRunning = false;
      document.removeEventListener('keydown', handleInput);
      document.removeEventListener('keyup', handleKeyUp);
      modal.remove();
    };
  }

  function handleInput(e) {
    if (!gameRunning || paused) return;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      playerY = Math.max(50, playerY - 40);
      playerMovementHistory.push(playerY);
      if (playerMovementHistory.length > 100) playerMovementHistory.shift();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      playerY = Math.min(240, playerY + 40);
      playerMovementHistory.push(playerY);
      if (playerMovementHistory.length > 100) playerMovementHistory.shift();
    } else if (e.key === ' ') {
      e.preventDefault();
      checkAction('verify');
    }
  }

  function handleKeyUp(e) {
    e.preventDefault();
  }

  function spawnObstacle() {
    if (!gameRunning || currentObstacle) return;
    
    const obs = obstacles[Math.floor(Math.random() * obstacles.length)];
    const spawnY = 60 + Math.random() * 180;
    
    currentObstacle = {
      ...obs,
      x: 600,
      y: spawnY,
      width: 60,
      height: 50,
      vx: -speed,
      vy: 0,
      angle: 0
    };
    
    if (Math.random() < 0.2 && powerUpList.length === 0) {
      const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
      const py = 60 + Math.random() * 180;
      powerUpList.push({ ...powerUp, x: 600, y: py, vx: -speed * 0.7, vy: 0, width: 35, height: 35 });
    }
  }

  function checkAction(action) {
    if (!currentObstacle) return;
    
    const playerX = 80;
    const playerSize = 60;
    const playerCenter = { x: playerX + playerSize/2, y: playerY + playerSize/2 };
    const obsCenter = { x: currentObstacle.x + currentObstacle.width/2, y: currentObstacle.y + currentObstacle.height/2 };
    const dist = Math.sqrt(Math.pow(obsCenter.x - playerCenter.x, 2) + Math.pow(obsCenter.y - playerCenter.y, 2));
    
    if (dist > 200) return;

    if (currentObstacle.action === action) {
      score += currentObstacle.xp;
      combo++;
      if (combo % 5 === 0) score += 50;
      showFeedback(`✓ Correct! +${currentObstacle.xp} XP`, '#00ff88');
      currentObstacle = null;
    } else {
      takeDamage(currentObstacle);
      currentObstacle = null;
    }
  }

  function checkCollision() {
    if (!currentObstacle) return;
    
    const playerX = 80;
    const playerSize = 60;
    const playerCenter = { x: playerX + playerSize/2, y: playerY + playerSize/2 };
    
    const obsCenter = { x: currentObstacle.x + currentObstacle.width/2, y: currentObstacle.y + currentObstacle.height/2 };
    const distance = Math.sqrt(Math.pow(obsCenter.x - playerCenter.x, 2) + Math.pow(obsCenter.y - playerCenter.y, 2));
    
    if (distance < (currentObstacle.width/2 + playerSize/2 - 10)) {
      if (activePowerUps.shield) {
        activePowerUps.shield = null;
        showFeedback('🛡️ Shield absorbed hit!', '#ffaa00');
        currentObstacle = null;
      } else {
        takeDamage(currentObstacle);
        currentObstacle = null;
      }
    }

    powerUpList.forEach(p => {
      const pCenter = { x: p.x + p.width/2, y: p.y + p.height/2 };
      const distance = Math.sqrt(Math.pow(pCenter.x - playerCenter.x, 2) + Math.pow(pCenter.y - playerCenter.y, 2));
      
      if (distance < 45) {
        activatePowerUp(p);
        powerUpList = powerUpList.filter(pw => pw !== p);
      }
    });
  }

  function takeDamage(obs) {
    health--;
    combo = 0;
    mistakeTypes[obs.type] = (mistakeTypes[obs.type] || 0) + 1;
    document.getElementById('runner-health').textContent = health;
    
    if (health <= 0) {
      endGame();
      return;
    }

    paused = true;
    showEducationalPanel(obs);
  }

  function showEducationalPanel(obs) {
    const panel = document.createElement('div');
    panel.id = 'edu-panel';
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a1a;padding:30px;border-radius:12px;border:2px solid #ff3b3b;z-index:9999999;max-width:400px;';
    panel.innerHTML = `
      <h3 style="color:#ff3b3b;margin-bottom:15px;">⚠️ ${obs.bias}</h3>
      <p style="color:#fff;margin-bottom:10px;font-weight:bold;">"${obs.text}"</p>
      <div style="background:#2a2a2a;padding:15px;border-radius:8px;margin:15px 0;">
        <p style="color:#00eaff;font-weight:bold;margin-bottom:8px;">🚩 Red Flag:</p>
        <p style="color:#ccc;font-size:14px;">${obs.explanation}</p>
      </div>
      <p style="color:#888;font-size:13px;margin-bottom:15px;">Correct action: ${obs.action.toUpperCase()}</p>
      <button class="phish-continue-btn" id="resume-btn">Continue</button>
    `;
    document.body.appendChild(panel);

    const resumeBtn = document.getElementById('resume-btn');
    resumeBtn.onclick = () => {
      const existingPanel = document.getElementById('edu-panel');
      if (existingPanel) existingPanel.remove();
      paused = false;
    };
  }

  function activatePowerUp(p) {
    if (p.type === 'shield') {
      activePowerUps.shield = Date.now() + p.duration;
      showFeedback('🛡️ Shield Active!', p.color);
    } else if (p.type === 'scanner') {
      activePowerUps.scanner = Date.now() + p.duration;
      showFeedback('🔍 Scanner Active!', p.color);
    } else if (p.type === 'clear') {
      currentObstacle = null;
      showFeedback('📞 Obstacle Cleared!', p.color);
    }
    updatePowerUpDisplay();
  }

  function updatePowerUpDisplay() {
    const display = document.getElementById('powerup-display');
    if (!display) return;
    
    display.innerHTML = '';
    Object.entries(activePowerUps).forEach(([type, expiry]) => {
      if (expiry && expiry > Date.now()) {
        const remaining = Math.ceil((expiry - Date.now()) / 1000);
        display.innerHTML += `<span style="background:#1a1a1a;padding:8px 12px;border-radius:6px;border:1px solid #00eaff;color:#00eaff;font-size:12px;">${type === 'shield' ? '🛡️' : '🔍'} ${remaining}s</span>`;
      }
    });
  }

  function showFeedback(msg, color) {
    const fb = document.getElementById('runner-feedback');
    if (fb) {
      fb.textContent = msg;
      fb.style.color = color;
    }
  }

  function updateGame() {
    if (!gameRunning) return;

    distance++;
    survivalTime = Math.floor((Date.now() - startTime) / 1000);
    score += 1;

    if (distance % 400 === 0) {
      level++;
      speed += 0.6;
      clearDelay = Math.max(10, clearDelay - 3);
      document.getElementById('runner-level').textContent = level;
      showFeedback(`🎉 Level ${level}! Faster & Closer!`, '#00eaff');
    }

    if (currentObstacle) {
      currentObstacle.x += currentObstacle.vx;
      
      // Calculate optimal position
      const optimalY = currentObstacle.y;
      optimalMovementHistory.push(optimalY);
      if (optimalMovementHistory.length > 100) optimalMovementHistory.shift();
      
      if (currentObstacle.x < -100) {
        currentObstacle = null;
        obstacleCleared = true;
        combo++;
        score += 5;
      }
    } else if (obstacleCleared) {
      clearDelay--;
      if (clearDelay <= 0) {
        obstacleCleared = false;
        clearDelay = Math.max(10, 30 - (level * 3));
        spawnObstacle();
      }
    } else {
      spawnObstacle();
    }
    
    powerUpList.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
    });
    powerUpList = powerUpList.filter(p => p.x > -50);

    checkCollision();
    render();

    document.getElementById('runner-score').textContent = score;
    document.getElementById('runner-combo').textContent = combo;
    document.getElementById('runner-time').textContent = survivalTime + 's';
    updatePowerUpDisplay();

    if (!paused) requestAnimationFrame(updateGame);
    else setTimeout(() => requestAnimationFrame(updateGame), 100);
  }

  function render() {
    ctx.clearRect(0, 0, 600, 400);
    
    // Animated cyber background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 600, 400);
    
    // Moving grid lines
    ctx.strokeStyle = '#00eaff';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15;
    const offset = (distance % 50);
    for (let i = -50; i < 600; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i + offset, 0);
      ctx.lineTo(i + offset, 400);
      ctx.stroke();
    }
    for (let i = -50; i < 400; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i + offset);
      ctx.lineTo(600, i + offset);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Glowing particles
    ctx.fillStyle = '#00eaff';
    for (let i = 0; i < 5; i++) {
      const x = (distance * 2 + i * 120) % 600;
      const y = 50 + Math.sin(distance * 0.02 + i) * 30;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Ground with glow
    const gradient = ctx.createLinearGradient(0, 300, 0, 400);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 300, 600, 100);
    
    ctx.strokeStyle = '#00eaff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00eaff';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(600, 300);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Game rules below the line
    ctx.fillStyle = '#00eaff';
    ctx.font = '12px Arial';
    ctx.globalAlpha = 0.7;
    ctx.fillText('1. Move Up/Down to dodge scams', 20, 330);
    ctx.fillText('2. Press Space to verify suspicious traps', 20, 350);
    ctx.fillText('3. Collect power-ups for shields & scanners', 20, 370);
    ctx.globalAlpha = 1;
    
    // Movement frequency graph box
    const graphX = 380;
    const graphY = 315;
    const graphW = 200;
    const graphH = 70;
    
    // Box background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.strokeStyle = '#00eaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(graphX, graphY, graphW, graphH);
    
    // Title
    ctx.fillStyle = '#00eaff';
    ctx.font = '10px Arial';
    ctx.fillText('Movement Analysis', graphX + 5, graphY + 12);
    
    // Draw optimal path (red)
    if (optimalMovementHistory.length > 1) {
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      optimalMovementHistory.forEach((y, i) => {
        const x = graphX + 10 + (i / optimalMovementHistory.length) * (graphW - 20);
        const normalizedY = graphY + graphH - 10 - ((y - 50) / 190) * (graphH - 30);
        if (i === 0) ctx.moveTo(x, normalizedY);
        else ctx.lineTo(x, normalizedY);
      });
      ctx.stroke();
    }
    
    // Draw player path (blue)
    if (playerMovementHistory.length > 1) {
      ctx.strokeStyle = '#00eaff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      playerMovementHistory.forEach((y, i) => {
        const x = graphX + 10 + (i / playerMovementHistory.length) * (graphW - 20);
        const normalizedY = graphY + graphH - 10 - ((y - 50) / 190) * (graphH - 30);
        if (i === 0) ctx.moveTo(x, normalizedY);
        else ctx.lineTo(x, normalizedY);
      });
      ctx.stroke();
    }
    
    // Legend
    ctx.fillStyle = '#00eaff';
    ctx.fillRect(graphX + 5, graphY + graphH - 8, 8, 3);
    ctx.fillStyle = '#fff';
    ctx.font = '8px Arial';
    ctx.fillText('You', graphX + 15, graphY + graphH - 5);
    
    ctx.fillStyle = '#ff3b3b';
    ctx.fillRect(graphX + 45, graphY + graphH - 8, 8, 3);
    ctx.fillStyle = '#fff';
    ctx.fillText('Optimal', graphX + 55, graphY + graphH - 5);
    
    // Player (larger size)
    const playerSize = 60;
    const img = new Image();
    img.src = chrome.runtime.getURL('assets/icons/icon2.png');
    ctx.drawImage(img, 80, playerY, playerSize, playerSize);
    
    // Shield effect
    if (activePowerUps.shield && activePowerUps.shield > Date.now()) {
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffaa00';
      ctx.beginPath();
      ctx.arc(80 + playerSize/2, playerY + playerSize/2, playerSize/2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Current obstacle
    if (currentObstacle) {
      const o = currentObstacle;
      const isScanned = activePowerUps.scanner && activePowerUps.scanner > Date.now();
      
      ctx.save();
      ctx.translate(o.x + o.width/2, o.y + o.height/2);
      
      // Circular obstacle background
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(0, 0, o.width/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Border glow
      ctx.strokeStyle = isScanned ? (o.action === 'verify' ? '#ff0000' : '#ffaa00') : '#ff3b3b';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(0, 0, o.width/2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Icon
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#ff3b3b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons = { email: '📧', link: '🔗', otp: '🔐', kyc: '📋', call: '📞', prize: '🎁', aadhaar: '🆔' };
      ctx.fillText(icons[o.type] || '⚠️', 0, 0);
      
      ctx.restore();
    }
    
    // Power-ups
    powerUpList.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.font = '18px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(p.type === 'shield' ? '🛡️' : p.type === 'scanner' ? '🔍' : '📞', p.x + p.width/2, p.y + p.height/2 + 6);
      ctx.textAlign = 'left';
    });
  }

  function endGame() {
    gameRunning = false;
    document.removeEventListener('keydown', handleInput);
    document.removeEventListener('keyup', handleKeyUp);
    updateUserStats(score);
    
    const mostFrequentMistake = Object.entries(mistakeTypes).sort((a, b) => b[1] - a[1])[0];
    const accuracy = Math.round((combo / (distance / 10)) * 100) || 0;
    
    const modal = document.getElementById('phish-game-modal');
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:#0f0f0f;color:#fff;max-height:80vh;overflow-y:auto;">
          <h2 style="color:#ff3b3b;text-shadow:0 0 15px #ff3b3b;margin-bottom:20px;">🎮 Game Over</h2>
          
          <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:2px solid #00eaff;margin-bottom:20px;">
            <div style="font-size:48px;color:#00ff88;margin-bottom:10px;">${score} XP</div>
            <p style="color:#00eaff;font-size:18px;">Survival Time: ${survivalTime}s</p>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #555;margin-bottom:15px;">
            <h3 style="color:#00eaff;margin-bottom:10px;">📊 Performance Report</h3>
            <p style="color:#ccc;margin:5px 0;">📈 Level Reached: ${level}</p>
            <p style="color:#ccc;margin:5px 0;">🎯 Accuracy: ${accuracy}%</p>
            <p style="color:#ccc;margin:5px 0;">🔥 Best Combo: ${combo}</p>
            <p style="color:#ccc;margin:5px 0;">📏 Distance: ${Math.floor(distance / 10)}m</p>
          </div>

          ${mostFrequentMistake ? `
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ff3b3b;margin-bottom:15px;">
            <h3 style="color:#ff3b3b;margin-bottom:10px;">⚠️ Most Frequent Mistake</h3>
            <p style="color:#fff;font-size:16px;margin-bottom:5px;">${mostFrequentMistake[0].toUpperCase()}</p>
            <p style="color:#888;font-size:13px;">Failed ${mostFrequentMistake[1]} times</p>
          </div>
          ` : ''}

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;margin-bottom:20px;">
            <h3 style="color:#00ff88;margin-bottom:10px;">💡 Training Recommendation</h3>
            <p style="color:#ccc;font-size:14px;">
              ${mostFrequentMistake ? `Focus on identifying ${mostFrequentMistake[0]} scams. Practice recognizing their patterns.` : 'Great job! Keep practicing to improve your reaction time.'}
            </p>
          </div>

          <div style="display:flex;gap:10px;">
            <button class="phish-continue-btn" id="restart-btn" style="flex:1;">Play Again</button>
            <button class="phish-continue-btn" id="menu-btn" style="flex:1;background:#1a1a1a;border:2px solid #00eaff;">Main Menu</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('restart-btn').onclick = () => {
      modal.remove();
      startScamEscapeRoom();
    };

    document.getElementById('menu-btn').onclick = () => {
      modal.remove();
    };
  }
}
