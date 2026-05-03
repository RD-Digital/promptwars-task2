import React from 'react';
import { Home } from './pages/Home';

function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Home />
    </div>
  );
}

export default App;
