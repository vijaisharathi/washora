"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerSupportService } from "@/services/delivery-partner/deliveryPartnerSupportService";
import { CreateSupportTicketPayload, ReplySupportTicketPayload } from "@/types/delivery-partner";

export const DP_SUPPORT_TICKETS_QUERY_KEY = ["deliveryPartner", "supportTickets"];
export const DP_SUPPORT_FAQS_QUERY_KEY = ["deliveryPartner", "supportFaqs"];

export function useDeliveryPartnerSupportFaqs(searchQuery?: string) {
  const query = useQuery({
    queryKey: [...DP_SUPPORT_FAQS_QUERY_KEY, searchQuery],
    queryFn: () => deliveryPartnerSupportService.getFaqs(searchQuery),
    staleTime: 1000 * 60 * 5,
  });

  return {
    faqs: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerSupportTickets() {
  const query = useQuery({
    queryKey: DP_SUPPORT_TICKETS_QUERY_KEY,
    queryFn: () => deliveryPartnerSupportService.getTickets(),
    staleTime: 1000 * 60,
  });

  return {
    tickets: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerTicketDetail(id: string) {
  const query = useQuery({
    queryKey: ["deliveryPartner", "ticketDetail", id],
    queryFn: () => deliveryPartnerSupportService.getTicketById(id),
    staleTime: 1000 * 30,
    enabled: !!id,
  });

  return {
    ticket: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerSupportActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupportTicketPayload) =>
      deliveryPartnerSupportService.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SUPPORT_TICKETS_QUERY_KEY });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (payload: ReplySupportTicketPayload) =>
      deliveryPartnerSupportService.replyTicket(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DP_SUPPORT_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "ticketDetail", variables.ticketId] });
    },
  });

  return {
    createTicket: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    replyTicket: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
  };
}
