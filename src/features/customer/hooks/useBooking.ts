"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { bookingService } from "@/services/bookingService";
import { CustomerBookingDraft } from "@/types/customer/booking";
import { showError } from "@/lib/ui/toast";

export function useBookingDates() {
  return useQuery({
    queryKey: ["customer", "booking-dates"] as const,
    queryFn: () => bookingService.getAvailableDates(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBookingSlots(dateIso: string) {
  return useQuery({
    queryKey: ["customer", "booking-slots", dateIso] as const,
    queryFn: () => bookingService.getAvailableSlots(dateIso),
    enabled: Boolean(dateIso),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInitialBookingDraft(params: {
  serviceId?: string;
  providerId?: string;
  variantId?: string;
}) {
  return useQuery({
    queryKey: ["customer", "draft", params.serviceId, params.providerId, params.variantId] as const,
    queryFn: () => bookingService.getInitialDraft(params),
  });
}

export function useSaveBookingDraft() {
  return useMutation({
    mutationFn: (draft: CustomerBookingDraft) => bookingService.saveDraft(draft),
    onError: (err) => {
      showError(err, "Failed to Save Booking Draft");
    },
  });
}
