import React from 'react';

const RiskMeter = ({ redFlags = [] }) => {
  const riskLevel = redFlags.length >= 3 ? 'HIGH' : redFlags.length >= 1 ? 'MEDIUM' : 'LOW';
  const percentage = Math.min((redFlags.length / 4) * 100, 100);
  
  const getColor = () => {
    if (riskLevel === 'HIGH') return { bg: 'bg-red-600', text: 'text-glow-red', glow: 'shadow-glow-red' };
    if (riskLevel === 'MEDIUM') return { bg: 'bg-yellow-500', text: 'text-yellow-400', glow: 'shadow-glow-cyan' };
    return { bg: 'bg-green-500', text: 'text-glow-green', glow: 'shadow-glow-green' };
  };

  const colors = getColor();

  return (
    <div className="bg-cyber-dark rounded-xl p-6 border border-gray-800">
      <h4 className="text-2xl font-bold text-glow mb-4">
        Risk Level: <span className={colors.text}>{riskLevel}</span>
      </h4>
      
      <div className="h-8 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
        <div 
          className={`h-full ${colors.bg} ${colors.glow} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {redFlags.length > 0 && (
        <div className="mt-6 bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-4">
          <strong className="text-yellow-400 text-lg">🚩 Red Flags:</strong>
          <ul className="mt-3 space-y-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="text-yellow-200 flex items-start gap-2">
                <span className="text-yellow-500">▸</span>
                <span>{flag.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskMeter;
