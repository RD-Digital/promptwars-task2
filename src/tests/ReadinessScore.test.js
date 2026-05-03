import { describe, it, expect } from 'vitest';
import { calculateReadinessScore } from '../core/ReadinessScore';

describe('Readiness Score', () => {
  it('calculates score correctly for zero values', () => {
    const score = calculateReadinessScore({
      isRegistered: false,
      hasCheckedPolling: false,
      hasValidID: false,
      daysRemaining: 0
    });
    expect(score).toBe(0);
  });

  it('calculates score correctly for all valid values', () => {
    const score = calculateReadinessScore({
      isRegistered: true,
      hasCheckedPolling: true,
      hasValidID: true,
      daysRemaining: 5
    });
    expect(score).toBe(100);
  });

  it('calculates partial score', () => {
    const score = calculateReadinessScore({
      isRegistered: true, // 30
      hasCheckedPolling: false,
      hasValidID: true, // 20
      daysRemaining: -1 // 0
    });
    expect(score).toBe(50);
  });
});
