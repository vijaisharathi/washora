"use client";

import { useQuery } from "@tanstack/react-query";
import { orderLifecycleService } from "@/services/orderLifecycleService";
import { queryKeys } from "@/lib/query/queryKeys";

export function useOrderTracking(orderId: string) {
  return useQuery({
    queryKey: queryKeys.customer.order(orderId),
    queryFn: () => orderLifecycleService.getOrderTracking(orderId),
    enabled: Boolean(orderId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllCustomerOrders() {
  return useQuery({
    queryKey: queryKeys.customer.orders(),
    queryFn: () => orderLifecycleService.getAllCustomerOrders(),
    staleTime: 1000 * 60 * 5,
  });
}
