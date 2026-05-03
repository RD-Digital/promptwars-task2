import { create } from 'zustand';
import { evaluateUserContext } from '../core/DecisionEngine';
import { calculateReadinessScore } from '../core/ReadinessScore';
import { trackEvent } from '../utils/analytics';
import { saveMessage, getMessages, updateUserState } from '../services/firestore';
import { APP_CONFIG } from '../core/config';

/**
 * Type Definition for Civic State
 */
const initialState = {
  user: null,
  sessionId: Math.random().toString(36).substring(2, 9),
  context: {
    age: null,
    isRegistered: null,
    location: null,
    electionDate: APP_CONFIG.ELECTION_DATE,
    daysRemaining: null,
    firstTimeVoter: null,
    preferredLanguage: APP_CONFIG.FALLBACK_LOCALE,
    hasCheckedPolling: false,
    hasValidID: false,
    hasStarted: false,
  },
  messages: [{
    id: 1,
    sender: 'system',
    text: 'Welcome to CivicSense AI. I am your context-aware election assistant. How can I help you prepare for the upcoming election?',
    type: 'welcome'
  }],
  flowState: 'START',
  readinessScore: 0,
  isTyping: false,
};

/**
 * Centralized Store for CivicSense AI application state.
 * Uses Zustand for efficient reactive state management.
 */
export const useCivicStore = create((set, get) => ({
  ...initialState,

  // --- ACTIONS ---

  /**
   * Sets the authenticated user and hydrates session data.
   */
  setUser: async (user) => {
    set({ user, sessionId: user ? user.uid : initialState.sessionId });
    
    if (user) {
      try {
        const storedMessages = await getMessages(user.uid);
        if (storedMessages?.length > 0) {
          set({ messages: storedMessages });
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Store Hydration Failed:", error);
      }
    }
  },

  /**
   * Appends a new message to the thread and syncs with Firestore.
   */
  addMessage: async (text, sender = 'user', type = 'text') => {
    const newMessage = { id: Date.now(), sender, text, type };
    const { messages, user } = get();
    
    if (sender === 'user' && messages.length === 1) {
      trackEvent('flow_started');
    }

    set({ messages: [...messages, newMessage] });
    
    if (user) {
      await saveMessage(user.uid, newMessage);
    }

    trackEvent(sender === 'user' ? 'user_message_sent' : 'ai_responded');
  },

  /**
   * Updates civic context and triggers the Decision Engine.
   */
  updateContext: async (updates) => {
    const { context, user } = get();
    
    const today = new Date();
    const diffTime = Math.abs(context.electionDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const newContext = { ...context, ...updates, daysRemaining: diffDays };
    const evaluation = evaluateUserContext(newContext);
    const score = calculateReadinessScore(newContext);

    set({ context: newContext, flowState: evaluation.state, readinessScore: score });
    
    trackEvent('decision_engine_triggered', { state: evaluation.state });
    trackEvent('readiness_score_generated', { score });
    
    if (user) {
      await updateUserState(user.uid, {
        context: newContext,
        stage: evaluation.state,
        readinessScore: score,
        lastAction: Object.keys(updates)[0] || 'none'
      });
    }

    return evaluation;
  },

  /**
   * Toggles the AI typing indicator.
   */
  setTyping: (status) => set({ isTyping: status }),

  /**
   * Resets the store to initial state.
   */
  resetStore: () => set(initialState),
}));

// --- SELECTORS ---
// (Optional helpers for performance optimization)
export const selectIsAuth = (state) => !!state.user;
export const selectReadiness = (state) => state.readinessScore;
