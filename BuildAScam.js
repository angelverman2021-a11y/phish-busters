// Build a Scam - Enhanced with Personas and AI Generation
function startBuildAScam() {
  let selectedPersona = null;
  let scamElements = [];
  let customText = '';

  const personas = [
    { id: 'professor', name: '👨‍🏫 Professor', icon: '🎓' },
    { id: 'teacher', name: '👩‍🏫 Teacher', icon: '📚' },
    { id: 'lawyer', name: '⚖️ Lawyer', icon: '📜' },
    { id: 'doctor', name: '👨‍⚕️ Doctor', icon: '🏥' },
    { id: 'student', name: '🎓 Student', icon: '📖' },
    { id: 'corporate', name: '💼 Corporate Employee', icon: '🏢' },
    { id: 'bank_customer', name: '🏦 Bank Customer', icon: '💳' },
    { id: 'govt_official', name: '🏛️ Govt Official', icon: '📋' },
    { id: 'business_owner', name: '👔 Business Owner', icon: '💼' }
  ];

  showPersonaSelection();

  function showPersonaSelection() {
    const modal = createGameModal('🎭 Build-a-Scam: Choose Target', `
      <div style="background:#1a1a1a;padding:20px;border-radius:8px;border:2px solid #00eaff;margin-bottom:20px;">
        <h3 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin-bottom:10px;">Select Target Persona</h3>
        <p style="color:#ccc;font-size:14px;">Choose who the scammer will target</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;" id="persona-grid"></div>
    `);

    document.querySelector('.phish-close-btn').onclick = () => {
      modal.remove();
    };

    const grid = document.getElementById('persona-grid');
    personas.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'game-mode-btn';
      btn.style.padding = '15px';
      btn.innerHTML = `${p.icon}<br>${p.name.split(' ')[1]}`;
      btn.onclick = () => {
        selectedPersona = p;
        document.getElementById('phish-game-modal').remove();
        generateScamElements();
      };
      grid.appendChild(btn);
    });
  }

  async function generateScamElements() {
    showLoadingScreen();
    
    const prompt = `Generate 12 realistic phishing scam elements for targeting a ${selectedPersona.name}. Return JSON with 4 categories:
{
  "urgency": [3 urgent phrases],
  "authority": [3 authority impersonations],
  "actions": [3 requested actions],
  "consequences": [3 threats/rewards]
}
Make them specific to ${selectedPersona.name} context. Keep phrases short (under 10 words).`;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeWithAI',
        text: prompt
      });

      if (response && response.explanation) {
        const elements = JSON.parse(response.explanation);
        showScamBuilder(elements);
      } else {
        showScamBuilder(getDefaultElements());
      }
    } catch (error) {
      showScamBuilder(getDefaultElements());
    }
  }

  function getDefaultElements() {
    const defaults = {
      professor: {
        urgency: ['Research grant expires today', 'Conference registration closing', 'Urgent: Verify academic credentials'],
        authority: ['University Admin', 'Research Council', 'Academic Board'],
        actions: ['Confirm attendance', 'Update profile', 'Verify email'],
        consequences: ['Lose funding', 'Miss conference', 'Account suspended']
      },
      doctor: {
        urgency: ['Medical license renewal due', 'Patient records access expiring', 'Insurance claim pending'],
        authority: ['Medical Board', 'Hospital Admin', 'Insurance Provider'],
        actions: ['Verify credentials', 'Update records', 'Confirm identity'],
        consequences: ['License suspended', 'Records locked', 'Claim rejected']
      },
      student: {
        urgency: ['Scholarship deadline today', 'Exam results ready', 'Fee payment overdue'],
        authority: ['University Portal', 'Scholarship Board', 'Student Affairs'],
        actions: ['Claim scholarship', 'View results', 'Pay fees'],
        consequences: ['Lose scholarship', 'Results withheld', 'Enrollment cancelled']
      }
    };
    return defaults[selectedPersona.id] || defaults.student;
  }

  function showLoadingScreen() {
    createGameModal('🤖 AI Generating...', `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:48px;animation:spin 1s linear infinite;">⚙️</div>
        <p style="color:#00eaff;margin-top:20px;">Creating persona-specific scam elements...</p>
      </div>
    `);
  }

  function showScamBuilder(elements) {
    const modal = createGameModal(`🛠️ Build Scam: ${selectedPersona.name}`, `
      <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin-bottom:15px;">
        <p style="color:#00eaff;font-size:14px;">Target: ${selectedPersona.name}</p>
      </div>
      
      <div class="scam-builder">
        <div class="element-category">
          <h4>⚡ Urgency</h4>
          <div id="urgency-options"></div>
        </div>
        <div class="element-category">
          <h4>👮 Authority</h4>
          <div id="authority-options"></div>
        </div>
        <div class="element-category">
          <h4>🎯 Action</h4>
          <div id="actions-options"></div>
        </div>
        <div class="element-category">
          <h4>⚠️ Consequence</h4>
          <div id="consequences-options"></div>
        </div>
      </div>

      <div style="margin:15px 0;">
        <h4 style="color:#00eaff;margin-bottom:8px;">✏️ Custom Text (Optional)</h4>
        <textarea id="custom-text" placeholder="Add your own text..." style="width:100%;padding:10px;background:#1a1a1a;border:1px solid #00eaff;border-radius:6px;color:#fff;font-size:14px;min-height:60px;"></textarea>
      </div>

      <div class="scam-preview" id="scam-preview" style="min-height:80px;">Your scam message will appear here...</div>
      <button class="phish-continue-btn" id="analyze-btn">🔍 Analyze with AI</button>
    `);

    document.querySelector('.phish-close-btn').onclick = () => {
      modal.remove();
    };

    populateElements('urgency-options', elements.urgency);
    populateElements('authority-options', elements.authority);
    populateElements('actions-options', elements.actions);
    populateElements('consequences-options', elements.consequences);

    document.getElementById('custom-text').oninput = updatePreview;
    document.getElementById('analyze-btn').onclick = analyzeScam;
  }

  function populateElements(containerId, items) {
    const container = document.getElementById(containerId);
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'element-btn';
      btn.textContent = item;
      btn.onclick = () => {
        scamElements.push(item);
        updatePreview();
      };
      container.appendChild(btn);
    });
  }

  function updatePreview() {
    customText = document.getElementById('custom-text').value;
    const preview = [...scamElements, customText].filter(Boolean).join(' ');
    document.getElementById('scam-preview').textContent = preview || 'Your scam message will appear here...';
  }

  async function analyzeScam() {
    const message = [...scamElements, customText].filter(Boolean).join(' ');
    if (!message) return;

    showLoadingScreen();

    const prompt = `Analyze this phishing scam targeting ${selectedPersona.name}:
"${message}"

Provide JSON response:
{
  "detectability": 0-100,
  "realism": 0-100,
  "effectiveness": 0-100,
  "techniques": [list of manipulation techniques],
  "attacker_view": "how attacker designed this",
  "victim_view": "how victim perceives this",
  "analyst_view": "security analyst assessment",
  "improvements": "how to make more convincing",
  "detection_tips": "how to detect this scam"
}`;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeWithAI',
        text: prompt
      });

      if (response && response.explanation) {
        const analysis = JSON.parse(response.explanation);
        showAnalysis(message, analysis);
      } else {
        showAnalysis(message, getDefaultAnalysis());
      }
    } catch (error) {
      showAnalysis(message, getDefaultAnalysis());
    }
  }

  function getDefaultAnalysis() {
    return {
      detectability: 75,
      realism: 80,
      effectiveness: 70,
      techniques: ['Urgency', 'Authority', 'Fear'],
      attacker_view: 'Designed to create panic and force quick action',
      victim_view: 'Appears legitimate due to authority impersonation',
      analyst_view: 'Multiple red flags present, medium threat level',
      improvements: 'Add specific details, use official-looking formatting',
      detection_tips: 'Verify sender, check for urgency language, contact organization directly'
    };
  }

  function showAnalysis(message, analysis) {
    const xp = Math.round((analysis.realism + analysis.effectiveness) / 2);
    updateUserStats(true);

    const modal = document.getElementById('phish-game-modal');
    modal.innerHTML = `
      <div class="phish-modal-overlay">
        <div class="phish-modal-content" style="background:#0f0f0f;max-height:80vh;overflow-y:auto;">
          <h2 style="color:#00eaff;text-shadow:0 0 10px #00eaff;margin-bottom:20px;">🤖 AI Analysis Report</h2>
          
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #555;margin-bottom:15px;">
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${message}</p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:15px;">
            <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ff3b3b;text-align:center;">
              <p style="color:#888;font-size:11px;">Detectability</p>
              <p style="color:#ff3b3b;font-size:24px;font-weight:bold;text-shadow:0 0 10px #ff3b3b;">${analysis.detectability}%</p>
            </div>
            <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;text-align:center;">
              <p style="color:#888;font-size:11px;">Realism</p>
              <p style="color:#00eaff;font-size:24px;font-weight:bold;text-shadow:0 0 10px #00eaff;">${analysis.realism}%</p>
            </div>
            <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;text-align:center;">
              <p style="color:#888;font-size:11px;">XP Earned</p>
              <p style="color:#00ff88;font-size:24px;font-weight:bold;text-shadow:0 0 10px #00ff88;">+${xp}</p>
            </div>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #555;margin-bottom:15px;">
            <p style="color:#00eaff;font-weight:bold;margin-bottom:8px;">🎯 Techniques Used:</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${analysis.techniques.map(t => `<span style="padding:6px 12px;background:#00eaff;color:#000;border-radius:20px;font-size:12px;font-weight:bold;">${t}</span>`).join('')}
            </div>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ff3b3b;margin-bottom:15px;">
            <p style="color:#ff3b3b;font-weight:bold;margin-bottom:8px;">👹 Attacker's Perspective:</p>
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${analysis.attacker_view}</p>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #ffc107;margin-bottom:15px;">
            <p style="color:#ffc107;font-weight:bold;margin-bottom:8px;">😰 Victim's Perspective:</p>
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${analysis.victim_view}</p>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;margin-bottom:15px;">
            <p style="color:#00ff88;font-weight:bold;margin-bottom:8px;">🛡️ Analyst's Assessment:</p>
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${analysis.analyst_view}</p>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00eaff;margin-bottom:15px;">
            <p style="color:#00eaff;font-weight:bold;margin-bottom:8px;">💡 How to Improve (Attacker):</p>
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${analysis.improvements}</p>
          </div>

          <div style="background:#1a1a1a;padding:15px;border-radius:8px;border:1px solid #00ff88;">
            <p style="color:#00ff88;font-weight:bold;margin-bottom:8px;">🔍 How to Detect (Defender):</p>
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${analysis.detection_tips}</p>
          </div>

          <div style="display:flex;gap:10px;margin-top:20px;">
            <button class="phish-continue-btn" id="build-another" style="flex:1;">Build Another</button>
            <button class="phish-continue-btn" id="close-analysis" style="flex:1;background:#1a1a1a;border:2px solid #00eaff;">Close</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('build-another').onclick = () => {
      scamElements = [];
      customText = '';
      document.getElementById('phish-game-modal').remove();
      showPersonaSelection();
    };

    document.getElementById('close-analysis').onclick = () => {
      document.getElementById('phish-game-modal').remove();
    };
  }
}
