import { logEvent as firebaseLogEvent } from "firebase/analytics";
import { analytics } from "../services/firebase";

/**
 * Reusable utility for Firebase Analytics tracking.
 * Includes strict guards to prevent app breaks if analytics is unavailable.
 * 
 * @param {string} name - Event name
 * @param {Object} params - Event parameters
 */
export function trackEvent(name, params = {}) {
  // Efficiency Guard: Early exit if analytics is not initialized or measurementId missing
  if (!analytics) return;

  try {
    firebaseLogEvent(analytics, name, params);
    
    // Development mode logging for debugging
    if (import.meta.env.DEV) {
      console.log(`[Analytics Tracked] Event: ${name}`, params);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Analytics tracking failed:", name, error);
    }
  }
}
