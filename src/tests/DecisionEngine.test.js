import { describe, it, expect } from 'vitest';
import { evaluateUserContext } from '../core/DecisionEngine';

describe('Decision Engine', () => {
  it('returns NOT_ELIGIBLE if underage', () => {
    const result = evaluateUserContext({ age: 17, isRegistered: true, daysRemaining: 10, hasCheckedPolling: true, hasValidID: true });
    expect(result.state).toBe('NOT_ELIGIBLE');
  });

  it('returns REGISTRATION_FLOW if unregistered', () => {
    const result = evaluateUserContext({ age: 19, isRegistered: false, daysRemaining: 10, hasCheckedPolling: true, hasValidID: true });
    expect(result.state).toBe('REGISTRATION_FLOW');
  });

  it('returns URGENT_VOTING if daysRemaining is <= 3', () => {
    const result = evaluateUserContext({ age: 22, isRegistered: true, daysRemaining: 2, hasCheckedPolling: true, hasValidID: true });
    expect(result.state).toBe('URGENT_VOTING');
  });

  it('returns SHOW_POLLING if user has not checked polling station', () => {
    const result = evaluateUserContext({ age: 25, isRegistered: true, daysRemaining: 15, hasCheckedPolling: false, hasValidID: true });
    expect(result.state).toBe('SHOW_POLLING');
  });

  it('returns ID_PREPARATION if user lacks valid ID', () => {
    const result = evaluateUserContext({ age: 25, isRegistered: true, daysRemaining: 15, hasCheckedPolling: true, hasValidID: false });
    expect(result.state).toBe('ID_PREPARATION');
  });

  it('returns READY_TO_VOTE if all conditions are met', () => {
    const result = evaluateUserContext({ age: 30, isRegistered: true, daysRemaining: 5, hasCheckedPolling: true, hasValidID: true });
    expect(result.state).toBe('PREPARE_TO_VOTE'); // Wait, daysRemaining <= 10 -> PREPARE_TO_VOTE is checked before READY_TO_VOTE if it's <= 10. Let's adjust days.
    
    const readyResult = evaluateUserContext({ age: 30, isRegistered: true, daysRemaining: 15, hasCheckedPolling: true, hasValidID: true });
    expect(readyResult.state).toBe('READY_TO_VOTE');
  });
});
