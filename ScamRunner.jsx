import React, { useEffect, useRef, useState } from 'react';

const obstacles = [
  { type: 'email', text: 'URGENT: Account suspended!', action: 'jump', bias: 'Urgency', xp: 10 },
  { type: 'link', text: 'amaz0n-verify.com', action: 'duck', bias: 'Fake Domain', xp: 15 },
  { type: 'otp', text: 'Share OTP to verify', action: 'verify', bias: 'Authority', xp: 20 },
  { type: 'kyc', text: 'Complete KYC NOW or account blocked', action: 'jump', bias: 'Fear + Urgency', xp: 25 },
  { type: 'call', text: 'Bank calling: Share card details', action: 'verify', bias: 'Authority', xp: 30 },
  { type: 'prize', text: 'You won ₹50,000! Click here', action: 'duck', bias: 'Reward', xp: 15 },
  { type: 'safe', text: 'Meeting reminder from colleague', action: 'ignore', bias: 'None', xp: 5 }
];

export default function ScamRunner() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({ score: 0, health: 3, combo: 0, level: 1, gameOver: false });
  const [feedback, setFeedback] = useState({ msg: '', color: '#fff' });
  
  const gameRef = useRef({
    running: true, paused: false, playerY: 200, jumping: false, ducking: false,
    obstacleList: [], powerUps: [], speed: 3, distance: 0, shield: false, scanner: false
  });

  useEffect(() => {
    const handleKey = (e) => {
      const g = gameRef.current;
      if (!g.running || g.paused) return;

      if (e.key === 'ArrowUp' && !g.jumping) {
        g.jumping = true;
        setTimeout(() => g.jumping = false, 500);
      } else if (e.key === 'ArrowDown') {
        g.ducking = true;
        setTimeout(() => g.ducking = false, 300);
      } else if (e.key === ' ' || e.key === 'ArrowRight') {
        checkAction(e.key === ' ' ? 'verify' : 'ignore');
      }
    };

    window.addEventListener('keydown', handleKey);
    const interval = setInterval(gameLoop, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKey);
      clearInterval(interval);
    };
  }, []);

  const checkAction = (action) => {
    const g = gameRef.current;
    const nearest = g.obstacleList.find(o => o.x > 30 && o.x < 120);
    if (!nearest) return;

    if (nearest.action === action || (action === 'ignore' && nearest.type === 'safe')) {
      const newScore = gameState.score + nearest.xp;
      const newCombo = gameState.combo + 1;
      setGameState(prev => ({ ...prev, score: newScore, combo: newCombo }));
      setFeedback({ msg: `✓ Correct! +${nearest.xp} XP`, color: '#00ff88' });
      g.obstacleList = g.obstacleList.filter(o => o !== nearest);
    } else {
      takeDamage(nearest);
    }
  };

  const takeDamage = (obs) => {
    const g = gameRef.current;
    const newHealth = gameState.health - 1;
    
    if (newHealth <= 0) {
      g.running = false;
      setGameState(prev => ({ ...prev, health: 0, gameOver: true }));
      return;
    }

    setGameState(prev => ({ ...prev, health: newHealth, combo: 0 }));
    g.paused = true;
    setFeedback({ msg: `✗ Wrong! Red Flag: ${obs.bias}`, color: '#ff3b3b' });
    
    setTimeout(() => {
      setFeedback({ msg: `Tip: ${obs.text} requires "${obs.action}" action`, color: '#00eaff' });
      setTimeout(() => g.paused = false, 1500);
    }, 1000);
  };

  const gameLoop = () => {
    const g = gameRef.current;
    if (!g.running || g.paused) return;

    g.distance++;
    if (g.distance % 500 === 0) {
      const newLevel = gameState.level + 1;
      g.speed += 0.5;
      setGameState(prev => ({ ...prev, level: newLevel }));
      setFeedback({ msg: `🎉 Level ${newLevel}! Speed increased`, color: '#00eaff' });
    }

    g.obstacleList.forEach(o => o.x -= g.speed);
    g.obstacleList = g.obstacleList.filter(o => o.x > -100);
    
    g.powerUps.forEach(p => p.x -= g.speed);
    g.powerUps = g.powerUps.filter(p => p.x > -50);

    if (Math.random() < 0.02 + gameState.level * 0.005) {
      const obs = obstacles[Math.floor(Math.random() * obstacles.length)];
      g.obstacleList.push({ ...obs, x: 600, y: 250, width: 80, height: 60 });
    }

    if (Math.random() < 0.01) {
      const powerUp = ['shield', 'scanner', 'clear'][Math.floor(Math.random() * 3)];
      g.powerUps.push({ type: powerUp, x: 600, y: 150, width: 30, height: 30 });
    }

    checkCollisions();
    render();
  };

  const checkCollisions = () => {
    const g = gameRef.current;
    const playerX = 50, playerHeight = g.jumping ? 40 : g.ducking ? 30 : 50;
    const playerTop = g.jumping ? g.playerY - 80 : g.ducking ? g.playerY + 20 : g.playerY;

    g.obstacleList.forEach(obs => {
      if (obs.x > playerX - 40 && obs.x < playerX + 40 && 
          obs.y > playerTop - 30 && obs.y < playerTop + playerHeight) {
        
        if (obs.type === 'safe') {
          setGameState(prev => ({ ...prev, score: prev.score + obs.xp }));
          setFeedback({ msg: 'Safe message ignored ✓', color: '#00eaff' });
        } else if (!g.shield) {
          takeDamage(obs);
        } else {
          g.shield = false;
          setFeedback({ msg: '🛡️ Shield absorbed hit!', color: '#ffaa00' });
        }
        g.obstacleList = g.obstacleList.filter(o => o !== obs);
      }
    });

    g.powerUps.forEach(p => {
      if (p.x > playerX - 30 && p.x < playerX + 30) {
        if (p.type === 'shield') {
          g.shield = true;
          setFeedback({ msg: '🛡️ Shield Active!', color: '#ffaa00' });
        } else if (p.type === 'scanner') {
          g.scanner = true;
          setFeedback({ msg: '🔍 Scanner Active!', color: '#00eaff' });
          setTimeout(() => g.scanner = false, 5000);
        } else if (p.type === 'clear') {
          g.obstacleList = [];
          setFeedback({ msg: '💥 All traps cleared!', color: '#00ff88' });
        }
        g.powerUps = g.powerUps.filter(pw => pw !== p);
      }
    });
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;

    ctx.clearRect(0, 0, 600, 400);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 300, 600, 100);
    
    const py = g.jumping ? g.playerY - 80 : g.ducking ? g.playerY + 20 : g.playerY;
    ctx.fillStyle = g.shield ? '#ffaa00' : '#00eaff';
    ctx.fillRect(50, py, 30, g.jumping ? 40 : g.ducking ? 30 : 50);
    
    g.obstacleList.forEach(o => {
      ctx.fillStyle = o.type === 'safe' ? '#00ff88' : '#ff3b3b';
      if (g.scanner) ctx.fillStyle = o.type === 'safe' ? '#00ff88' : '#ff0000';
      ctx.fillRect(o.x, o.y, o.width, o.height);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(o.type.toUpperCase(), o.x + 5, o.y + 35);
    });
    
    g.powerUps.forEach(p => {
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.fillText(p.type === 'shield' ? '🛡️' : p.type === 'scanner' ? '🔍' : '💥', p.x + 5, p.y + 20);
    });
  };

  if (gameState.gameOver) {
    const accuracy = Math.round((gameState.score / (gameRef.current.distance / 10)) * 100) || 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark via-dark to-gray-900 p-8">
        <div className="max-w-2xl mx-auto bg-dark border-2 border-cyan rounded-lg p-8 text-center">
          <h2 className="text-4xl font-bold text-cyan mb-6">🎮 Game Over</h2>
          <div className="text-6xl text-correct mb-8">{gameState.score} XP</div>
          <div className="text-left space-y-3 text-lg mb-8">
            <p>📊 Level Reached: {gameState.level}</p>
            <p>🎯 Accuracy: {accuracy}%</p>
            <p>🔥 Best Combo: {gameState.combo}</p>
            <p>📏 Distance: {Math.floor(gameRef.current.distance / 10)}m</p>
          </div>
          <button onClick={() => window.location.reload()} className="btn-cyber">Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark to-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-glow">🎮 Scam Runner</h1>
        
        <canvas ref={canvasRef} width="600" height="400" 
          className="w-full border-2 border-cyan rounded-lg mb-4" 
          style={{ background: '#0f0f0f' }} />
        
        <div className="flex justify-between text-white mb-4">
          <div>❤️ Health: <span className="text-wrong">{gameState.health}</span></div>
          <div>🎯 Score: <span className="text-correct">{gameState.score}</span></div>
          <div>🔥 Combo: <span className="text-cyan">{gameState.combo}</span></div>
          <div>📊 Level: <span className="text-cyan">{gameState.level}</span></div>
        </div>
        
        <div className="text-cyan text-sm mb-4 text-center">
          Controls: <kbd className="px-2 py-1 bg-gray-800 rounded">↑</kbd> Jump | 
          <kbd className="px-2 py-1 bg-gray-800 rounded ml-2">↓</kbd> Duck | 
          <kbd className="px-2 py-1 bg-gray-800 rounded ml-2">Space</kbd> Verify | 
          <kbd className="px-2 py-1 bg-gray-800 rounded ml-2">→</kbd> Ignore
        </div>
        
        <div className="card-cyber min-h-[60px] flex items-center justify-center" 
          style={{ color: feedback.color }}>
          {feedback.msg}
        </div>
      </div>
    </div>
  );
}
