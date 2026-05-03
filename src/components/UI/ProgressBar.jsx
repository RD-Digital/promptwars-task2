import React from 'react';

export const ProgressBar = ({ score }) => {
  return (
    <div className="progress-container" style={{ width: '100%', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Voting Readiness</span>
        <span style={{ fontWeight: 700, color: 'var(--success)' }}>{score}%</span>
      </div>
      <div 
        className="glass-panel"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Voting readiness progress"
        style={{ 
          height: '12px', 
          width: '100%', 
          overflow: 'hidden', 
          padding: '2px',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${score}%`, 
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};
