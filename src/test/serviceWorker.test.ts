import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Service Worker Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export registerServiceWorker function', async () => {
    const { registerServiceWorker } = await import('../utils/serviceWorker');
    expect(typeof registerServiceWorker).toBe('function');
  });

  it('should export unregisterServiceWorker function', async () => {
    const { unregisterServiceWorker } = await import('../utils/serviceWorker');
    expect(typeof unregisterServiceWorker).toBe('function');
  });
});

