import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCivicStore } from '../../hooks/useCivicStore';
import { Message } from './Message';
import { ActionButtons } from '../QuickActions/ActionButtons';
import { StarterQuestions } from '../QuickActions/StarterQuestions';
import { getCivicAdvice } from '../../services/gemini';
import { trackEvent } from '../../utils/analytics';
import { Send } from 'lucide-react';

export const ChatBox = () => {
  const { messages, addMessage, context, isTyping, setTyping, flowState } = useCivicStore();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    addMessage(userText, 'user');
    setInput('');
    setTyping(true);

    const { askGeminiWithContext, getCivicAdvice } = await import('../../services/gemini');
    let aiResponse = "";

    // Civic AI Knowledge Assistant Logic Routing
    const lowerQuery = userText.toLowerCase();
    if (lowerQuery.includes("west bengal") || lowerQuery.includes("candidates")) {
      const data = await import('../../data/candidates_wb.json');
      aiResponse = await askGeminiWithContext(userText, data.default, data.default.source);
    } else if (lowerQuery.includes("current election")) {
      const data = await import('../../data/elections.json');
      aiResponse = await askGeminiWithContext(userText, data.default, data.default.source);
    } else if (lowerQuery.includes("eligibility") || lowerQuery.includes("result")) {
      const data = await import('../../data/faq.json');
      aiResponse = await askGeminiWithContext(userText, data.default, data.default.source);
    } else {
      // Fallback to standard context-aware advice
      const contextStr = JSON.stringify(context);
      aiResponse = await getCivicAdvice(contextStr, userText, messages);
    }
    
    setTyping(false);
    addMessage(aiResponse, 'system');
    trackEvent('ai_response_used', { query: userText });
  };

  return (
    <div 
      className="glass-panel" 
      style={{ display: 'flex', flexDirection: 'column', height: '60vh', overflow: 'hidden' }}
      role="main"
      aria-label="Civic AI Chat Interface"
    >
      <div 
        style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        aria-live="polite"
        role="log"
        aria-label="Message history"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          {!isTyping && messages.length <= 2 && (
            <StarterQuestions />
          )}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="skeleton"
              style={{ padding: '1rem', width: '60%', borderRadius: 'var(--radius-md)' }}
              aria-label="AI is typing..."
            />
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '0 1rem' }}>
        <AnimatePresence>
          {!isTyping && messages.length > 2 && <ActionButtons flowState={flowState} />}
        </AnimatePresence>
      </div>

      <form 
        onSubmit={handleSend} 
        style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '0.5rem' }}
        aria-label="Send a civic question"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a civic question..."
          aria-label="Chat input"
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'var(--font-family)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem' }}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
