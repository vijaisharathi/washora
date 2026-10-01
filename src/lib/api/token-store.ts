/**
 * In-memory and persistent token storage for WASHORA API client.
 * Registers with auth-interceptor to supply tokens and refresh flow.
 */

import { registerTokenProvider } from './auth-interceptor';
import { clearUserQueryCache } from '@/lib/query/cache-isolation';
import { tokenStore } from '@/lib/auth/token-store';

const ACCESS_TOKEN_KEY = 'washora_access_token';
const REFRESH_TOKEN_KEY = 'washora_refresh_token';
const ORG_ID_KEY = 'washora_current_org_id';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryOrgId: string | null = null;

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export function setTokens(tokens: StoredTokens): void {
  inMemoryAccessToken = tokens.accessToken;
  inMemoryRefreshToken = tokens.refreshToken;
  tokenStore.setAccessToken(tokens.accessToken);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      // T1 SECURITY HARDENING: Never store refresh tokens in persistent localStorage.
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== 'undefined') {
    try {
      inMemoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      return inMemoryAccessToken;
    } catch {
      return null;
    }
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  if (typeof window !== 'undefined') {
    try {
      // Ensure localStorage has no legacy refresh tokens
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      inMemoryRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
      return inMemoryRefreshToken;
    } catch {
      return null;
    }
  }
  return null;
}

export function setOrganizationId(orgId: string | null): void {
  inMemoryOrgId = orgId;
  if (typeof window !== 'undefined') {
    try {
      if (orgId) {
        localStorage.setItem(ORG_ID_KEY, orgId);
      } else {
        localStorage.removeItem(ORG_ID_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }
}

export function getOrganizationId(): string | null {
  if (inMemoryOrgId) return inMemoryOrgId;
  if (typeof window !== 'undefined') {
    try {
      inMemoryOrgId = localStorage.getItem(ORG_ID_KEY);
      return inMemoryOrgId;
    } catch {
      return null;
    }
  }
  return null;
}

export function clearTokens(): void {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  inMemoryOrgId = null;
  tokenStore.clear();

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(ORG_ID_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

// Auto-register token provider with auth interceptor
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  registerTokenProvider({
    getAccessToken: () => getAccessToken(),
    getOrganizationId: () => getOrganizationId(),
    refreshTokens: async () => {
      const currentRefresh = getRefreshToken();
      if (!currentRefresh) return null;

      try {
        // Direct fetch to avoid recursion through apiClient
        const { getApiUrl } = await import('@/config/env');
        const res = await fetch(getApiUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefresh }),
        });

        if (!res.ok) {
          clearTokens();
          clearUserQueryCache();
          return null;
        }

        const data = await res.json();
        const tokens: StoredTokens = data.data || data;
        setTokens(tokens);
        return tokens.accessToken;
      } catch {
        clearTokens();
        clearUserQueryCache();
        return null;
      }
    },
    onSessionExpired: () => {
      clearTokens();
      clearUserQueryCache();
    },
  });
}
