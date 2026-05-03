import { create } from 'zustand';
import { evaluateUserContext } from '../core/DecisionEngine';
import { calculateReadinessScore } from '../core/ReadinessScore';
import { trackEvent } from '../utils/analytics';
import { saveMessage, debouncedUpdateState } from '../services/firestore';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ELECTION_DATE, DEFAULT_LOCALE, ANALYTICS_EVENTS, UI_STRINGS } from '../config/constants';

/**
 * Initial Application State.
 */
const initialState = {
  user: null,
  sessionId: null,
  context: {
    age: null,
    isRegistered: null,
    location: null,
    electionDate: ELECTION_DATE,
    daysRemaining: null,
    firstTimeVoter: null,
    preferredLanguage: DEFAULT_LOCALE,
    hasCheckedPolling: false,
    hasValidID: false,
    hasStarted: false,
  },
  messages: [{
    id: 1,
    sender: 'system',
    text: UI_STRINGS.WELCOME_MESSAGE,
    type: 'welcome'
  }],
  flowState: 'START',
  readinessScore: 0,
  isTyping: false,
};

/**
 * Zustand Store for CivicSense AI.
 * Implements high-efficiency state management with debounced persistence.
 */
export const useCivicStore = create((set, get) => ({
  ...initialState,

  // --- ACTIONS ---

  /**
   * Sets the authenticated user and hydrates session data.
   * @param {Object} user - Firebase Auth User object
   */
  setUser: async (user) => {
    if (user?.uid === get().user?.uid) return;

    set({ user, sessionId: user ? user.uid : null });
    
    if (user) {
      trackEvent(ANALYTICS_EVENTS.SESSION_STARTED, { uid: user.uid });
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const messages = data.messages || [];
          const remoteContext = data.context || {};
          
          set({ 
            messages: messages.length > 0 ? messages : initialState.messages,
            context: { ...initialState.context, ...remoteContext },
            flowState: remoteContext.stage || initialState.flowState,
            readinessScore: remoteContext.readinessScore || initialState.readinessScore
          });
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Store Hydration Error:", error);
      }
    }
  },

  /**
   * Appends a new message with duplicate prevention.
   * @param {string} text - Message text
   * @param {string} sender - 'user' or 'system'
   */
  addMessage: async (text, sender = 'user', type = 'text') => {
    const { messages, user } = get();
    
    // Duplicate Prevention
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.text === text && lastMsg?.sender === sender) return;

    const newMessage = { id: Date.now(), sender, text, type };
    
    set({ messages: [...messages, newMessage] });
    
    if (user?.uid) {
      trackEvent(ANALYTICS_EVENTS.USER_ACTIVE, { timestamp: Date.now() });
      await saveMessage(user.uid, newMessage);
    }
  },

  /**
   * Updates context and triggers decision logic with debounced persistence.
   * @param {Object} updates - Context partial updates
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
    
    if (user?.uid) {
      debouncedUpdateState(user.uid, {
        context: newContext,
        stage: evaluation.state,
        readinessScore: score,
        lastAction: Object.keys(updates)[0] || 'none'
      });
      trackEvent(ANALYTICS_EVENTS.READINESS_UPDATED, { score });
    }

    return evaluation;
  },

  /**
   * Toggles typing indicator.
   */
  setTyping: (status) => set({ isTyping: status }),

  /**
   * Resets application state.
   */
  resetStore: () => set(initialState),
}));
