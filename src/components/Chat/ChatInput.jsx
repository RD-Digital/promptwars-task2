import React from 'react';
import { Send } from 'lucide-react';

/**
 * Chat input form with submit handler.
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value.
 * @param {Function} props.onChange - Input change handler.
 * @param {Function} props.onSubmit - Form submit handler.
 * @param {boolean} props.disabled - Whether input is disabled.
 */
export const ChatInput = ({ value, onChange, onSubmit, disabled }) => {
  return (
    <form 
      onSubmit={onSubmit} 
      style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '0.5rem' }}
      aria-label="Send a civic question"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask a civic question..."
        aria-label="Chat input"
        disabled={disabled}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
          outline: 'none',
          fontFamily: 'var(--font-family)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
          opacity: disabled ? 0.6 : 1
        }}
      />
      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem' }}
        aria-label="Send message"
        disabled={disabled}
      >
        <Send size={20} />
      </button>
    </form>
  );
};
