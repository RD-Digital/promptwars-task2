import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { trackEvent } from "../utils/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000:web:000",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-000"
};

export let app, db, analytics, auth;
const provider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error("Firebase initialization failed, using local fallbacks.", error);
}

// Fallback logic for failures
const localStore = new Map();

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Auth not initialized");
  try {
    const result = await signInWithPopup(auth, provider);
    trackEvent("login_success", { method: "google" });
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    trackEvent("login_failed", { error: error.message });
    throw error;
  }
};

export const signOutUser = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
    trackEvent("logout_success");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const subscribeToAuth = (callback) => {
  if (!auth) return () => { };
  return onAuthStateChanged(auth, callback);
};

export const saveUserSession = async (userId, sessionData) => {
  if (db) {
    try {
      await setDoc(doc(db, "users", userId), sessionData, { merge: true });
    } catch (error) {
      console.error("Firestore error, saving to local state backup:", error);
      localStore.set(userId, { ...(localStore.get(userId) || {}), ...sessionData });
    }
  } else {
    localStore.set(userId, { ...(localStore.get(userId) || {}), ...sessionData });
  }
};

export const getUserSession = async (userId) => {
  if (db) {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.error("Firestore error, reading from local state backup:", error);
      return localStore.get(userId) || null;
    }
  }
  return localStore.get(userId) || null;
};
