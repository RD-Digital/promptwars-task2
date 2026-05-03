import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCivicStore } from '../../hooks/useCivicStore';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ActionButtons } from '../QuickActions/ActionButtons';
import { logger } from '../../utils/logger';

/**
 * Main Container for the Civic AI Chat interface.
 * Coordinates between the message list and input form.
 */
export const ChatBox = () => {
  // Optimized Selectors for Efficiency
  const messages = useCivicStore(state => state.messages);
  const addMessage = useCivicStore(state => state.addMessage);
  const context = useCivicStore(state => state.context);
  const isTyping = useCivicStore(state => state.isTyping);
  const setTyping = useCivicStore(state => state.setTyping);
  const flowState = useCivicStore(state => state.flowState);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /**
   * Handles the message sending process including Gemini routing.
   * Prevents duplicate AI calls if already typing.
   */
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    logger.log("Processing message", { userText });
    
    addMessage(userText, 'user');
    setInput('');
    setTyping(true);

    try {
      const { askGeminiWithContext, getCivicAdvice } = await import('../../services/gemini');
      let aiResponse = "";

      const lowerQuery = userText.toLowerCase();
      
      // Dynamic Knowledge Routing
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
        const contextStr = JSON.stringify(context);
        aiResponse = await getCivicAdvice(contextStr, userText, messages);
      }
      
      addMessage(aiResponse, 'system');
    } catch (error) {
      logger.error("Message Routing Error", error);
      addMessage("I'm sorry, I'm having trouble connecting to my knowledge base.", 'system');
    } finally {
      setTyping(false);
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ display: 'flex', flexDirection: 'column', height: '60vh', overflow: 'hidden' }}
      role="main"
      aria-label="Civic AI Chat Interface"
    >
      <ChatMessageList 
        messages={messages} 
        isTyping={isTyping} 
        messagesEndRef={messagesEndRef} 
      />

      <div style={{ padding: '0 1rem' }}>
        <AnimatePresence>
          {!isTyping && messages.length > 2 && <ActionButtons flowState={flowState} />}
        </AnimatePresence>
      </div>

      <ChatInput 
        value={input} 
        onChange={setInput} 
        onSubmit={handleSend} 
        disabled={isTyping} 
      />
    </div>
  );
};
