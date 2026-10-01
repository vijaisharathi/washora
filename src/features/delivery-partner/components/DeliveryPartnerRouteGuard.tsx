"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDeliveryPartnerSession } from "../hooks/useDeliveryPartnerSession";

interface DeliveryPartnerRouteGuardProps {
  children: React.ReactNode;
}

export function DeliveryPartnerRouteGuard({ children }: DeliveryPartnerRouteGuardProps) {
  const { isAuthenticated, isLoading, restoreSession } = useDeliveryPartnerSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname?.startsWith("/delivery-partner/auth");
  const isOnboardingRoute = pathname?.startsWith("/delivery-partner/onboarding");

  useEffect(() => {
    // If not an auth/onboarding route and unauthenticated, we can restore or redirect
    if (!isLoading && !isAuthenticated && !isAuthRoute && !isOnboardingRoute) {
      // In development / demo environment, restore mock session if visiting root
      restoreSession();
    }
  }, [isLoading, isAuthenticated, isAuthRoute, isOnboardingRoute, restoreSession, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-medium text-on-surface-variant animate-pulse font-mono">
          Initializing WASHORA Valet Portal...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
