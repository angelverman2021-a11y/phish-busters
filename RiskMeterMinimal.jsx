import React from 'react';

const RiskMeter = ({ redFlags }) => {
  const level = redFlags.length >= 2 ? 'HIGH' : redFlags.length >= 1 ? 'MEDIUM' : 'LOW';
  const color = level === 'HIGH' ? 'red' : level === 'MEDIUM' ? 'orange' : 'green';
  
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
      <h4>Risk: <span style={{ color }}>{level}</span></h4>
      <div style={{ height: '20px', background: '#ddd', borderRadius: '10px' }}>
        <div style={{ 
          width: `${(redFlags.length / 3) * 100}%`, 
          height: '100%', 
          background: color, 
          borderRadius: '10px',
          transition: 'width 1s'
        }} />
      </div>
      {redFlags.length > 0 && <ul>{redFlags.map((f, i) => <li key={i}>{f}</li>)}</ul>}
    </div>
  );
};

export default RiskMeter;
