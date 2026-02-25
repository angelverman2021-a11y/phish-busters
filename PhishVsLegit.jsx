import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Timer from '../Timer';
import RiskMeter from '../RiskMeter';

const API_URL = 'http://localhost:5000/api/game';

const PhishVsLegit = ({ userId }) => {
  const [state, setState] = useState('playing');
  const [msgA, setMsgA] = useState(null);
  const [msgB, setMsgB] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [timeTaken, setTimeTaken] = useState(0);
  const [clueUsed, setClueUsed] = useState(false);
  const [clue, setClue] = useState('');
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [difficulty]);

  const loadQuestion = async () => {
    try {
      const res = await axios.post(`${API_URL}/get-question`, { userId, difficulty });
      setMsgA(res.data.messageA);
      setMsgB(res.data.messageB);
      setState('playing');
      setSelectedId(null);
      setClueUsed(false);
      setClue('');
      setTimeTaken(0);
    } catch (error) {
      console.error('Error loading question:', error);
    }
  };

  const handleSubmit = async (id) => {
    setSelectedId(id);
    try {
      const res = await axios.post(`${API_URL}/check-answer`, {
        userId, selectedId: id, timeTaken, clueUsed
      });
      setResult(res.data);
      setStreak(res.data.streak);
      
      if (res.data.streakBonus > 0) {
        setShowStreakBonus(true);
        setTimeout(() => setShowStreakBonus(false), 3000);
      }
      
      setState(res.data.isCorrect ? 'why' : 'result');
    } catch (error) {
      console.error('Error checking answer:', error);
    }
  };

  const handleReason = async (reason) => {
    try {
      const res = await axios.post(`${API_URL}/submit-reason`, {
        userId, messageId: selectedId, reason
      });
      setResult(prev => ({ ...prev, ...res.data }));
      setState('result');
    } catch (error) {
      console.error('Error submitting reason:', error);
    }
  };

  const handleClue = async () => {
    try {
      const res = await axios.post(`${API_URL}/get-clue`, { messageId: msgA?.id });
      setClue(res.data.clue);
      setClueUsed(true);
    } catch (error) {
      console.error('Error getting clue:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/icon8/logo.png" alt="Phish Busters" className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-glow">⚡ Phish vs Legit</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-glow-cyan text-xl font-bold">
              🔥 Streak: {streak}
            </div>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-cyber-dark border-2 border-cyber-cyan rounded-lg px-4 py-2 text-white font-bold"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Streak Bonus Animation */}
      {showStreakBonus && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-cyber-correct to-cyber-cyan text-white text-4xl font-bold px-12 py-8 rounded-2xl shadow-glow-cyan animate-pulse-glow">
            🎉 STREAK x5! +50 XP BONUS! 🎉
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Playing State */}
        {state === 'playing' && (
          <>
            <Timer duration={15} onTimeout={() => handleSubmit(msgA?.id)} onTick={setTimeTaken} />
            
            <div className="grid grid-cols-2 gap-6 my-8">
              <div 
                onClick={() => handleSubmit(msgA?.id)}
                className="card-cyber cursor-pointer hover:scale-105 transition-transform"
              >
                <h3 className="text-2xl font-bold text-glow-cyan mb-4">Message A</h3>
                <p className="text-lg text-glow">{msgA?.text}</p>
              </div>
              <div 
                onClick={() => handleSubmit(msgB?.id)}
                className="card-cyber cursor-pointer hover:scale-105 transition-transform"
              >
                <h3 className="text-2xl font-bold text-glow-cyan mb-4">Message B</h3>
                <p className="text-lg text-glow">{msgB?.text}</p>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={handleClue} 
                disabled={clueUsed}
                className="btn-cyber disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💡 Reveal Clue {clueUsed && '(-5 XP)'}
              </button>
              {clue && (
                <div className="mt-4 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4 text-yellow-200">
                  {clue}
                </div>
              )}
            </div>
          </>
        )}

        {/* Why Mode */}
        {state === 'why' && (
          <div className="card-cyber max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-glow mb-6">🤔 Why is it phishing?</h3>
            <p className="text-xl text-glow mb-8">Select the main reason:</p>
            <div className="grid grid-cols-2 gap-4">
              {['urgency', 'suspicious_link', 'grammar', 'asking_otp'].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReason(reason)}
                  className="btn-cyber"
                >
                  {reason === 'urgency' && '⚡ Urgency Language'}
                  {reason === 'suspicious_link' && '🔗 Suspicious Link'}
                  {reason === 'grammar' && '📝 Grammar Errors'}
                  {reason === 'asking_otp' && '🔐 Asking for OTP'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result State */}
        {state === 'result' && result && (
          <div className="card-cyber max-w-2xl mx-auto text-center">
            <h2 className={`text-5xl font-bold mb-6 ${result.isCorrect ? 'text-glow-green' : 'text-glow-red'}`}>
              {result.isCorrect ? '✅ Correct!' : '❌ Wrong!'}
            </h2>
            
            <div className="text-4xl font-bold text-glow-cyan mb-4">
              +{result.xp} XP
              {result.bonusXp > 0 && <span className="text-glow-green"> +{result.bonusXp} Bonus</span>}
            </div>
            
            <div className="text-xl text-glow mb-6">
              <p>Total XP: {result.totalXp}</p>
              <p>Rank: {result.rank}</p>
            </div>

            {result.explanation && (
              <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-6 mb-6 text-left">
                <strong className="text-glow-cyan">🤖 AI Analysis:</strong>
                <p className="text-glow mt-2">{result.explanation}</p>
              </div>
            )}

            <RiskMeter redFlags={result.redFlags || []} />

            <button onClick={loadQuestion} className="btn-cyber mt-6">
              Next Round →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhishVsLegit;
