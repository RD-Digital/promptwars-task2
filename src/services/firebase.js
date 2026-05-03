import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

/**
 * Firebase Production Configuration.
 * No hardcoded secrets, strictly using environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export let app, db, analytics, auth, provider;

// Initialize Firebase only if API key is present and valid
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    
    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error("Firebase Init Error:", error);
  }
}

/**
 * Authenticates user via Google popup.
 * Throws explicit error if Firebase is not configured.
 */
export const signInWithGoogle = async () => {
  if (!auth || !provider) {
    throw new Error("Firebase Auth is not initialized. Please check your environment variables.");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Signs out the current user.
 */
export const signOutUser = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Logout failed:", error);
  }
};

/**
 * Subscribes to auth state changes.
 */
export const subscribeToAuth = (callback) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};
