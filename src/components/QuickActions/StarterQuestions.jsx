import React from 'react';
import { motion } from 'framer-motion';
import { useCivicStore } from '../../hooks/useCivicStore';
import { trackEvent } from '../../utils/analytics';

export const StarterQuestions = () => {
  const { addMessage, context, setTyping, messages, updateContext } = useCivicStore();

  const handleAction = async (message) => {
    trackEvent('starter_question_clicked', { question: message });
    addMessage(message, 'user');
    setTyping(true);
    
    try {
      const { getCivicAdvice } = await import('../../services/gemini');
      const aiResponse = await getCivicAdvice(JSON.stringify(context), message, messages);
      setTyping(false);
      addMessage(aiResponse, 'system');
    } catch (error) {
      console.error('Error handling action:', error);
      setTyping(false);
      addMessage("I'm sorry, I'm having trouble processing that right now. Could you ask me directly?", 'system');
    }
  };

  if (messages.length > 2) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}
      role="group"
      aria-label="Suggested starter questions"
    >
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("What are my fundamental voting rights? 📜")}>
        What are my voting rights? 📜
      </button>
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("How do I register to vote in my state? 📝")}>
        How to register to vote? 📝
      </button>
      <button className="btn btn-secondary glass-pill" onClick={() => handleAction("What is the latest Pan-India election news? 📰")}>
        Latest Election News 📰
      </button>
      <button className="btn btn-primary glass-pill" onClick={() => {
        updateContext({ hasCheckedPolling: false });
        handleAction("Help me find my polling station. 📍");
      }}>
        Find my polling station 📍
      </button>
    </motion.div>
  );
};
