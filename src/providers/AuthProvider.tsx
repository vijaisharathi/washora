"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { tokenStore } from '@/lib/auth/token-store';
import { PlatformRole, isPlatformRole } from '@/lib/auth/roles';
import { getLoginRouteForPath } from '@/lib/auth/routes';
import { clearUserQueryCache } from '@/lib/query/cache-isolation';
import { registerTokenProvider, unregisterTokenProvider } from '@/lib/api/auth-interceptor';
import { apiClient } from '@/lib/api/client';
import { showError } from '@/lib/ui/toast';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: PlatformRole;
  permissions?: string[];
  organizationId?: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: PlatformRole | null;
  permissions: string[];
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken?: string }, user?: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_TOKEN_STORAGE_KEY = 'washora_session_ref';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<PlatformRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Invalidate and clear local state
  const handleSessionExpired = useCallback(() => {
    tokenStore.clear();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
    setUser(null);
    setRole(null);
    setPermissions([]);
    clearUserQueryCache(queryClient);

    // Redirect to role-appropriate login route
    const currentPath = pathname || '/customer';
    const loginTarget = getLoginRouteForPath(currentPath);
    router.replace(loginTarget);
  }, [pathname, queryClient, router]);

  // Execute token refresh via backend
  const refreshTokens = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefreshToken =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
          : null;

      if (!storedRefreshToken) {
        return null;
      }

      const response = await apiClient.post<{
        success: boolean;
        data?: { accessToken: string; refreshToken?: string };
        accessToken?: string;
        refreshToken?: string;
      }>('/auth/refresh', { refreshToken: storedRefreshToken }, { auth: false });

      const newAccessToken =
        response?.data?.accessToken || response?.accessToken;
      const newRefreshToken =
        response?.data?.refreshToken || response?.refreshToken || storedRefreshToken;

      if (newAccessToken) {
        tokenStore.setAccessToken(newAccessToken);
        if (typeof window !== 'undefined' && newRefreshToken) {
          sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
        }
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Register token provider with central API client
  useEffect(() => {
    registerTokenProvider({
      getAccessToken: () => tokenStore.getAccessToken(),
      getOrganizationId: () => user?.organizationId || null,
      refreshTokens,
      onSessionExpired: handleSessionExpired,
    });

    return () => {
      unregisterTokenProvider();
    };
  }, [user?.organizationId, refreshTokens, handleSessionExpired]);

  // Bootstrap session state
  useEffect(() => {
    async function bootstrap() {
      try {
        const storedRefreshToken =
          typeof window !== 'undefined'
            ? sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
            : null;

        if (storedRefreshToken) {
          const newToken = await refreshTokens();
          if (newToken) {
            // Fetch current user details
            const meResponse = await apiClient.get<{
              success: boolean;
              data?: AuthUser;
              id?: string;
              role?: string;
              permissions?: string[];
            }>('/auth/me');

            const userData = meResponse?.data || (meResponse as any);
            if (userData && userData.role && isPlatformRole(userData.role)) {
              setUser({
                id: userData.id,
                email: userData.email,
                phone: userData.phone,
                fullName: userData.fullName,
                role: userData.role as PlatformRole,
                permissions: userData.permissions || [],
                organizationId: userData.organizationId,
              });
              setRole(userData.role as PlatformRole);
              setPermissions(userData.permissions || []);
            }
          }
        }
      } catch {
        // Fallback: leave unauthenticated in demo mode
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, [refreshTokens]);

  const login = useCallback(
    (tokens: { accessToken: string; refreshToken?: string }, authenticatedUser?: AuthUser) => {
      tokenStore.setAccessToken(tokens.accessToken);
      if (typeof window !== 'undefined' && tokens.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
      }

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setRole(authenticatedUser.role);
        setPermissions(authenticatedUser.permissions || []);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {}, { retry: false });
    } catch {
      // Ignore network errors on logout
    } finally {
      handleSessionExpired();
    }
  }, [handleSessionExpired]);

  const value: AuthContextValue = {
    isAuthenticated: Boolean(tokenStore.getAccessToken() || user),
    user,
    role,
    permissions,
    isLoading,
    login,
    logout,
    refresh: refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
