import { create } from 'zustand';
import { evaluateUserContext } from '../core/DecisionEngine';
import { calculateReadinessScore } from '../core/ReadinessScore';
import { trackEvent } from '../utils/analytics';
import { saveMessage, getMessages, updateUserState } from '../services/firestore';

const generateId = () => Math.random().toString(36).substring(2, 9);
const fallbackSessionId = generateId();

const INITIAL_MESSAGE = {
  id: 1,
  sender: 'system',
  text: 'Welcome to CivicSense AI. I am your context-aware election assistant. How can I help you prepare for the upcoming election?',
  type: 'welcome'
};

export const useCivicStore = create((set, get) => ({
  user: null,
  sessionId: fallbackSessionId,
  context: {
    age: null,
    isRegistered: null,
    location: null,
    electionDate: new Date('2026-11-03'),
    daysRemaining: null,
    firstTimeVoter: null,
    preferredLanguage: 'en',
    hasCheckedPolling: false,
    hasValidID: false,
    hasStarted: false,
  },
  messages: [INITIAL_MESSAGE],
  flowState: 'START',
  readinessScore: 0,
  isTyping: false,

  setUser: async (user) => {
    set({ user, sessionId: user ? user.uid : fallbackSessionId });
    
    if (user) {
      // Hydrate UI state from Firestore on login
      try {
        const storedMessages = await getMessages(user.uid);
        if (storedMessages && storedMessages.length > 0) {
          set({ messages: storedMessages });
        }
      } catch (error) {
        console.error("Failed to hydrate session:", error);
      }
    }
  },

  addMessage: async (text, sender = 'user', type = 'text') => {
    const newMessage = { id: Date.now(), sender, text, type };
    
    const state = get();
    // Log flow started on first user message
    if (sender === 'user' && state.messages.length === 1) {
      trackEvent('flow_started');
    }

    set((state) => ({ messages: [...state.messages, newMessage] }));
    
    const currentUser = get().user;
    if (currentUser) {
      await saveMessage(currentUser.uid, newMessage);
    }

    // Analytics tracking
    if (sender === 'user') {
      trackEvent('user_message_sent');
    } else if (sender === 'system') {
      trackEvent('ai_responded');
    }
  },

  updateContext: async (updates) => {
    const currentContext = get().context;
    
    // Calculate days remaining dynamically
    const today = new Date();
    const diffTime = Math.abs(currentContext.electionDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const newContext = { ...currentContext, ...updates, daysRemaining: diffDays };
    
    const evaluation = evaluateUserContext(newContext);
    const score = calculateReadinessScore(newContext);

    set({ context: newContext, flowState: evaluation.state, readinessScore: score });
    
    // Log state change to Analytics
    trackEvent('decision_engine_triggered', { state: evaluation.state });
    trackEvent('readiness_score_generated', { score });
    
    // Sync state to Firestore user document
    const currentUser = get().user;
    if (currentUser) {
      await updateUserState(currentUser.uid, {
        context: newContext,
        stage: evaluation.state,
        readinessScore: score,
        lastAction: Object.keys(updates)[0] || 'none'
      });
    }

    return evaluation;
  },

  setTyping: (status) => set({ isTyping: status }),
}));
