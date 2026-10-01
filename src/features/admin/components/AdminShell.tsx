"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminMobileNav } from "./AdminMobileNav";

interface AdminShellProps {
  children: React.ReactNode;
  headerTitle?: string;
}

export function AdminShell({
  children,
  headerTitle = "Lumina Control Center",
}: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface min-h-screen flex font-body-md overflow-x-hidden">
      {/* Desktop Fixed Sidebar (w-[260px]) */}
      <AdminSidebar />

      {/* Mobile Slide-over Navigation */}
      <AdminMobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* Fixed Header */}
        <AdminHeader
          title={headerTitle}
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          mobileNavOpen={mobileNavOpen}
        />

        {/* Dynamic Page Content Canvas */}
        <main className="flex-1 pt-20 pb-12 px-4 md:px-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
