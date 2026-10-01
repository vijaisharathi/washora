/**
 * Auth token injection, organization header attachment,
 * and concurrent 401 token refresh queueing.
 */

export interface AuthTokenProvider {
  getAccessToken: () => string | null | Promise<string | null>;
  getOrganizationId: () => string | null | Promise<string | null>;
  refreshTokens: () => Promise<string | null>;
  onSessionExpired: () => void;
}

let activeTokenProvider: AuthTokenProvider | null = null;
let activeRefreshPromise: Promise<string | null> | null = null;

export function registerTokenProvider(provider: AuthTokenProvider): void {
  activeTokenProvider = provider;
}

export function unregisterTokenProvider(): void {
  activeTokenProvider = null;
  activeRefreshPromise = null;
}

export async function resolveAccessToken(): Promise<string | null> {
  if (!activeTokenProvider) return null;
  return activeTokenProvider.getAccessToken();
}

export async function resolveOrganizationId(): Promise<string | null> {
  if (!activeTokenProvider) return null;
  return activeTokenProvider.getOrganizationId();
}

/**
 * Handles 401 Unauthorized by executing a single refresh request.
 * Any concurrent requests that receive 401 await the same in-flight refresh promise.
 */
export async function handleUnauthorizedRefresh(): Promise<string | null> {
  if (!activeTokenProvider) {
    return null;
  }

  // If a refresh is already in progress, coalesce into the existing promise
  if (!activeRefreshPromise) {
    activeRefreshPromise = (async () => {
      try {
        const newAccessToken = await activeTokenProvider!.refreshTokens();
        if (!newAccessToken) {
          activeTokenProvider?.onSessionExpired();
          return null;
        }
        return newAccessToken;
      } catch {
        activeTokenProvider?.onSessionExpired();
        return null;
      } finally {
        activeRefreshPromise = null;
      }
    })();
  }

  return activeRefreshPromise;
}

export function notifySessionExpired(): void {
  activeTokenProvider?.onSessionExpired();
}
