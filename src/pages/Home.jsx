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
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '3rem' }}
      >
        <button 
          onClick={() => signOutUser()}
          className="btn glass-panel"
          style={{ 
            fontSize: '0.875rem', 
            padding: '0.6rem 1.25rem', 
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            transition: 'var(--transition-smooth)',
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-secondary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          aria-label="Securely Sign Out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </motion.div>
    </div>
  );
};
