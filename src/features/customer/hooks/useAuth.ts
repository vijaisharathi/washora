"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { LoginFormData, RegisterFormData } from "@/features/customer/schemas/authSchemas";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const AUTH_QUERY_KEY = queryKeys.auth.me();

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const sessionQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authService.getCurrentSession(),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, session);
      router.push("/customer/auth/success");
    },
    onError: (err) => {
      showError(err, "Login Failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    onSuccess: (res) => {
      router.push(`/customer/auth/verify-phone?phone=${encodeURIComponent(res.phone)}`);
    },
    onError: (err) => {
      showError(err, "Registration Failed");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authService.verifyPhoneOtp(phone, otp),
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, session);
      router.push("/customer/auth/success");
    },
    onError: (err) => {
      showError(err, "Verification Failed");
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.resendOtp(phone),
    onError: (err) => {
      showError(err, "Resend Code Failed");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (identifier: string) => authService.requestPasswordReset(identifier),
    onError: (err) => {
      showError(err, "Reset Request Failed");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) => authService.resetPassword(password),
    onSuccess: () => {
      router.push("/customer/auth/login?reset=success");
    },
    onError: (err) => {
      showError(err, "Password Reset Failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      router.push("/customer/auth/login");
    },
    onError: (err) => {
      showError(err, "Logout Failed");
    },
  });

  return {
    session: sessionQuery.data,
    isAuthenticated: Boolean(sessionQuery.data?.token),
    isLoadingSession: sessionQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,
    resendOtp: resendOtpMutation.mutateAsync,
    isResendingOtp: resendOtpMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSubmittingForgot: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
