import React from "react";
import { Metadata } from "next";
import { ReportsNavigationTabs } from "@/features/admin/reports/components/ReportsNavigationTabs";

export const metadata: Metadata = {
  title: "Reports & Analytics | WASHORA Admin",
  description: "Platform-wide operational analytics, financial metrics, and intelligence reporting",
};

export default function AdminReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Top Tab Bar for Navigation */}
      <ReportsNavigationTabs />
      {/* Active Sub-Report View */}
      {children}
    </div>
  );
}
