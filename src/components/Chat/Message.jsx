import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceFooter } from './SourceFooter';

export const Message = ({ message }) => {
  const isUser = message.sender === 'user';
  
  let mainText = message.text || '';
  let sourceUrl = null;

  // Extract source URL if Gemini appended it (robust pattern matching)
  const sourceMatch = mainText.match(/Source:\s*(https?:\/\/[^\s]+)/i);
  if (!isUser && sourceMatch) {
    sourceUrl = sourceMatch[1];
    mainText = mainText.replace(/Source:\s*https?:\/\/[^\s]+/i, '').trim();
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message ${isUser ? 'message-user' : 'message-system'}`}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        background: isUser ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
        border: isUser ? 'none' : '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-sm)',
        color: isUser ? '#ffffff' : 'var(--text-primary)',
        lineHeight: '1.6',
      }}
    >
      <div style={{ 
        fontSize: '0.75rem', 
        opacity: 0.7, 
        marginBottom: '0.25rem', 
        fontWeight: 600,
        color: isUser ? 'rgba(255,255,255,0.9)' : 'var(--accent-primary)'
      }}>
        {isUser ? 'You' : 'CivicSense AI'}
      </div>
      
      {isUser ? (
        <div style={{ fontSize: '0.95rem' }}>{message.text}</div>
      ) : (
        <div className="markdown-body" style={{ fontSize: '0.95rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {mainText}
          </ReactMarkdown>
          <SourceFooter sourceUrl={sourceUrl} />
        </div>
      )}
    </motion.div>
  );
};
