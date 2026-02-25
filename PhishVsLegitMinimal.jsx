import React, { useState } from 'react';
import axios from 'axios';
import Timer from '../TimerMinimal';
import RiskMeter from '../RiskMeterMinimal';

const PhishVsLegit = ({ userId }) => {
  const [state, setState] = useState('playing'); // playing, why, result
  const [msgA] = useState({ id: 1, text: "URGENT! Click now!" });
  const [msgB] = useState({ id: 2, text: "Meeting at 3pm" });
  const [selectedId, setSelectedId] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [clueUsed, setClueUsed] = useState(false);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);

  const handleSelect = async (id) => {
    setSelectedId(id);
    const res = await axios.post('http://localhost:5000/api/game/check-answer', {
      userId, selectedId: id, timeTaken, clueUsed
    });
    setResult(res.data);
    setStreak(res.data.streak);
    setState(res.data.isCorrect ? 'why' : 'result');
  };

  const handleReason = async (reason) => {
    const res = await axios.post('http://localhost:5000/api/game/submit-reason', {
      userId, messageId: selectedId, reason
    });
    setResult({ ...result, ...res.data });
    setState('result');
  };

  const handleClue = async () => {
    const res = await axios.post('http://localhost:5000/api/game/get-clue', {});
    alert(res.data.clue);
    setClueUsed(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Phish vs Legit</h2>
      <p>Streak: {streak} 🔥</p>

      {state === 'playing' && (
        <>
          <Timer duration={15} onTimeout={() => handleSelect(msgA.id)} onTick={setTimeTaken} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
            <div onClick={() => handleSelect(msgA.id)} style={{ border: '2px solid blue', padding: '20px', cursor: 'pointer' }}>
              <h3>Message A</h3>
              <p>{msgA.text}</p>
            </div>
            <div onClick={() => handleSelect(msgB.id)} style={{ border: '2px solid blue', padding: '20px', cursor: 'pointer' }}>
              <h3>Message B</h3>
              <p>{msgB.text}</p>
            </div>
          </div>
          <button onClick={handleClue} disabled={clueUsed}>💡 Clue (-5 XP)</button>
        </>
      )}

      {state === 'why' && (
        <div>
          <h3>Why is it phishing?</h3>
          <button onClick={() => handleReason('urgency')}>Urgency</button>
          <button onClick={() => handleReason('suspicious_link')}>Suspicious Link</button>
          <button onClick={() => handleReason('grammar')}>Grammar</button>
          <button onClick={() => handleReason('asking_otp')}>Asking OTP</button>
        </div>
      )}

      {state === 'result' && result && (
        <div>
          <h2>{result.isCorrect ? '✅ Correct!' : '❌ Wrong!'}</h2>
          <p>XP: +{result.xp}</p>
          {result.streakBonus > 0 && <h1 style={{ color: 'gold' }}>🎉 STREAK x5! +50 XP!</h1>}
          {result.explanation && <p>{result.explanation}</p>}
          <RiskMeter redFlags={result.redFlags || []} />
          <button onClick={() => window.location.reload()}>Next</button>
        </div>
      )}
    </div>
  );
};

export default PhishVsLegit;
