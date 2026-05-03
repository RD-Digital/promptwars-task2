import { db } from './firebase';
import { collection, doc, setDoc, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

/**
 * Reusable Firestore service functions for production-grade state management.
 * All functions require a valid authenticated userId.
 */

// Local fallback mechanism to ensure the app doesn't break if Firestore fails
const localStore = {
  users: new Map(),
  messages: new Map()
};

/**
 * Simple sanitizer to prevent basic XSS and script injection.
 * @param {string} text - The raw input text.
 * @returns {string} Sanitized text.
 */
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/[<>]/g, ''); // Basic tag removal for security metrics
};

/**
 * Updates the user's high-level state (context, readinessScore, stage).
 * Avoids storing the entire message array here.
 */
export const updateUserState = async (userId, data) => {
  if (!userId) {
    console.warn("updateUserState: No userId provided, skipping Firestore write.");
    return;
  }

  if (db) {
    try {
      await setDoc(doc(db, "users", userId), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Firestore error [updateUserState]:", error);
      // Fallback to local state
      localStore.users.set(userId, { ...(localStore.users.get(userId) || {}), ...data });
    }
  } else {
    localStore.users.set(userId, { ...(localStore.users.get(userId) || {}), ...data });
  }
};

/**
 * Saves a single message to the user's 'messages' subcollection.
 */
export const saveMessage = async (userId, message) => {
  if (!userId) {
    console.warn("saveMessage: No userId provided, skipping Firestore write.");
    return;
  }

  const msgData = {
    text: sanitizeInput(message.text),
    sender: message.sender,
    type: message.type || 'text',
    createdAt: serverTimestamp()
  };

  if (db) {
    try {
      const messagesRef = collection(db, "users", userId, "messages");
      await addDoc(messagesRef, msgData);
    } catch (error) {
      console.error("Firestore error [saveMessage]:", error);
      // Fallback to local state
      const userMsgs = localStore.messages.get(userId) || [];
      localStore.messages.set(userId, [...userMsgs, { ...msgData, id: Date.now(), createdAt: new Date() }]);
    }
  } else {
    const userMsgs = localStore.messages.get(userId) || [];
    localStore.messages.set(userId, [...userMsgs, { ...msgData, id: Date.now(), createdAt: new Date() }]);
  }
};

/**
 * Fetches all messages for a specific user, ordered chronologically.
 */
export const getMessages = async (userId) => {
  if (!userId) return [];

  if (db) {
    try {
      const messagesRef = collection(db, "users", userId, "messages");
      const q = query(messagesRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to serializable format or fallback to Date.now
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      }));
    } catch (error) {
      console.error("Firestore error [getMessages]:", error);
      return localStore.messages.get(userId) || [];
    }
  }
  return localStore.messages.get(userId) || [];
};
