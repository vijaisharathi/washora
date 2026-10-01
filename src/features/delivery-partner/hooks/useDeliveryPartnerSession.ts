"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerAuthService } from "@/services/delivery-partner/deliveryPartnerAuthService";
import {
  DeliveryPartnerStatus,
  DeliveryPartnerAuthCredentials,
  DeliveryPartnerRegisterPayload,
  DeliveryPartnerOnboardingDraft,
} from "@/types/delivery-partner";

export const DP_SESSION_QUERY_KEY = ["deliveryPartner", "session"];
export const DP_PROFILE_QUERY_KEY = ["deliveryPartner", "profile"];
export const DP_ONBOARDING_DRAFT_KEY = ["deliveryPartner", "onboardingDraft"];
export const DP_ONBOARDING_STATUS_KEY = ["deliveryPartner", "onboardingStatus"];

export function useDeliveryPartnerSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: DP_SESSION_QUERY_KEY,
    queryFn: () => deliveryPartnerAuthService.getSession(),
    staleTime: 1000 * 60 * 5,
  });

  const onboardingDraftQuery = useQuery({
    queryKey: DP_ONBOARDING_DRAFT_KEY,
    queryFn: () => deliveryPartnerAuthService.getOnboardingDraft(),
    staleTime: 1000 * 60 * 5,
  });

  const onboardingStatusQuery = useQuery({
    queryKey: DP_ONBOARDING_STATUS_KEY,
    queryFn: () => deliveryPartnerAuthService.getOnboardingStatus(),
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: DeliveryPartnerAuthCredentials) =>
      deliveryPartnerAuthService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: DeliveryPartnerRegisterPayload) =>
      deliveryPartnerAuthService.register(payload),
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: (payload: { phone: string; otp: string }) =>
      deliveryPartnerAuthService.verifyPhone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (identifier: string) =>
      deliveryPartnerAuthService.forgotPassword(identifier),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: { newPassword: string; token: string }) =>
      deliveryPartnerAuthService.resetPassword(payload),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: DeliveryPartnerStatus) =>
      deliveryPartnerAuthService.updateStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => deliveryPartnerAuthService.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
    },
  });

  const restoreSessionMutation = useMutation({
    mutationFn: () => deliveryPartnerAuthService.restoreSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
    },
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: (draft: Partial<DeliveryPartnerOnboardingDraft>) =>
      deliveryPartnerAuthService.saveOnboardingDraft(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_ONBOARDING_DRAFT_KEY });
    },
  });

  const submitOnboardingMutation = useMutation({
    mutationFn: (draft: DeliveryPartnerOnboardingDraft) =>
      deliveryPartnerAuthService.submitOnboarding(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_ONBOARDING_DRAFT_KEY });
      queryClient.invalidateQueries({ queryKey: DP_ONBOARDING_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
    },
  });

  return {
    session: sessionQuery.data,
    partner: sessionQuery.data?.partner || null,
    isAuthenticated: sessionQuery.data?.isAuthenticated ?? false,
    isLoading: sessionQuery.isLoading,
    isError: sessionQuery.isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    verifyPhone: verifyPhoneMutation.mutateAsync,
    isVerifyingPhone: verifyPhoneMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetPasswordPending: resetPasswordMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    restoreSession: restoreSessionMutation.mutate,
    onboardingDraft: onboardingDraftQuery.data,
    isOnboardingDraftLoading: onboardingDraftQuery.isLoading,
    onboardingStatus: onboardingStatusQuery.data,
    isOnboardingStatusLoading: onboardingStatusQuery.isLoading,
    saveOnboardingDraft: saveOnboardingMutation.mutateAsync,
    isSavingOnboarding: saveOnboardingMutation.isPending,
    submitOnboarding: submitOnboardingMutation.mutateAsync,
    isSubmittingOnboarding: submitOnboardingMutation.isPending,
  };
}
