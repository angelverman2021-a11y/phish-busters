import React, { useState } from 'react';
import axios from 'axios';

const ScoreBar = ({ label, score, color }) => {
  const bars = Math.round(score / 10);
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-white font-bold">{label}</span>
        <span className="text-glow-cyan font-bold">{score}%</span>
      </div>
      <div className="flex gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`h-6 flex-1 rounded transition-all duration-500 ${
              i < bars ? 'opacity-100' : 'opacity-20'
            }`}
            style={{ backgroundColor: i < bars ? color : '#333' }}
          />
        ))}
      </div>
    </div>
  );
};

const BuildAScam = ({ userId }) => {
  const [step, setStep] = useState(1);
  const [target, setTarget] = useState('');
  const [tactic, setTactic] = useState('');
  const [scamMessage, setScamMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const targets = [
    { id: 'Bank Customer', icon: '\ud83c\udfe6' },
    { id: 'Student', icon: '\ud83c\udf93' },
    { id: 'Senior Citizen', icon: '\ud83d\udc74' },
    { id: 'Online Shopper', icon: '\ud83d\uded2' }
  ];

  const tactics = [
    { id: 'Fear', icon: '\ud83d\ude31' },
    { id: 'Urgency', icon: '\u23f0' },
    { id: 'Reward', icon: '\ud83c\udf81' },
    { id: 'Authority', icon: '\ud83d\udc6e' },
    { id: 'Curiosity', icon: '\ud83e\udd14' }
  ];

  const templates = {
    'Bank Customer-Fear': 'Your account has been compromised. Verify immediately or funds will be frozen.',
    'Bank Customer-Urgency': 'URGENT: Complete KYC verification within 24 hours to avoid account suspension.',
    'Bank Customer-Authority': 'RBI mandates immediate Aadhaar linking. Click here to comply.',
    'Student-Reward': 'Congratulations! You won a free internship at Google. Claim now.',
    'Student-Urgency': 'Last chance: Apply for scholarship before deadline expires today!',
    'Student-Curiosity': 'Your exam results are ready. Click to view your marks.',
    'Senior Citizen-Fear': 'Your pension will stop. Update PAN card details immediately.',
    'Senior Citizen-Authority': 'Government notice: Aadhaar re-verification required for benefits.',
    'Senior Citizen-Reward': 'You are eligible for \u20b950,000 senior citizen bonus. Claim here.',
    'Online Shopper-Reward': 'You won \u20b910,000 cashback! Complete verification to receive.',
    'Online Shopper-Urgency': 'Your package is stuck. Pay \u20b999 customs fee to release delivery.',
    'Online Shopper-Fear': 'Suspicious activity detected. Verify your payment details now.'
  };

  const handleTacticSelect = (tc) => {
    setTactic(tc);
    const msg = templates[`${target}-${tc}`] || 'Custom scam message';
    setScamMessage(msg);
    setStep(3);
  };

  const analyzeScam = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/scam/analyze-scam', {
        userId, scamMessage, target, tactic
      });
      setAnalysis(res.data);
      setStep(4);
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <img src="/icon8/logo.png" alt="Logo" className="w-12 h-12" />
          <h1 className="text-4xl font-bold text-glow">\ud83c\udfad Scam Designer Mode</h1>
        </div>

        {step === 1 && (
          <div className="card-cyber">
            <h2 className="text-2xl font-bold text-glow-cyan mb-6 text-center">Step 1: Choose Your Target</h2>
            <div className="grid grid-cols-2 gap-4">
              {targets.map(t => (
                <button key={t.id} onClick={() => { setTarget(t.id); setStep(2); }} className="btn-cyber text-xl py-6">
                  {t.icon} {t.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card-cyber">
            <h2 className="text-2xl font-bold text-glow-cyan mb-6 text-center">Step 2: Choose Psychological Tactic</h2>
            <div className="grid grid-cols-2 gap-4">
              {tactics.map(tc => (
                <button key={tc.id} onClick={() => handleTacticSelect(tc.id)} className="btn-cyber text-xl py-6">
                  {tc.icon} {tc.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card-cyber">
            <h2 className="text-2xl font-bold text-glow-green mb-6 text-center">Your Scam Design</h2>
            <div className="bg-gray-900 p-6 rounded-lg border-2 border-cyber-cyan mb-6">
              <p className="text-sm text-gray-400 mb-2">TARGET: <span className="text-glow-cyan">{target}</span></p>
              <p className="text-sm text-gray-400 mb-4">TACTIC: <span className="text-glow-cyan">{tactic}</span></p>
              <p className="text-lg text-glow">{scamMessage}</p>
            </div>
            <button onClick={analyzeScam} className="btn-cyber w-full">\ud83d\udd0d Analyze Psychology & Earn XP</button>
          </div>
        )}

        {step === 4 && analysis && (
          <div className="space-y-6">
            <div className="card-cyber">
              <h2 className="text-3xl font-bold text-glow-cyan mb-6 text-center">\ud83d\udcca AI Analysis Report</h2>
              
              <ScoreBar label="Manipulation Score" score={analysis.manipulationScore} color="#ff3b3b" />
              <ScoreBar label="Detectability Score" score={analysis.detectabilityScore} color="#00eaff" />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Red Flags Count</p>
                  <p className="text-4xl font-bold text-glow-red">{analysis.redFlagCount}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">XP Earned</p>
                  <p className="text-4xl font-bold text-glow-green">+{analysis.xp}</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Psychological Tactics Used</p>
                <div className="flex gap-2 flex-wrap">
                  {analysis.tactics.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-cyber-cyan text-black rounded-full font-bold">{t}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-red-500">
                <p className="text-red-400 font-bold mb-2">\ud83d\udea9 Red Flags Detected:</p>
                <ul className="space-y-1">
                  {analysis.redFlags.map((flag, i) => (
                    <li key={i} className="text-gray-300">\u25b8 {flag}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card-cyber">
              <h2 className="text-3xl font-bold text-glow-cyan mb-6">\ud83d\udd0d Why This Works Psychologically</h2>
              {analysis.biases.map((bias, idx) => (
                <div key={idx} className="bg-gray-900 rounded-xl p-6 mb-4 border-2" style={{ borderColor: bias.color }}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-4xl">{bias.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{bias.type}</h3>
                      <span className="text-sm font-bold text-glow-red">Impact: {bias.impact}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-lg">{bias.explanation}</p>
                  <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-blue-400 mb-2">\ud83d\udee1\ufe0f Defense Tip:</h4>
                    <p className="text-blue-200">{bias.defenseTip}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => { setStep(1); setAnalysis(null); }} className="btn-cyber w-full">Create Another Scam</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildAScam;
