"use client";

import React from "react";
import { DeliveryPartnerSidebar } from "./DeliveryPartnerSidebar";
import { DeliveryPartnerHeader } from "./DeliveryPartnerHeader";
import { DeliveryPartnerMobileNav } from "./DeliveryPartnerMobileNav";

interface DeliveryPartnerShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function DeliveryPartnerShell({
  children,
  headerTitle = "Valet Logistics Portal",
  headerSubtitle = "WASHORA Real-time Dispatch & Valet Command",
}: DeliveryPartnerShellProps) {
  return (
    <div className="bg-background text-on-surface min-h-screen flex font-body-md overflow-x-hidden">
      {/* Desktop Sidebar (w-64) */}
      <DeliveryPartnerSidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <DeliveryPartnerHeader title={headerTitle} subtitle={headerSubtitle} />

        {/* Dynamic Canvas Area */}
        <main className="flex-1 pt-20 pb-20 md:pb-8 px-4 md:px-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <DeliveryPartnerMobileNav />
      </div>
    </div>
  );
}
