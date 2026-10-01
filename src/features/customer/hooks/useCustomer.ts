"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { BookingDraft, Order } from "@/types/customer";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const CATEGORIES_QUERY_KEY = queryKeys.catalog.categories();
export const SERVICES_QUERY_KEY = queryKeys.catalog.services();
export const PROVIDERS_QUERY_KEY = ["customer", "providers"] as const;
export const ORDERS_QUERY_KEY = queryKeys.customer.orders();
export const CART_QUERY_KEY = ["customer", "cart"] as const;
export const NOTIFS_QUERY_KEY = queryKeys.notifications.list();

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => customerService.getCategories(),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.catalog.category(slug),
    queryFn: () => customerService.getCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useServices(filter?: { categorySlug?: string; query?: string }) {
  return useQuery({
    queryKey: queryKeys.catalog.services(filter),
    queryFn: () => customerService.getServiceItems(filter),
  });
}

export function useServiceItem(id: string) {
  return useQuery({
    queryKey: queryKeys.catalog.service(id),
    queryFn: () => customerService.getServiceItemById(id),
    enabled: Boolean(id),
  });
}

export function useProviders(filter?: { query?: string; categorySlug?: string }) {
  return useQuery({
    queryKey: [...PROVIDERS_QUERY_KEY, filter?.query, filter?.categorySlug],
    queryFn: () => customerService.getProviders(filter),
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: ["customer", "provider", id] as const,
    queryFn: () => customerService.getProviderById(id),
    enabled: Boolean(id),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => customerService.getOrders(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.customer.order(id),
    queryFn: () => customerService.getOrderById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "timeline">) =>
      customerService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.bookings() });
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Create Order");
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      customerService.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.bookings() });
    },
    onError: (err) => {
      showError(err, "Failed to Cancel Order");
    },
  });
}

export function useBookingDraft() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => customerService.getBookingDraft(),
  });

  const saveMutation = useMutation({
    mutationFn: (draft: BookingDraft) => customerService.saveBookingDraft(draft),
    onSuccess: (updated) => {
      queryClient.setQueryData(CART_QUERY_KEY, updated);
    },
    onError: (err) => {
      showError(err, "Failed to Save Draft");
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => customerService.clearBookingDraft(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Clear Draft");
    },
  });

  return {
    draft: query.data,
    isLoading: query.isLoading,
    saveDraft: saveMutation.mutateAsync,
    clearDraft: clearMutation.mutateAsync,
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFS_QUERY_KEY,
    queryFn: () => customerService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => customerService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (err) => {
      showError(err, "Failed to Mark Notification as Read");
    },
  });

  return {
    notifications: query.data || [],
    unreadCount: (query.data || []).filter((n) => !n.read).length,
    isLoading: query.isLoading,
    markAsRead: markReadMutation.mutateAsync,
  };
}

export function useCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      customerService.validateCoupon(code, subtotal),
    onError: (err) => {
      showError(err, "Coupon Validation Failed");
    },
  });
}

export function useSupportTicket() {
  return useMutation({
    mutationFn: (data: { category: string; subject: string; message: string; orderId?: string }) =>
      customerService.submitSupportTicket(data),
    onError: (err) => {
      showError(err, "Failed to Submit Support Ticket");
    },
  });
}
