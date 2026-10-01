import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account, Roles & Settings — WASHORA Admin Console",
  description: "Enterprise administration, profile management, organization roster, and role permission matrices.",
};

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {children}
    </div>
  );
}
