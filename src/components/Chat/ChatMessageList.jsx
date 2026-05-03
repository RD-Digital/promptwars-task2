import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from './Message';
import { StarterQuestions } from '../QuickActions/StarterQuestions';
import PropTypes from 'prop-types';

/**
 * Renders the scrollable list of chat messages and starter questions.
 * 
 * @param {Object} props
 * @param {Array} props.messages - List of message objects.
 * @param {boolean} props.isTyping - Whether the AI is currently typing.
 * @param {React.RefObject} props.messagesEndRef - Ref for auto-scrolling to bottom.
 */
export const ChatMessageList = ({ messages, isTyping, messagesEndRef }) => {
  return (
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
  );
};

ChatMessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  isTyping: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired
};
