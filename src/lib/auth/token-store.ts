/**
 * In-memory access token storage and session state management.
 * Protects long-lived credentials from being stored in ordinary localStorage.
 */

type TokenChangeListener = (token: string | null) => void;

class TokenStore {
  private inMemoryAccessToken: string | null = null;
  private listeners: Set<TokenChangeListener> = new Set();

  /**
   * Set the current in-memory access token.
   */
  setAccessToken(token: string | null): void {
    if (this.inMemoryAccessToken !== token) {
      this.inMemoryAccessToken = token;
      this.notify(token);
    }
  }

  /**
   * Retrieve the current access token.
   */
  getAccessToken(): string | null {
    if (this.inMemoryAccessToken) return this.inMemoryAccessToken;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('washora_access_token');
        if (stored) {
          this.inMemoryAccessToken = stored;
          return stored;
        }
      } catch {
        // Ignore storage errors
      }
    }
    return null;
  }

  /**
   * Clear all authenticated tokens in memory.
   */
  clear(): void {
    this.setAccessToken(null);
  }

  /**
   * Subscribe to token changes (e.g. for AuthProvider or API client synchronization).
   */
  subscribe(listener: TokenChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(token: string | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(token);
      } catch (err) {
        console.error('Token change listener error:', err);
      }
    });
  }
}

export const tokenStore = new TokenStore();
