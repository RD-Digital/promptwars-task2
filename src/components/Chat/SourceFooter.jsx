import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const SourceFooter = ({ sourceUrl }) => {
  if (!sourceUrl) return null;

  return (
    <div style={{
      marginTop: '1rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.8rem',
      color: 'var(--success)'
    }}>
      <ShieldCheck size={16} />
      <span>Verified Source:</span>
      <a 
        href={sourceUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          color: '#3b82f6',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        Official Link <ExternalLink size={12} />
      </a>
    </div>
  );
};
