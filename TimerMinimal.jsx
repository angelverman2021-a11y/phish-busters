import React, { useState, useEffect } from 'react';

const Timer = ({ duration, onTimeout, onTick }) => {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (time <= 0) { onTimeout(); return; }
    const timer = setInterval(() => {
      setTime(t => { onTick(duration - t + 1); return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  return <div style={{ fontSize: '24px', color: time <= 5 ? 'red' : 'blue' }}>{time}s</div>;
};

export default Timer;
