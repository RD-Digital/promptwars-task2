/**
 * Conditional logger that only outputs in development mode.
 */
export const logger = {
  log: (msg, ...data) => {
    if (import.meta.env.DEV) {
      console.log(`[CivicSense]: ${msg}`, ...data);
    }
  },
  warn: (msg, ...data) => {
    if (import.meta.env.DEV) {
      console.warn(`[CivicSense Warning]: ${msg}`, ...data);
    }
  },
  error: (msg, ...data) => {
    // We always log errors for production observability, but with a prefix
    console.error(`[CivicSense Error]: ${msg}`, ...data);
  }
};
