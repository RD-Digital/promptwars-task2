import { logEvent as firebaseLogEvent } from "firebase/analytics";
import { analytics } from "../services/firebase";

/**
 * Reusable utility for Firebase Analytics tracking.
 * Fail silently if analytics is not initialized to prevent app breaks.
 * @param {string} name - Event name
 * @param {object} params - Event parameters
 */
export function trackEvent(name, params = {}) {
  // Only execute on client side where analytics is initialized
  if (typeof window !== "undefined" && analytics) {
    try {
      firebaseLogEvent(analytics, name, params);
      
      // Development logging
      if (import.meta.env.DEV) {
        console.log(`[Analytics Tracked] Event: ${name}`, params);
      }
    } catch (error) {
      console.warn("Analytics error, failed to track event:", name, error);
    }
  }
}
