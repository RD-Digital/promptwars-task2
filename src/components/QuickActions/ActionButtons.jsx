import React from 'react';
import { motion } from 'framer-motion';
import { useCivicStore } from '../../hooks/useCivicStore';
import { trackEvent } from '../../utils/analytics';

export const ActionButtons = () => {
  const { addMessage, context, setTyping, messages, flowState, updateContext } = useCivicStore();

  const handleAction = async (message) => {
    trackEvent('starter_question_clicked', { question: message });
    addMessage(message, 'user');
    setTyping(true);
    
    try {
      if (flowState === 'START') {
        updateContext({ hasStarted: true });
      }

      const { askGeminiWithContext, getCivicAdvice } = await import('../../services/gemini');
      let aiResponse = "";

      // Civic AI Knowledge Assistant Logic Routing
      if (message === "West Bengal Candidates") {
        const data = await import('../../data/candidates_wb.json');
        aiResponse = await askGeminiWithContext(message, data.default, data.default.source);
      } else if (message === "Current Elections") {
        const data = await import('../../data/elections.json');
        aiResponse = await askGeminiWithContext(message, data.default, data.default.source);
      } else if (message === "Voting Eligibility" || message === "Election Results") {
        const data = await import('../../data/faq.json');
        aiResponse = await askGeminiWithContext(message, data.default, data.default.source);
      } else {
        // Fallback to standard context-aware advice for other inputs like the Map trigger
        aiResponse = await getCivicAdvice(JSON.stringify(context), message, messages);
      }
      
      setTyping(false);
      addMessage(aiResponse, 'system');
    } catch (error) {
      console.error('Error handling action:', error);
      setTyping(false);
      addMessage("I'm sorry, I'm having trouble processing that right now. Could you ask me directly?", 'system');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="no-scrollbar"
      style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        overflowX: 'auto',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("West Bengal Candidates")}>
        West Bengal Candidates
      </button>
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("Current Elections")}>
        Current Elections
      </button>
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("Voting Eligibility")}>
        Voting Eligibility
      </button>
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("Election Results")}>
        Election Results
      </button>
      <button className="btn btn-primary glass-pill" onClick={() => {
        updateContext({ hasCheckedPolling: false }); 
        handleAction("Find my polling station");
      }} style={{ boxShadow: 'var(--shadow-glow)' }}>
        Find my polling station 📍
      </button>
    </motion.div>
  );
};
