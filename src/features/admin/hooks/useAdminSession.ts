"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSession,
  AdminLoginCredentials,
  AdminRole,
  AdminOnboardingData,
} from "@/types/admin";
import { adminAuthService } from "@/services/admin/adminAuthService";

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const s = await adminAuthService.getSession();
      setSession(s);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (credentials: AdminLoginCredentials) => {
    setIsLoggingIn(true);
    try {
      const s = await adminAuthService.login(credentials);
      setSession(s);

      // Deterministic redirect based on onboarding completion
      if (!s.onboardingCompleted) {
        router.push("/admin/onboarding");
      } else {
        router.push("/admin");
      }
      return s;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await adminAuthService.logout();
    setSession(null);
    router.push("/admin/login");
  };

  const switchRole = async (role: AdminRole) => {
    const updated = await adminAuthService.switchRole(role);
    setSession(updated);
    return updated;
  };

  const saveOnboardingStep = async (
    stepData: Partial<AdminOnboardingData>,
    nextStep?: number
  ) => {
    const userId = session?.userId || session?.user?.id || "admin-001";
    return await adminAuthService.saveOnboardingStep(userId, stepData, nextStep);
  };

  const completeOnboarding = async (finalData: AdminOnboardingData) => {
    const userId = session?.userId || session?.user?.id || "admin-001";
    const updated = await adminAuthService.completeOnboarding(userId, finalData);
    setSession(updated);
    router.push("/admin");
    return updated;
  };

  const getOnboardingData = async () => {
    const userId = session?.userId || session?.user?.id || "admin-001";
    return await adminAuthService.getOnboardingData(userId);
  };

  return {
    session,
    user: session?.user ?? null,
    userId: session?.userId ?? session?.user?.id ?? null,
    role: session?.role ?? null,
    isAuthenticated: Boolean(session?.isAuthenticated),
    onboardingCompleted: Boolean(session?.onboardingCompleted),
    isLoading,
    isLoggingIn,
    login,
    logout,
    switchRole,
    refreshSession: fetchSession,
    saveOnboardingStep,
    completeOnboarding,
    getOnboardingData,
  };
}
