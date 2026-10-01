"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSessionService } from "@/services/provider/providerSessionService";

export function useProviderSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["provider", "session"],
    queryFn: () => providerSessionService.getCurrentSession(),
    staleTime: 1000 * 60 * 5,
  });

  const profileQuery = useQuery({
    queryKey: ["provider", "profileSummary"],
    queryFn: () => providerSessionService.getProfileSummary(),
    staleTime: 1000 * 60 * 2,
  });

  const toggleOnlineMutation = useMutation({
    mutationFn: () => providerSessionService.toggleOnlineStatus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "profileSummary"] });
      queryClient.invalidateQueries({ queryKey: ["provider", "session"] });
    },
  });

  return {
    session: sessionQuery.data,
    profile: profileQuery.data,
    isLoading: sessionQuery.isLoading || profileQuery.isLoading,
    isOnline: profileQuery.data?.isOnline ?? true,
    toggleOnline: toggleOnlineMutation.mutate,
    isTogglingOnline: toggleOnlineMutation.isPending,
  };
}
