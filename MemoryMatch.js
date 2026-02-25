// Memory Match with 3-Stage Boss Battle Mode
function startMemoryMatch() {
  let score = 0, moves = 0, bossHealth = 100, combo = 0, timeLeft = 150, stage = 1;
  let flipped = [], matched = [], cards = [], timerInterval = null;

  const stages = {
    1: { time: 150, pairs: 4, name: 'Basic Scams' },
    2: { time: 90, pairs: 6, name: 'Advanced Fraud' },
    3: { time: 60, pairs: 8, name: 'Expert Attacks' }
  };

  const scamPairs = {
    1: [
      { scam: '"Share OTP now"', flag: '🚩 Asks for OTP' },
      { scam: '"Click link urgently"', flag: '🚩 Urgency + Link' },
      { scam: '"You won prize"', flag: '🚩 Fake reward' },
      { scam: '"Account suspended"', flag: '🚩 Fear tactic' }
    ],
    2: [
      { scam: '"KYC verification needed"', flag: '🚩 Fake compliance' },
      { scam: '"UPI refund - enter PIN"', flag: '🚩 Credential theft' },
      { scam: '"Bank calling - share CVV"', flag: '🚩 Impersonation' },
      { attack: 'Social Engineering', defense: '✅ Verify independently' },
      { attack: 'Phishing link', defense: '✅ Don\'t click' },
      { scam: '"Tax refund pending"', flag: '🚩 Government scam' }
    ],
    3: [
      { scam: '"Aadhaar deactivated"', flag: '🚩 Identity threat' },
      { scam: '"Suspicious login detected"', flag: '🚩 Fake security alert' },
      { attack: 'Fake customer support', defense: '✅ Report and block' },
      { attack: 'Vishing call', defense: '✅ Hang up and verify' },
      { consequence: '💀 Account takeover', cause: 'Shared OTP' },
      { consequence: '💀 Money stolen', cause: 'Clicked phishing link' },
      { scam: '"Package delivery fee"', flag: '🚩 Fake courier' },
      { scam: '"Investment opportunity"', flag: '🚩 Financial scam' }
    ]
  };

  showStageIntro();

  function showStageIntro() {
    const stageData = stages[stage];
    const modal = createGameModal(`⚠️ STAGE ${stage}: ${stageData.name}`, `
      <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:2px solid #ff3b3b;margin:20px 0;">
        <h3 style="color:#ff3b3b;text-shadow:0 0 10px #ff3b3b;margin-bottom:15px;">🚨 BOSS BATTLE - STAGE ${stage}/3</h3>
        <p style="color:#fff;margin-bottom:10px;font-size:18px;">${stageData.name}</p>
        <p style="color:#00eaff;">Match ${stageData.pairs} scam patterns to defeat the boss!</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:20px 0;">
        <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ff3b3b;text-align:center;">
          <p style="color:#888;font-size:12px;">Boss Health</p>
          <p style="color:#ff3b3b;font-size:24px;font-weight:bold;text-shadow:0 0 10px #ff3b3b;">100%</p>
        </div>
        <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;text-align:center;">
          <p style="color:#888;font-size:12px;">Time Limit</p>
          <p style="color:#00eaff;font-size:24px;font-weight:bold;text-shadow:0 0 10px #00eaff;">${Math.floor(stageData.time/60)}:${(stageData.time%60).toString().padStart(2,'0')}</p>
        </div>
        <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;text-align:center;">
          <p style="color:#888;font-size:12px;">Difficulty</p>
          <p style="color:#00ff88;font-size:24px;font-weight:bold;text-shadow:0 0 10px #00ff88;">${stage === 1 ? 'Easy' : stage === 2 ? 'Hard' : 'Expert'}</p>
        </div>
      </div>
      <button class="phish-continue-btn" id="start-boss-btn">Start Defense</button>
    `);
    
    document.querySelector('.phish-close-btn').onclick = () => {
      if (timerInterval) clearInterval(timerInterval);
      modal.remove();
    };
    
    document.getElementById('start-boss-btn').onclick = function() {
      document.getElementById('phish-game-modal').remove();
      startBossFight();
    };
  }

  function startBossFight() {
    const stageData = stages[stage];
    bossHealth = 100;
    combo = 0;
    timeLeft = stageData.time;
    setupCards(stageData.pairs);
    renderGame();
    startTimer();
  }

  function setupCards(pairCount) {
    cards = [];
    const selected = scamPairs[stage].slice(0, pairCount);
    
    selected.forEach((pair, i) => {
      if (pair.scam && pair.flag) {
        cards.push({ id: i, text: pair.scam, type: 'scam' });
        cards.push({ id: i, text: pair.flag, type: 'flag' });
      } else if (pair.attack && pair.defense) {
        cards.push({ id: i, text: pair.attack, type: 'attack' });
        cards.push({ id: i, text: pair.defense, type: 'defense' });
      } else if (pair.consequence && pair.cause) {
        cards.push({ id: i, text: pair.consequence, type: 'consequence' });
        cards.push({ id: i, text: pair.cause, type: 'cause' });
      }
    });
    
    cards = cards.sort(() => Math.random() - 0.5);
    flipped = [];
    matched = [];
  }

  function renderGame() {
    const modal = createGameModal('🛡️ Boss Battle: OTP Scam Defense', `
      <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
        <div style="flex:1;background:#1a1a1a;padding:10px;border-radius:6px;border:1px solid #ff3b3b;">
          <p style="color:#888;font-size:11px;margin-bottom:5px;">Boss Health</p>
          <div style="height:16px;background:#333;border-radius:8px;overflow:hidden;">
            <div id="boss-health-bar" style="height:100%;background:#ff3b3b;width:${bossHealth}%;transition:width 0.5s;box-shadow:0 0 10px #ff3b3b;"></div>
          </div>
        </div>
        <div style="width:100px;background:#1a1a1a;padding:10px;border-radius:6px;border:1px solid #00eaff;text-align:center;">
          <p style="color:#888;font-size:11px;">Time</p>
          <p id="boss-timer" style="color:#00eaff;font-size:20px;font-weight:bold;text-shadow:0 0 10px #00eaff;">${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,'0')}</p>
        </div>
        <div style="width:80px;background:#1a1a1a;padding:10px;border-radius:6px;border:1px solid #00ff88;text-align:center;">
          <p style="color:#888;font-size:11px;">Combo</p>
          <p id="combo-count" style="color:#00ff88;font-size:20px;font-weight:bold;text-shadow:0 0 10px #00ff88;">${combo}</p>
        </div>
      </div>
      <div class="memory-grid" id="memory-grid" style="grid-template-columns:repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr);"></div>
      <div id="boss-feedback" style="min-height:40px;margin-top:15px;padding:10px;background:#1a1a1a;border-radius:6px;color:#00eaff;text-align:center;"></div>
    `);

    document.querySelector('.phish-close-btn').onclick = () => {
      if (timerInterval) clearInterval(timerInterval);
      modal.remove();
    };

    const grid = document.getElementById('memory-grid');
    cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = index;
      cardEl.innerHTML = `<div class="card-front">?</div><div class="card-back" style="font-size:${cards.length > 16 ? '11px' : '13px'};">${card.text}</div>`;
      cardEl.onclick = () => flipCard(index);
      grid.appendChild(cardEl);
    });
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      timeLeft--;
      const timerEl = document.getElementById('boss-timer');
      const modal = document.getElementById('phish-game-modal');
      
      if (timerEl) {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      }
      
      if (timeLeft <= 10 && timeLeft > 0) {
        const overlay = modal.querySelector('.phish-modal-overlay');
        if (overlay) {
          overlay.style.background = timeLeft % 2 === 0 ? 'rgba(255,0,0,0.4)' : 'rgba(0,0,0,0.7)';
          overlay.style.transition = 'background 0.3s';
        }
      }
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        bossFailed();
      }
    }, 1000);
  }

  function flipCard(index) {
    if (flipped.length >= 2 || flipped.includes(index) || matched.includes(index)) return;

    const grid = document.getElementById('memory-grid');
    const cardEl = grid.children[index];
    cardEl.classList.add('flipped');
    flipped.push(index);

    if (flipped.length === 2) {
      moves++;
      setTimeout(checkMatch, 800);
    }
  }

  function checkMatch() {
    const [idx1, idx2] = flipped;
    const card1 = cards[idx1];
    const card2 = cards[idx2];
    const grid = document.getElementById('memory-grid');

    if (card1.id === card2.id && card1.type !== card2.type) {
      matched.push(idx1, idx2);
      combo++;
      
      const damage = 10 + (combo > 1 ? combo * 5 : 0);
      score += damage;
      
      bossHealth = Math.max(0, bossHealth - damage);
      document.getElementById('boss-health-bar').style.width = bossHealth + '%';
      document.getElementById('combo-count').textContent = combo;
      showFeedback(`✅ Correct! -${damage} Boss HP ${combo > 1 ? '(Combo x' + combo + ')' : ''}`, '#00ff88');
      
      if (bossHealth <= 0) {
        clearInterval(timerInterval);
        setTimeout(stageComplete, 500);
        return;
      }
      
      if (matched.length === cards.length) {
        clearInterval(timerInterval);
        setTimeout(stageComplete, 500);
      }
    } else {
      combo = 0;
      grid.children[idx1].classList.remove('flipped');
      grid.children[idx2].classList.remove('flipped');
      
      if (moves >= 10) {
        bossHealth = Math.min(100, bossHealth + 5);
        document.getElementById('boss-health-bar').style.width = bossHealth + '%';
        showFeedback('❌ Wrong! +5% Boss HP, Combo reset', '#ff3b3b');
      } else {
        showFeedback('❌ Wrong! Combo reset', '#ff3b3b');
      }
      document.getElementById('combo-count').textContent = 0;
    }
    flipped = [];
  }

  function showFeedback(msg, color) {
    const fb = document.getElementById('boss-feedback');
    if (fb) {
      fb.textContent = msg;
      fb.style.color = color;
    }
  }

  function stageComplete() {
    clearInterval(timerInterval);
    score += 100 + (timeLeft * 2);
    
    const victoryTexts = [
      { title: '🛡️ STAGE 1 CLEARED!', msg: 'Basic scams neutralized! You\'re getting sharper!' },
      { title: '⚔️ STAGE 2 DOMINATED!', msg: 'Advanced fraudsters defeated! Your skills are impressive!' },
      { title: '👑 FINAL BOSS DESTROYED!', msg: 'LEGENDARY VICTORY! You\'re a Cyber Guardian!' }
    ];
    
    const victory = victoryTexts[stage - 1];
    
    const modal = document.getElementById('phish-game-modal');
    modal.style.animation = 'none';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:linear-gradient(135deg, #00ff88 0%, #00eaff 100%);color:#000;">
          <h2 style="color:#000;text-shadow:0 0 20px #fff;font-size:32px;margin-bottom:20px;">${victory.title}</h2>
          <p style="color:#000;font-size:18px;margin:20px 0;font-weight:bold;">${victory.msg}</p>
          <div style="background:rgba(0,0,0,0.8);padding:20px;border-radius:8px;margin:20px 0;">
            <p style="color:#00ff88;font-size:36px;font-weight:bold;text-shadow:0 0 15px #00ff88;">+${100 + (timeLeft * 2)} XP</p>
            <p style="color:#00eaff;margin-top:10px;">Time Bonus: +${timeLeft * 2} | Combo: x${combo}</p>
          </div>
          <button class="phish-continue-btn" id="next-stage-btn" style="background:#000;color:#00ff88;border:2px solid #00ff88;">${stage < 3 ? 'Next Stage →' : 'Claim Victory'}</button>
        </div>
      </div>
    `;
    
    document.getElementById('next-stage-btn').onclick = function() {
      if (stage < 3) {
        stage++;
        document.getElementById('phish-game-modal').remove();
        showStageIntro();
      } else {
        updateUserStats(score);
        document.getElementById('phish-game-modal').remove();
      }
    };
  }

  function bossFailed() {
    clearInterval(timerInterval);
    updateUserStats(Math.floor(score / 2));
    
    const modal = document.getElementById('phish-game-modal');
    modal.style.animation = 'none';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:#0f0f0f;">
          <h2 style="color:#ff3b3b;text-shadow:0 0 15px #ff3b3b;">⏰ STAGE ${stage} FAILED!</h2>
          <p style="color:#fff;margin:20px 0;font-size:16px;">Time ran out! The scammers got away...</p>
          <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:1px solid #ff3b3b;">
            <p style="color:#00eaff;font-size:24px;">Score: ${score} XP</p>
            <p style="color:#888;margin-top:10px;">Boss Health: ${bossHealth}% | Matched: ${matched.length / 2}/${cards.length / 2}</p>
          </div>
          <button class="phish-continue-btn" id="try-again-btn">Try Again</button>
        </div>
      </div>
    `;
    
    document.getElementById('try-again-btn').onclick = function() {
      stage = 1;
      score = 0;
      document.getElementById('phish-game-modal').remove();
      showStageIntro();
    };
  }
}
