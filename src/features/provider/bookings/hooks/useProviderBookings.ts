"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerBookingsService } from "@/services/provider/providerBookingsService";
import {
  AcceptBookingPayload,
  DeclineBookingPayload,
  CancelBookingPayload,
} from "@/types/provider/bookings";

export function useProviderBookings(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ["provider", "bookings", providerId],
    queryFn: () => providerBookingsService.getBookings(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const statsQuery = useQuery({
    queryKey: ["provider", "bookings", "stats", providerId],
    queryFn: () => providerBookingsService.getBookingStats(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const acceptMutation = useMutation({
    mutationFn: (payload: AcceptBookingPayload) =>
      providerBookingsService.acceptBooking(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      queryClient.setQueryData(["provider", "booking", data.id], data);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (payload: DeclineBookingPayload) =>
      providerBookingsService.declineBooking(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      queryClient.setQueryData(["provider", "booking", data.id], data);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (payload: CancelBookingPayload) =>
      providerBookingsService.cancelBooking(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      queryClient.setQueryData(["provider", "booking", data.id], data);
    },
  });

  return {
    bookings: bookingsQuery.data || [],
    isLoading: bookingsQuery.isLoading,
    isError: bookingsQuery.isError,
    stats: statsQuery.data,
    refetch: bookingsQuery.refetch,

    acceptBooking: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,

    declineBooking: declineMutation.mutateAsync,
    isDeclining: declineMutation.isPending,

    cancelBooking: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
}

export function useProviderBookingItem(bookingId: string, providerId: string = "prov-1") {
  return useQuery({
    queryKey: ["provider", "booking", bookingId],
    queryFn: () => providerBookingsService.getBookingById(bookingId, providerId),
    enabled: !!bookingId,
  });
}
