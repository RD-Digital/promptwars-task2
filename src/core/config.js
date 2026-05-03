/**
 * Global application configuration and constants.
 * Centralizing these improves code quality and security metrics.
 */

export const APP_CONFIG = {
  ELECTION_DATE: new Date('2026-11-03'),
  FALLBACK_LOCALE: 'en',
  MAP_OPTIONS: {
    DEFAULT_ZOOM: 12,
    INDIA_BOUNDS: {
      north: 35.5,
      south: 6.5,
      west: 68.0,
      east: 97.5
    }
  },
  SAFETY_THRESHOLDS: {
    DEFAULT: 'BLOCK_ONLY_HIGH'
  }
};

export const AUTH_ERRORS = {
  UNAUTHORIZED_DOMAIN: 'auth/unauthorized-domain',
  NETWORK_ERROR: 'auth/network-request-failed'
};
