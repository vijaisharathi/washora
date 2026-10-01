"use client";

import React, { useState } from "react";
import { Download, ShoppingBag, Shield, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingManagementHeaderProps {
  totalCount: number;
  organizationId: string;
}

export function BookingManagementHeader({
  totalCount,
  organizationId,
}: BookingManagementHeaderProps) {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleExportCsv = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
            Bookings & Orders
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/25">
            {totalCount} Total Bookings
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-mono">
            <Shield className="w-3 h-3 text-primary" />
            {organizationId}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm mt-1">
          Monitor operational lifecycle, inspect service details, manage schedules, and coordinate order status across your organization.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="bg-surface-container-high border-outline-variant hover:bg-surface-container-highest text-on-surface flex items-center gap-2 text-xs"
        >
          <Download className="w-4 h-4 text-on-surface-variant" />
          <span>Export CSV</span>
        </Button>

        <div
          title="Customer orders are placed via the WASHORA booking discovery and checkout flow"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface-variant text-xs font-medium cursor-help"
        >
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Intake: Customer Portal</span>
        </div>
      </div>

      {copiedNotification && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-container-lowest border border-primary/40 rounded-xl shadow-2xl text-xs text-on-surface animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>Booking records successfully compiled for CSV export.</span>
        </div>
      )}
    </div>
  );
}
