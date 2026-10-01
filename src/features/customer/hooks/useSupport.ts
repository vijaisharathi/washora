"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService } from "@/services/supportService";
import { CreateSupportTicketPayload } from "@/types/customer/support";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useSupport() {
  const queryClient = useQueryClient();

  const faqsQuery = useQuery({
    queryKey: ["customer", "supportFaqs"] as const,
    queryFn: () => supportService.getFaqs(),
    staleTime: 1000 * 60 * 15,
  });

  const categoriesQuery = useQuery({
    queryKey: ["customer", "supportCategories"] as const,
    queryFn: () => supportService.getSupportCategories(),
    staleTime: 1000 * 60 * 15,
  });

  const issueCategoriesQuery = useQuery({
    queryKey: ["customer", "issueCategories"] as const,
    queryFn: () => supportService.getIssueCategories(),
    staleTime: 1000 * 60 * 15,
  });

  const userTicketsQuery = useQuery({
    queryKey: queryKeys.support.tickets(),
    queryFn: () => supportService.getUserTickets(),
  });

  const ticketMutation = useMutation({
    mutationFn: (payload: CreateSupportTicketPayload) =>
      supportService.createSupportTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets() });
    },
    onError: (err) => {
      showError(err, "Failed to Submit Ticket");
    },
  });

  return {
    faqs: faqsQuery.data || [],
    categories: categoriesQuery.data || [],
    issueCategories: issueCategoriesQuery.data || [],
    userTickets: userTicketsQuery.data || [],
    isLoading: faqsQuery.isLoading || categoriesQuery.isLoading,
    createTicket: ticketMutation.mutateAsync,
    isSubmitting: ticketMutation.isPending,
    createdTicket: ticketMutation.data,
  };
}
