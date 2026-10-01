"use client";

import { useQuery } from "@tanstack/react-query";
import { orderConfirmationService } from "@/services/orderConfirmationService";

export function useOrderConfirmation(orderId?: string) {
  return useQuery({
    queryKey: ["customer", "orderConfirmation", orderId] as const,
    queryFn: () => orderConfirmationService.getOrderConfirmation(orderId),
    staleTime: 1000 * 60 * 15,
  });
}
