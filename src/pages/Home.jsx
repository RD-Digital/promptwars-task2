import React, { useEffect } from 'react';
import { ChatBox } from '../components/Chat/ChatBox';
import { ProgressBar } from '../components/UI/ProgressBar';
import { PollingMap } from '../components/Maps/PollingMap';
import LoginScreen from '../components/Auth/LoginScreen';
import { useCivicStore } from '../hooks/useCivicStore';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToAuth, signOutUser } from '../services/firebase';

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
      <button 
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
      >
        Sign Out
      </button>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>CivicSense AI</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your Context-Aware Civic Decision Engine</p>
      </motion.div>

      <ProgressBar score={readinessScore} />

      <ChatBox />

      <AnimatePresence>
        {flowState === 'SHOW_POLLING' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <PollingMap />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
