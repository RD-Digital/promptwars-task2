import { describe, it, expect, beforeEach } from 'vitest';
import { useCivicStore } from '../src/hooks/useCivicStore';

describe('useCivicStore', () => {
  beforeEach(() => {
    // Reset store state if needed, though Zustand persists across tests usually
    // For simplicity in this demo environment, we assume a fresh store
  });

  it('should add a message correctly', () => {
    const { addMessage } = useCivicStore.getState();
    addMessage('Test Message', 'user');
    
    const messages = useCivicStore.getState().messages;
    const lastMessage = messages[messages.length - 1];
    
    expect(lastMessage.text).toBe('Test Message');
    expect(lastMessage.sender).toBe('user');
  });

  it('should update context correctly', () => {
    const { updateContext } = useCivicStore.getState();
    updateContext({ stage: 'EDUCATED' });
    
    expect(useCivicStore.getState().context.stage).toBe('EDUCATED');
  });

  it('should update readiness score', () => {
    const { setReadinessScore } = useCivicStore.getState();
    setReadinessScore(85);
    
    expect(useCivicStore.getState().readinessScore).toBe(85);
  });
});
