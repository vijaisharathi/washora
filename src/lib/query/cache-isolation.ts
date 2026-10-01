/**
 * Cache isolation utilities to prevent cross-user and cross-tenant data leakage.
 */

import { QueryClient } from '@tanstack/react-query';
import { queryClient as defaultQueryClient } from './client';
import { queryKeys } from './queryKeys';

/**
 * Removes all private and user-authenticated queries upon logout or session invalidation.
 */
export function clearUserQueryCache(client: QueryClient = defaultQueryClient): void {
  // Remove all private query scopes
  client.removeQueries({ queryKey: queryKeys.auth.all });
  client.removeQueries({ queryKey: queryKeys.customer.all });
  client.removeQueries({ queryKey: queryKeys.provider.all });
  client.removeQueries({ queryKey: queryKeys.delivery.all });
  client.removeQueries({ queryKey: queryKeys.admin.all });
  client.removeQueries({ queryKey: queryKeys.notifications.all });
  client.removeQueries({ queryKey: queryKeys.support.all });
  client.removeQueries({ queryKey: queryKeys.disputes.all });

  // Reset public catalog queries to fresh state
  client.invalidateQueries({ queryKey: queryKeys.catalog.all });
}

/**
 * Removes all organization-scoped queries when switching active organization context.
 */
export function clearOrganizationQueryCache(client: QueryClient, _organizationId?: string): void {
  // Clear organization-specific operational data
  client.removeQueries({ queryKey: queryKeys.auth.currentOrganization() });
  client.removeQueries({ queryKey: queryKeys.provider.all });
  client.removeQueries({ queryKey: queryKeys.admin.all });
  client.removeQueries({ queryKey: queryKeys.delivery.all });

  // Invalidate any shared views
  client.invalidateQueries({ queryKey: queryKeys.auth.me() });
}
