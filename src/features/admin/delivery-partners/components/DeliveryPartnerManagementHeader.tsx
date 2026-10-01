"use client";

import React, { useState } from "react";
import { Download, UserPlus, CheckCircle2, Shield, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryPartnerManagementHeaderProps {
  totalCount: number;
  organizationId: string;
}

export function DeliveryPartnerManagementHeader({
  totalCount,
  organizationId,
}: DeliveryPartnerManagementHeaderProps) {
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
            Delivery Partners Management
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/25">
            {totalCount} Total
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-mono">
            <Shield className="w-3 h-3 text-primary" />
            {organizationId}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm mt-1">
          Monitor delivery fleet, review onboarding compliance, and manage fulfillment coverage across your organization.
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

        <Button
          size="sm"
          disabled
          title="Delivery partners register and submit vehicle documents through the partner onboarding portal"
          className="bg-primary/50 text-on-primary cursor-not-allowed flex items-center gap-2 text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Partner</span>
        </Button>

        {copiedNotification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest border border-outline-variant shadow-xl text-xs text-success animate-in fade-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Delivery partner directory exported successfully (Mock CSV)</span>
          </div>
        )}
      </div>
    </div>
  );
}
