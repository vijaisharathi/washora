"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { providerAuthService } from "@/services/provider/providerAuthService";
import { ProviderOnboardingDraft, ProviderUploadedDoc } from "@/types/provider/auth";
import { useRouter } from "next/navigation";

export function useProviderOnboarding() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const draftQuery = useQuery({
    queryKey: ["provider", "onboardingDraft"],
    queryFn: () => providerAuthService.getOnboardingDraft(),
    staleTime: 1000 * 60 * 5,
  });

  const statusQuery = useQuery({
    queryKey: ["provider", "onboardingStatus"],
    queryFn: () => providerAuthService.getOnboardingStatus(),
    staleTime: 1000 * 60 * 5,
  });

  const saveDraftMutation = useMutation({
    mutationFn: (draft: Partial<ProviderOnboardingDraft>) =>
      providerAuthService.saveOnboardingDraft(draft),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "onboardingDraft"], data);
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: ({ docType, file }: { docType: ProviderUploadedDoc["docType"]; file: File }) =>
      providerAuthService.uploadDocument(docType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "onboardingDraft"] });
    },
  });

  const submitOnboardingMutation = useMutation({
    mutationFn: () => providerAuthService.submitOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "onboardingStatus"] });
      router.push("/provider/onboarding/status");
    },
  });

  return {
    draft: draftQuery.data,
    isLoadingDraft: draftQuery.isLoading,
    statusData: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,

    saveDraft: saveDraftMutation.mutateAsync,
    isSavingDraft: saveDraftMutation.isPending,

    uploadDoc: uploadDocMutation.mutateAsync,
    isUploadingDoc: uploadDocMutation.isPending,

    submitOnboarding: submitOnboardingMutation.mutateAsync,
    isSubmittingOnboarding: submitOnboardingMutation.isPending,
  };
}
