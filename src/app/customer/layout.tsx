import React from "react";
import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { CustomerBottomNav } from "@/components/layout/CustomerBottomNav";
import { CustomerFooter } from "@/components/layout/CustomerFooter";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface pb-16 md:pb-0">
      <a href="#main-content" className="skip-nav-link">
        Skip to main content
      </a>
      <CustomerHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
        {children}
      </main>
      <CustomerFooter />
      <CustomerBottomNav />
    </div>
  );
}
