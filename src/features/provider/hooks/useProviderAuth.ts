"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { providerAuthService } from "@/services/provider/providerAuthService";
import { ProviderCredentials, ProviderRegisterPayload } from "@/types/provider/auth";
import { useRouter } from "next/navigation";

export function useProviderAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const authSessionQuery = useQuery({
    queryKey: ["provider", "authSession"],
    queryFn: () => providerAuthService.getCurrentAuthSession(),
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: ProviderCredentials) => providerAuthService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "authSession"], data);
      queryClient.invalidateQueries({ queryKey: ["provider"] });
      router.push("/provider");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: ProviderRegisterPayload) => providerAuthService.register(payload),
    onSuccess: (data) => {
      router.push(`/provider/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      providerAuthService.verifyPhoneOtp(phone, otp),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "authSession"], data);
      router.push("/provider/onboarding");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (identifier: string) => providerAuthService.requestPasswordReset(identifier),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) => providerAuthService.resetPassword(password),
    onSuccess: () => {
      router.push("/provider/auth/login?reset=success");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => providerAuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/provider/auth/login");
    },
  });

  return {
    authSession: authSessionQuery.data,
    isAuthenticated: !!authSessionQuery.data?.token,
    isLoadingSession: authSessionQuery.isLoading,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingReset: forgotPasswordMutation.isPending,
    forgotPasswordSuccess: forgotPasswordMutation.data?.success,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
