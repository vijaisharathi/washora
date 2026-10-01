"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSupportService } from "@/services/provider/providerSupportService";
import {
  ProviderSupportCategory,
  CreateSupportTicketPayload,
  AddTicketMessagePayload,
} from "@/types/provider/support";

export function useProviderSupport(
  category?: ProviderSupportCategory,
  search?: string,
  providerId: string = "prov-1"
) {
  const queryClient = useQueryClient();

  const faqsQuery = useQuery({
    queryKey: ["provider", "support", "faqs", category, search],
    queryFn: () => providerSupportService.getFaqs(category, search),
    staleTime: 1000 * 60 * 5,
  });

  const ticketsQuery = useQuery({
    queryKey: ["provider", "support", "tickets", providerId],
    queryFn: () => providerSupportService.getTickets(providerId),
    staleTime: 1000 * 60 * 2,
  });

  const createTicketMutation = useMutation({
    mutationFn: (payload: CreateSupportTicketPayload) =>
      providerSupportService.createTicket(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "support", "tickets"] });
      queryClient.setQueryData(["provider", "support", "ticket", data.id], data);
    },
  });

  return {
    faqs: faqsQuery.data || [],
    isLoadingFaqs: faqsQuery.isLoading,
    tickets: ticketsQuery.data || [],
    isLoadingTickets: ticketsQuery.isLoading,

    createTicket: createTicketMutation.mutateAsync,
    isCreatingTicket: createTicketMutation.isPending,
  };
}

export function useProviderSupportTicket(ticketId: string, providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: ["provider", "support", "ticket", ticketId],
    queryFn: () => providerSupportService.getTicketById(ticketId, providerId),
    enabled: !!ticketId,
  });

  const addMessageMutation = useMutation({
    mutationFn: (payload: AddTicketMessagePayload) =>
      providerSupportService.addTicketMessage(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "support", "tickets"] });
      queryClient.setQueryData(["provider", "support", "ticket", ticketId], data);
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: (id: string) => providerSupportService.closeTicket(id, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "support", "tickets"] });
      queryClient.setQueryData(["provider", "support", "ticket", ticketId], data);
    },
  });

  return {
    ticket: ticketQuery.data,
    isLoading: ticketQuery.isLoading,
    isError: ticketQuery.isError,

    addMessage: addMessageMutation.mutateAsync,
    isAddingMessage: addMessageMutation.isPending,

    closeTicket: closeTicketMutation.mutateAsync,
    isClosingTicket: closeTicketMutation.isPending,
  };
}
