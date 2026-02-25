import React from 'react';
import PhishVsLegit from './components/games/PhishVsLegit';

function App() {
  // Replace with actual user ID from authentication
  const userId = "user123";

  return (
    <div className="App">
      <PhishVsLegit userId={userId} />
    </div>
  );
}

export default App;
