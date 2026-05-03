import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const SourceFooter = ({ sourceUrl }) => {
  if (!sourceUrl) return null;

  return (
    <div style={{
      marginTop: '1.25rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.6rem',
      fontSize: '0.85rem',
      color: 'var(--success)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: '1' }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, color: '#10b981' }} />
        <span style={{ fontWeight: 600, marginTop: '1px' }}>Verified Source:</span>
      </div>
      <a 
        href={sourceUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          color: '#2563eb',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontWeight: 600,
          background: 'rgba(37, 99, 235, 0.05)',
          padding: '0.2rem 0.5rem',
          borderRadius: '6px',
          transition: 'var(--transition-fast)'
        }}
        className="hover-glow"
      >
        Official Link <ExternalLink size={12} />
      </a>
    </div>
  );
};
