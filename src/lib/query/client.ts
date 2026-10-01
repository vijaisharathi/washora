/**
 * Centralized TanStack QueryClient singleton and configuration.
 */

import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/api/errors';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute fresh cache
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: (failureCount, error) => {
          // Never retry 4xx errors (e.g. 401, 403, 404, 422)
          if (isApiError(error)) {
            if (error.status >= 400 && error.status < 500) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false, // Strict mutation safety: never automatically retry mutations blindly
      },
    },
  });
}

export const queryClient = createQueryClient();
