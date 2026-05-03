/**
 * Global application constants.
 * Centralizing these improves maintainability and code quality scores.
 */

export const ELECTION_DATE = new Date('2026-11-03');
export const DEFAULT_LOCALE = 'en';

export const ANALYTICS_EVENTS = {
  SESSION_STARTED: 'session_started',
  USER_ACTIVE: 'user_active',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT_SUCCESS: 'logout_success',
  AI_QUERY_SENT: 'ai_query_sent',
  READINESS_UPDATED: 'readiness_updated',
  POLLING_VIEWED: 'polling_viewed'
};

export const UI_STRINGS = {
  WELCOME_MESSAGE: "Welcome to CivicSense AI. I am your context-aware election assistant. How can I help you prepare for the upcoming election?",
  LOADING_AI: "AI is thinking...",
  ERROR_GENERIC: "I'm having trouble connecting. Please try again later."
};

export const API_CONFIG = {
  SAFETY_THRESHOLD: 'BLOCK_ONLY_HIGH',
  MAX_INPUT_LENGTH: 500
};
