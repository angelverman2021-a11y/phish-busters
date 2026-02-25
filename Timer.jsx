import React, { useState, useEffect } from 'react';

const Timer = ({ duration = 15, onTimeout, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (onTick) onTick(duration - newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout, onTick, duration]);

  const percentage = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 5;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        <svg width="160" height="160" className="transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="12"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={isUrgent ? '#ff3b3b' : '#00eaff'}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
            style={{
              filter: `drop-shadow(0 0 ${isUrgent ? '15px #ff3b3b' : '10px #00eaff'})`
            }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-5xl font-bold ${
          isUrgent ? 'text-glow-red animate-pulse' : 'text-glow-cyan'
        }`}>
          {timeLeft}s
        </div>
      </div>
    </div>
  );
};

export default Timer;
