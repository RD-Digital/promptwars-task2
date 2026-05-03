import React, { useEffect, Suspense, lazy } from 'react';
import { ChatBox } from '../components/Chat/ChatBox';
import { ProgressBar } from '../components/UI/ProgressBar';
import LoginScreen from '../components/Auth/LoginScreen';
import { useCivicStore } from '../hooks/useCivicStore';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToAuth, signOutUser } from '../services/firebase';

// Lazy load heavy components for better initial load efficiency
const PollingMap = lazy(() => import('../components/Maps/PollingMap').then(module => ({ default: module.PollingMap })));

/**
 * Main Entry Point Page for CivicSense AI.
 * Handles authentication state and feature routing.
 */
export const Home = () => {
  const { readinessScore, flowState, user, setUser } = useCivicStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', width: '100%', position: 'relative' }}>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signOutUser()}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(240, 66, 81, 0.1)',
          color: '#f04251',
          border: '1px solid rgba(240, 66, 81, 0.3)',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        className="hover-lift"
        aria-label="Sign out of your account"
      >
        Sign Out
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>CivicSense AI</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your Context-Aware Civic Decision Engine</p>
      </motion.div>

      <ProgressBar score={readinessScore} />

      <ChatBox />

      <AnimatePresence>
        {flowState === 'SHOW_POLLING' && (
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Polling Data...</div>}>
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <PollingMap />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};
