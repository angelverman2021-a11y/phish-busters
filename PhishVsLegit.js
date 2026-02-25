// Phish vs Legit - Enhanced Interactive Game with Dynamic UI Simulations
function startPhishVsLegit() {
  const scenarios = {
    easy: [
      { 
        id: 1, 
        type: 'whatsapp',
        msgA: { sender: '+91 98765 43210', senderName: 'Unknown', message: 'URGENT! Your UPI account will be BLOCKED in 24 hours. Click here to verify NOW: bit.ly/upi-verify', time: '10:23 AM', suspicious: ['URGENT', 'BLOCKED', 'bit.ly'] },
        msgB: { sender: '+91 98123 45678', senderName: 'Raj', message: 'Your UPI payment of ₹500 to Raj was successful. Transaction ID: 123456789', time: '10:25 AM', suspicious: [] },
        phishing: 'A', reason: 'urgency', redFlags: ['Urgency language', 'Shortened URL', 'Threats'], 
        explanation: 'Uses fear and urgency to force quick action. Real UPI services never threaten account blocking via messages.' 
      },
      { 
        id: 2, 
        type: 'sms',
        msgA: { sender: 'MEETING', message: 'Hi! Meeting at 3 PM tomorrow in conference room B. Please confirm.', time: '2:15 PM', suspicious: [] },
        msgB: { sender: 'PM-WINNER', message: 'CONGRATULATIONS! You WON ₹50,000 in Paytm lottery! Share your Aadhaar and PAN to claim prize!', time: '2:18 PM', suspicious: ['CONGRATULATIONS', 'WON', 'Aadhaar', 'PAN'] },
        phishing: 'B', reason: 'reward', redFlags: ['Fake reward', 'Requests sensitive data', 'Too good to be true'], 
        explanation: 'Lottery scams exploit greed. You cannot win a lottery you never entered.' 
      },
      { 
        id: 3, 
        type: 'email',
        msgA: { sender: 'orders@amazon.in', senderName: 'Amazon', subject: 'Your order has been shipped', message: 'Your Amazon order #AMZ123 has been shipped. Track your package at amazon.in/track/AMZ123', time: 'Today 11:30 AM', suspicious: [] },
        msgB: { sender: 'delivery@amaz0n-delivery.com', senderName: 'Amazon Delivery', subject: 'Delivery Failed - Action Required', message: 'Dear custmer, your pakage delivery faild. Update adress immediately: amaz0n-delivery.com', time: 'Today 11:35 AM', suspicious: ['custmer', 'pakage', 'faild', 'amaz0n-delivery.com'] },
        phishing: 'B', reason: 'grammar', redFlags: ['Grammar errors', 'Fake domain', 'Spelling mistakes'], 
        explanation: 'Multiple spelling errors and fake domain (amaz0n vs amazon) are clear indicators.' 
      }
    ],
    medium: [
      { 
        id: 4, 
        type: 'email',
        msgA: { sender: 'refund@incometax-refund.in', senderName: 'Income Tax Department', subject: 'Tax Refund Pending - Action Required', message: 'Income Tax Refund of ₹15,240 is pending. Verify your bank details to process: incometax-refund.in/verify', time: 'Today 9:45 AM', suspicious: ['incometax-refund.in'] },
        msgB: { sender: 'noreply@incometaxindia.gov.in', senderName: 'Income Tax India', subject: 'Refund Status Update', message: 'Your tax refund has been processed. Check your registered bank account in 3-5 business days.', time: 'Today 9:50 AM', suspicious: [] },
        phishing: 'A', reason: 'link', redFlags: ['Suspicious domain', 'Requests bank details', 'Unsolicited message'], 
        explanation: 'Income Tax department uses only gov.in domains and never asks for bank details via links.' 
      },
      { 
        id: 5, 
        type: 'sms',
        msgA: { sender: 'SBI-KYC', message: 'Your KYC verification is pending. Complete it within 48 hours to avoid account suspension. Visit: sbi-kyc-update.com', time: '3:20 PM', suspicious: ['48 hours', 'suspension', 'sbi-kyc-update.com'] },
        msgB: { sender: 'SBI', message: 'Reminder: Please visit your nearest branch to complete pending KYC formalities. - State Bank of India', time: '3:25 PM', suspicious: [] },
        phishing: 'A', reason: 'link', redFlags: ['Fake domain', 'Urgency', 'Suspension threat'], 
        explanation: 'Banks use official domains and never threaten suspension via SMS. Real KYC is done in-branch.' 
      },
      { 
        id: 6, 
        type: 'email',
        msgA: { sender: 'careers@google-internship.com', senderName: 'Google Careers', subject: 'Internship Offer - Immediate Confirmation Required', message: 'Congratulations! You have been selected for a Software Engineering internship at Google. Confirm by paying ₹5,000 registration fee.', time: 'Today 1:15 PM', suspicious: ['google-internship.com', '₹5,000 registration fee'] },
        msgB: { sender: 'university-placement@college.edu', senderName: 'Placement Cell', subject: 'Application Status', message: 'Thank you for applying. We will review your application and contact you within 2 weeks if shortlisted.', time: 'Today 1:20 PM', suspicious: [] },
        phishing: 'A', reason: 'otp', redFlags: ['Upfront payment request', 'Fake opportunity', 'Registration fee scam'], 
        explanation: 'Legitimate companies never charge fees for job opportunities or internships.' 
      }
    ],
    hard: [
      { 
        id: 7, 
        type: 'banking',
        msgA: { sender: 'alerts@secure-hdfc-bank.com', senderName: 'HDFC Bank', subject: 'Security Alert - Unusual Activity Detected', message: 'Dear customer, we noticed unusual activity on your account. For security, please verify your identity: https://secure-hdfc-bank.com/verify', time: 'Today 4:30 PM', suspicious: ['secure-hdfc-bank.com'] },
        msgB: { sender: 'alerts@hdfcbank.com', senderName: 'HDFC Bank', subject: 'Login Alert', message: 'Alert: Unusual login detected from Mumbai. If this wasn\'t you, call our helpline immediately. Do not share OTP.', time: 'Today 4:35 PM', suspicious: [] },
        phishing: 'A', reason: 'link', redFlags: ['Deceptive domain', 'Phishing link', 'Impersonation'], 
        explanation: 'Domain looks official but is fake (secure-hdfc-bank.com vs hdfcbank.com). Real banks never send verification links.' 
      },
      { 
        id: 8, 
        type: 'sms',
        msgA: { sender: 'FLIPKART', message: 'Your Flipkart order will be delivered today between 2-5 PM. Track: flipkart.com/track/FK789456', time: '11:00 AM', suspicious: [] },
        msgB: { sender: 'FK-DELIVERY', message: 'Delivery attempted but failed. Pay ₹50 redelivery charge to reschedule: flipkart-delivery.in/pay', time: '11:05 AM', suspicious: ['₹50 redelivery charge', 'flipkart-delivery.in'] },
        phishing: 'B', reason: 'link', redFlags: ['Payment request', 'Fake domain', 'Redelivery scam'], 
        explanation: 'E-commerce platforms never charge redelivery fees via external links. Always use official app.' 
      },
      { 
        id: 9, 
        type: 'email',
        msgA: { sender: 'billing@bescom-payment.com', senderName: 'BESCOM', subject: 'Electricity Bill Overdue - Immediate Action Required', message: 'Your electricity bill of ₹2,340 is overdue. Pay now to avoid disconnection: bescom-payment.com/pay', time: 'Today 8:15 AM', suspicious: ['bescom-payment.com', 'avoid disconnection'] },
        msgB: { sender: 'noreply@bescom.co.in', senderName: 'BESCOM', subject: 'Monthly Bill Generated', message: 'Your electricity bill for March is ₹2,340. Due date: 15th April. Pay via official app or authorized centers.', time: 'Today 8:20 AM', suspicious: [] },
        phishing: 'A', reason: 'link', redFlags: ['Fake domain', 'Disconnection threat', 'Payment link'], 
        explanation: 'Utility companies use official domains and never send payment links. Disconnection notices come via official mail.' 
      }
    ]
  };

  let currentRound = 0, score = 0, streak = 0, difficulty = 'easy', timeLeft = 15, timerInterval = null;
  let currentScenario = null, clueUsed = false, selectedAnswer = null;

  showDifficultySelection();

  function showDifficultySelection() {
    const modal = createGameModal('⚡ Phish vs Legit', `
      <div style="text-align:center;padding:30px;">
        <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin-bottom:20px;">Select Difficulty</h2>
        <p style="color:#ccc;margin-bottom:30px;">Choose your challenge level</p>
        
        <div style="display:flex;flex-direction:column;gap:15px;">
          <button class="game-mode-btn" id="easy-btn" style="padding:20px;">
            <div style="font-size:24px;margin-bottom:8px;">🟢 Easy</div>
            <div style="font-size:13px;color:#ccc;">Clear red flags, obvious scams</div>
          </button>
          <button class="game-mode-btn" id="medium-btn" style="padding:20px;">
            <div style="font-size:24px;margin-bottom:8px;">🟡 Medium</div>
            <div style="font-size:13px;color:#ccc;">Subtle cues, moderate difficulty</div>
          </button>
          <button class="game-mode-btn" id="hard-btn" style="padding:20px;">
            <div style="font-size:24px;margin-bottom:8px;">🔴 Hard</div>
            <div style="font-size:13px;color:#ccc;">Realistic scams, expert level</div>
          </button>
        </div>
      </div>
    `);

    const closeBtn = modal.querySelector('.phish-close-btn');
    if (closeBtn) closeBtn.onclick = () => { if (timerInterval) clearInterval(timerInterval); modal.remove(); };

    document.getElementById('easy-btn').onclick = () => { difficulty = 'easy'; modal.remove(); startGame(); };
    document.getElementById('medium-btn').onclick = () => { difficulty = 'medium'; modal.remove(); startGame(); };
    document.getElementById('hard-btn').onclick = () => { difficulty = 'hard'; modal.remove(); startGame(); };
  }

  function startGame() {
    currentRound = 0;
    score = 0;
    streak = 0;
    nextRound();
  }

  function nextRound() {
    currentRound++;
    clueUsed = false;
    selectedAnswer = null;
    const pool = scenarios[difficulty];
    currentScenario = pool[Math.floor(Math.random() * pool.length)];
    timeLeft = 15;
    showScenario();
    startTimer();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      const timerEl = document.getElementById('timer-value');
      if (timerEl) {
        timerEl.textContent = timeLeft;
        timerEl.style.color = timeLeft <= 5 ? '#ff3b3b' : '#00eaff';
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function showScenario() {
    const modal = createGameModal('⚡ Phish vs Legit', `
      <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin-bottom:15px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="color:#888;">Round ${currentRound}</span>
            <span style="color:#00eaff;margin-left:15px;">Difficulty: ${difficulty.toUpperCase()}</span>
          </div>
          <div style="display:flex;gap:15px;align-items:center;">
            <div style="color:#00ff88;">🔥 Streak: <span id="streak-value">${streak}</span></div>
            <div style="color:#00eaff;font-size:20px;font-weight:bold;">⏱️ <span id="timer-value">${timeLeft}</span>s</div>
          </div>
        </div>
      </div>

      <h3 style="color:#fff;text-align:center;margin-bottom:20px;">Which message is PHISHING?</h3>

      <div id="msg-a" class="message-option" style="margin-bottom:15px;cursor:pointer;">
        ${renderMessage(currentScenario.msgA, currentScenario.type, 'A')}
      </div>

      <div id="msg-b" class="message-option" style="margin-bottom:15px;cursor:pointer;">
        ${renderMessage(currentScenario.msgB, currentScenario.type, 'B')}
      </div>

      <div style="text-align:center;margin-top:20px;">
        <button class="phish-continue-btn" id="clue-btn" style="background:#1a1a1a;border:2px solid #ffc107;color:#ffc107;">💡 Use Clue (-5 XP)</button>
      </div>

      <div id="clue-display" style="display:none;background:#2a2a2a;padding:15px;border-radius:8px;border:1px solid #ffc107;margin-top:15px;">
        <p style="color:#ffc107;font-weight:bold;margin-bottom:8px;">💡 Hint:</p>
        <p style="color:#ccc;font-size:14px;" id="clue-text"></p>
      </div>
    `);

    const closeBtn = modal.querySelector('.phish-close-btn');
    if (closeBtn) closeBtn.onclick = () => { if (timerInterval) clearInterval(timerInterval); modal.remove(); };

    document.getElementById('msg-a').onclick = () => selectMessage('A');
    document.getElementById('msg-b').onclick = () => selectMessage('B');
    document.getElementById('clue-btn').onclick = showClue;
  }

  function renderMessage(msg, type, label) {
    const highlightSuspicious = (text, suspicious) => {
      if (!suspicious || suspicious.length === 0) return text;
      let highlighted = text;
      suspicious.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="suspicious-text" style="background:#ff3b3b;color:#fff;padding:2px 4px;border-radius:3px;font-weight:bold;">$1</span>');
      });
      return highlighted;
    };

    if (type === 'whatsapp') {
      return `
        <div style="background:#0d1418;padding:15px;border-radius:12px;border:2px solid #00eaff;">
          <div style="color:#00eaff;font-weight:bold;margin-bottom:10px;">Message ${label} - WhatsApp</div>
          <div style="background:#1f2c34;padding:12px;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#00a884;font-weight:bold;font-size:14px;">${msg.senderName || 'Unknown'}</span>
              <span style="color:#8696a0;font-size:11px;">${msg.time}</span>
            </div>
            <div style="color:#e9edef;font-size:14px;line-height:1.5;">${clueUsed ? highlightSuspicious(msg.message, msg.suspicious) : msg.message}</div>
            <div style="color:#8696a0;font-size:11px;margin-top:5px;">${msg.sender}</div>
          </div>
        </div>
      `;
    } else if (type === 'email') {
      return `
        <div style="background:#fff;padding:15px;border-radius:8px;border:2px solid #00eaff;color:#000;">
          <div style="color:#00eaff;font-weight:bold;margin-bottom:10px;">Message ${label} - Email</div>
          <div style="border-bottom:1px solid #ddd;padding-bottom:10px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <div>
                <span style="color:#666;font-size:11px;">From:</span>
                <span style="font-weight:bold;font-size:13px;margin-left:5px;">${msg.senderName}</span>
                <span style="color:#666;font-size:11px;margin-left:5px;">&lt;${clueUsed ? highlightSuspicious(msg.sender, msg.suspicious) : msg.sender}&gt;</span>
              </div>
              <span style="color:#666;font-size:11px;">${msg.time}</span>
            </div>
            <div style="margin-top:5px;">
              <span style="color:#666;font-size:11px;">Subject:</span>
              <span style="font-weight:bold;font-size:13px;margin-left:5px;">${msg.subject}</span>
            </div>
          </div>
          <div style="font-size:14px;line-height:1.6;color:#000;">${clueUsed ? highlightSuspicious(msg.message, msg.suspicious) : msg.message}</div>
        </div>
      `;
    } else if (type === 'sms') {
      return `
        <div style="background:#f5f5f5;padding:15px;border-radius:8px;border:2px solid #00eaff;">
          <div style="color:#00eaff;font-weight:bold;margin-bottom:10px;">Message ${label} - SMS</div>
          <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #ddd;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#007aff;font-weight:bold;font-size:13px;">${msg.sender}</span>
              <span style="color:#999;font-size:11px;">${msg.time}</span>
            </div>
            <div style="color:#000;font-size:14px;line-height:1.5;">${clueUsed ? highlightSuspicious(msg.message, msg.suspicious) : msg.message}</div>
          </div>
        </div>
      `;
    } else if (type === 'banking') {
      return `
        <div style="background:#fff;padding:15px;border-radius:8px;border:2px solid #00eaff;">
          <div style="color:#00eaff;font-weight:bold;margin-bottom:10px;">Message ${label} - Banking Alert</div>
          <div style="border:2px solid #ff9800;border-radius:8px;padding:12px;background:#fff8e1;">
            <div style="display:flex;align-items:center;margin-bottom:8px;">
              <span style="font-size:20px;margin-right:8px;">⚠️</span>
              <span style="font-weight:bold;color:#f57c00;font-size:14px;">${msg.subject}</span>
            </div>
            <div style="color:#666;font-size:11px;margin-bottom:8px;">
              From: ${clueUsed ? highlightSuspicious(msg.sender, msg.suspicious) : msg.sender} | ${msg.time}
            </div>
            <div style="color:#000;font-size:14px;line-height:1.6;">${clueUsed ? highlightSuspicious(msg.message, msg.suspicious) : msg.message}</div>
          </div>
        </div>
      `;
    }
  }

  function selectMessage(choice) {
    if (selectedAnswer) return;
    selectedAnswer = choice;
    clearInterval(timerInterval);

    document.querySelectorAll('.message-option').forEach(el => {
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.5';
    });

    const selected = document.getElementById(`msg-${choice.toLowerCase()}`);
    selected.style.opacity = '1';
    selected.style.borderColor = '#00ff88';

    setTimeout(() => showWhyStep(), 500);
  }

  function showClue() {
    if (clueUsed) return;
    clueUsed = true;
    
    const clues = {
      urgency: 'Look for words like "URGENT", "NOW", "IMMEDIATELY" that create panic',
      link: 'Check if the domain looks suspicious or uses numbers instead of letters',
      grammar: 'Notice any spelling mistakes or poor grammar',
      otp: 'Real services never ask for OTP, PIN, or passwords via message',
      reward: 'Be skeptical of unexpected prizes or rewards'
    };

    document.getElementById('clue-display').style.display = 'block';
    document.getElementById('clue-text').textContent = clues[currentScenario.reason];
    document.getElementById('clue-btn').disabled = true;
    document.getElementById('clue-btn').style.opacity = '0.5';
  }

  function showWhyStep() {
    const selectedMsg = selectedAnswer === 'A' ? currentScenario.msgA : currentScenario.msgB;
    const modal = document.getElementById('phish-game-modal');
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:#0f0f0f;">
          <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin-bottom:20px;">🤔 Why is it Phishing?</h2>
          
          <div style="margin-bottom:20px;">
            ${renderMessage(selectedMsg, currentScenario.type, selectedAnswer)}
          </div>

          <h3 style="color:#fff;margin-bottom:15px;">Select the main red flag:</h3>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="puzzle-option-btn" data-reason="urgency">⏰ Urgency Language - Creates panic to force quick action</button>
            <button class="puzzle-option-btn" data-reason="link">🔗 Suspicious Link - Fake or deceptive domain</button>
            <button class="puzzle-option-btn" data-reason="grammar">📝 Grammar Issues - Spelling or language errors</button>
            <button class="puzzle-option-btn" data-reason="otp">🔐 Requests Sensitive Data - Asks for OTP/PIN/Password</button>
            <button class="puzzle-option-btn" data-reason="reward">🎁 Fake Reward - Too good to be true offers</button>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.puzzle-option-btn').forEach(btn => {
      btn.onclick = () => checkReason(btn.dataset.reason);
    });
  }

  function checkReason(reason) {
    const isCorrect = selectedAnswer === currentScenario.phishing;
    const reasonCorrect = reason === currentScenario.reason;
    
    let xp = 0;
    if (isCorrect) {
      xp = Math.max(20 - (15 - timeLeft), 5);
      if (clueUsed) xp -= 5;
      if (reasonCorrect) xp += 10;
      streak++;
      if (streak % 5 === 0) xp += 50;
    } else {
      streak = 0;
    }

    score += xp;
    showFeedback(isCorrect, reasonCorrect, xp);
  }

  function showFeedback(isCorrect, reasonCorrect, xp) {
    const riskLevel = currentScenario.phishing === 'A' ? 
      (currentScenario.msgA.length > 100 ? 85 : 70) : 
      (currentScenario.msgB.length > 100 ? 85 : 70);

    const modal = document.getElementById('phish-game-modal');
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:#0f0f0f;max-height:80vh;overflow-y:auto;">
          <h2 style="color:${isCorrect ? '#00ff88' : '#ff3b3b'};text-shadow:0 0 10px ${isCorrect ? '#00ff88' : '#ff3b3b'};margin-bottom:20px;">
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </h2>

          <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:2px solid ${isCorrect ? '#00ff88' : '#ff3b3b'};margin-bottom:20px;text-align:center;">
            <div style="font-size:36px;color:#00eaff;margin-bottom:10px;">+${xp} XP</div>
            <div style="color:#ccc;">
              ${reasonCorrect ? '✓ Reason identified correctly (+10 XP)' : '✗ Reason was incorrect'}
              ${streak >= 5 && streak % 5 === 0 ? '<br>🔥 Streak Bonus: +50 XP!' : ''}
            </div>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin-bottom:15px;">
            <h3 style="color:#00eaff;margin-bottom:10px;">📊 Risk Meter</h3>
            <div style="background:#2a2a2a;height:30px;border-radius:15px;overflow:hidden;position:relative;">
              <div style="height:100%;width:${riskLevel}%;background:linear-gradient(90deg, #00ff88 0%, #ffc107 50%, #ff3b3b 100%);transition:width 0.5s;"></div>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-weight:bold;font-size:14px;">${riskLevel}% Risk</div>
            </div>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #555;margin-bottom:15px;">
            <h3 style="color:#00eaff;margin-bottom:10px;">🤖 AI Analysis</h3>
            <p style="color:#ccc;font-size:14px;line-height:1.6;margin-bottom:10px;">${currentScenario.explanation}</p>
            <div style="margin-top:10px;">
              <p style="color:#ff3b3b;font-weight:bold;margin-bottom:5px;">🚩 Red Flags Detected:</p>
              <ul style="color:#ccc;margin-left:20px;font-size:13px;">
                ${currentScenario.redFlags.map(flag => `<li>${flag}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;margin-bottom:20px;">
            <h3 style="color:#00ff88;margin-bottom:10px;">💡 How to Spot Similar Scams</h3>
            <ul style="color:#ccc;margin-left:20px;font-size:13px;line-height:1.8;">
              <li>Always verify sender through official channels</li>
              <li>Never click on links in unsolicited messages</li>
              <li>Check domain names carefully for typos</li>
              <li>Real organizations never ask for OTP/PIN via message</li>
              <li>Be skeptical of urgency and threats</li>
            </ul>
          </div>

          <div style="display:flex;gap:10px;">
            <button class="phish-continue-btn" id="next-round-btn" style="flex:1;">Next Round →</button>
            <button class="phish-continue-btn" id="end-game-btn" style="flex:1;background:#1a1a1a;border:2px solid #ff3b3b;color:#ff3b3b;">End Game</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('next-round-btn').onclick = () => {
      modal.remove();
      nextRound();
    };

    document.getElementById('end-game-btn').onclick = () => {
      updateUserStats(score);
      modal.remove();
    };
  }

  function handleTimeout() {
    selectedAnswer = null;
    streak = 0;
    
    const modal = document.getElementById('phish-game-modal');
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:#0f0f0f;">
          <h2 style="color:#ff3b3b;text-shadow:0 0 10px #ff3b3b;margin-bottom:20px;">⏰ Time's Up!</h2>
          <p style="color:#ccc;text-align:center;margin-bottom:20px;">You ran out of time. Streak reset to 0.</p>
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #555;margin-bottom:20px;">
            <p style="color:#00eaff;font-weight:bold;margin-bottom:10px;">The correct answer was: Message ${currentScenario.phishing}</p>
            <p style="color:#ccc;font-size:14px;">${currentScenario.explanation}</p>
          </div>
          <button class="phish-continue-btn" id="continue-btn">Continue</button>
        </div>
      </div>
    `;

    document.getElementById('continue-btn').onclick = () => {
      modal.remove();
      nextRound();
    };
  }
}
