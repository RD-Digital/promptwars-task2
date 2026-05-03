import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../../services/firebase';
import { useCivicStore } from '../../hooks/useCivicStore';
import { Shield, Sparkles } from 'lucide-react';

export default function LoginScreen() {
  const setUser = useCivicStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', textAlign: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel"
        style={{ maxWidth: '400px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.05, pointerEvents: 'none' }}>
          <Shield size={120} />
        </div>

        <div style={{ width: '64px', height: '64px', background: 'var(--accent-gradient)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', marginBottom: '1rem' }}>
          <Sparkles color="white" size={32} />
        </div>

        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            CivicSense <span className="text-gradient">AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.4' }}>
            Sign in to access your personal civic decision engine and 360° AI educator.
          </p>
        </div>

        {error && (
          <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="btn"
          style={{ 
            width: '100%', 
            background: '#f5efff', 
            color: 'var(--text-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem', 
            padding: '1rem', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px -5px rgba(115, 113, 252, 0.2), 0 8px 10px -6px rgba(115, 113, 252, 0.1)',
            border: '1px solid rgba(115, 113, 252, 0.1)',
            opacity: loading ? 0.7 : 1,
            fontWeight: '600'
          }}
        >
          {loading ? (
            <div style={{ animation: 'spin 1s linear infinite', border: '2px solid #111827', borderTopColor: 'transparent', borderRadius: '50%', width: '20px', height: '20px' }} />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', maxWidth: '280px', lineHeight: '1.5' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy. Secure authentication provided by Firebase.
        </p>
      </motion.div>
    </div>
  );
}
