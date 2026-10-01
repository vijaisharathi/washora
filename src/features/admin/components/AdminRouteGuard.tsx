"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminSession } from "../hooks/useAdminSession";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAuthenticated, onboardingCompleted, isLoading } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === "/admin/login";
  const isUnauthorizedRoute = pathname === "/admin/unauthorized";
  const isOnboardingRoute = pathname === "/admin/onboarding";
  const isRootAdminRoute = pathname === "/admin";

  useEffect(() => {
    if (isLoading) return;

    // Check wrong-role sessions in localStorage (Customer, Provider, Delivery Partner)
    if (typeof window !== "undefined") {
      const hasCustomerSession = localStorage.getItem("washora_customer_token");
      const hasProviderSession = localStorage.getItem("washora_provider_token");
      const hasDeliveryPartnerSession = localStorage.getItem("washora_delivery_partner_session");

      // If on protected route and has wrong role without valid admin session
      if (!isLoginRoute && !isUnauthorizedRoute && !isAuthenticated) {
        if (hasCustomerSession || hasProviderSession || hasDeliveryPartnerSession) {
          router.replace("/admin/unauthorized");
          return;
        }
      }
    }

    // 1. Unauthenticated users
    if (!isAuthenticated) {
      if (!isLoginRoute && !isUnauthorizedRoute) {
        router.replace("/admin/login");
      }
      return;
    }

    // 2. Authenticated users with incomplete onboarding
    if (!onboardingCompleted) {
      if (!isOnboardingRoute && !isUnauthorizedRoute) {
        router.replace("/admin/onboarding");
      }
      return;
    }

    // 3. Authenticated users with completed onboarding
    if (onboardingCompleted) {
      if (isLoginRoute || isOnboardingRoute) {
        router.replace("/admin");
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    onboardingCompleted,
    isLoginRoute,
    isUnauthorizedRoute,
    isOnboardingRoute,
    isRootAdminRoute,
    pathname,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-medium text-on-surface-variant animate-pulse font-mono tracking-wider">
          Initializing WASHORA Admin Platform Console...
        </p>
      </div>
    );
  }

  // If on protected route and not authenticated, render nothing while redirecting
  if (!isLoginRoute && !isUnauthorizedRoute && !isAuthenticated) {
    return null;
  }

  // If on protected route and onboarding is incomplete, render nothing while redirecting
  if (!isOnboardingRoute && !isUnauthorizedRoute && !onboardingCompleted) {
    return null;
  }

  // If on /admin/onboarding and onboarding is already complete, render nothing while redirecting
  if (isOnboardingRoute && onboardingCompleted) {
    return null;
  }

  // If on /admin/login and already authenticated, render nothing while redirecting
  if (isLoginRoute && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
