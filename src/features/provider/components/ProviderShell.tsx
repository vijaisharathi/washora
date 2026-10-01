"use client";

import React from "react";
import { ProviderSidebar } from "./ProviderSidebar";
import { ProviderHeader } from "./ProviderHeader";
import { ProviderMobileNav } from "./ProviderMobileNav";

interface ProviderShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function ProviderShell({
  children,
  headerTitle = "Studio Partner Dashboard",
  headerSubtitle,
}: ProviderShellProps) {
  return (
    <div className="bg-background text-on-surface min-h-screen flex font-body-md overflow-x-hidden">
      {/* Desktop Sidebar (w-64) */}
      <ProviderSidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <ProviderHeader title={headerTitle} subtitle={headerSubtitle} />

        {/* Dynamic Canvas Area */}
        <main className="flex-1 pt-20 pb-20 md:pb-8 px-4 md:px-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <ProviderMobileNav />
      </div>
    </div>
  );
}
