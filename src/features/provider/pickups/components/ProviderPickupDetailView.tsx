"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useProviderPickupItem,
  useProviderPickups,
} from "@/features/provider/pickups/hooks/useProviderPickups";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { HandoverChecklistSection } from "./HandoverChecklistSection";
import { AssignedPartnerCard } from "./AssignedPartnerCard";
import { HandoffTimelineCard } from "./HandoffTimelineCard";
import { ConfirmHandoverModal } from "./ConfirmHandoverModal";
import { ReportHandoverIssueModal } from "./ReportHandoverIssueModal";

interface ProviderPickupDetailViewProps {
  pickupId: string;
}

export function ProviderPickupDetailView({ pickupId }: ProviderPickupDetailViewProps) {
  const { data: pickup, isLoading, isError } = useProviderPickupItem(pickupId);
  const {
    availablePartners,
    assignPartner,
    isAssigning,
    toggleChecklist,
    isToggling,
    confirmHandover,
    isConfirming,
    reportIssue,
    isReporting,
  } = useProviderPickups();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Handoff Verification Details..." />;
  }

  if (isError || !pickup) {
    return <ProviderErrorState title="Handoff record not found or access restricted" />;
  }

  const handleConfirmHandoff = async (verificationCode?: string) => {
    await confirmHandover({ pickupId: pickup.id, verificationCode });
    setIsConfirmOpen(false);
  };

  const handleReportIssue = async (reason: string, details: string) => {
    await reportIssue({ pickupId: pickup.id, reason, details });
    setIsIssueOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/provider/pickups"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Valet Queue</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsIssueOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-error/30 text-error hover:bg-error-container/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">report_problem</span>
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Main Content: Left (Delivery Information + Checklist) | Right (Timeline + Partner Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Delivery Information Bento Card */}
          <ProviderCard
            variant="container"
            className="p-6 md:p-8 space-y-5 border-l-4 border-l-primary relative overflow-hidden"
          >
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <span>Delivery Information</span>
                </h2>
                <span className="font-mono text-xs font-bold text-primary">{pickup.pickupNumber}</span>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-container/20 text-primary border border-primary/30">
                {pickup.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Customer
                </span>
                <p className="font-bold text-on-surface text-sm">{pickup.customerName}</p>
                <p className="text-on-surface-variant font-mono">{pickup.customerPhone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Destination Area
                </span>
                <p className="font-bold text-on-surface text-sm">{pickup.destinationArea}</p>
                <p className="text-primary font-medium">{pickup.deliveryWindow}</p>
              </div>
            </div>

            {/* Service & Items */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Fulfilled Service &amp; Packaging
              </span>
              <p className="font-bold text-on-surface">{pickup.serviceName}</p>
              <p className="text-on-surface-variant">{pickup.itemDescription}</p>
            </div>

            {/* Notes if present */}
            {pickup.notes && (
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 text-xs text-on-surface italic">
                &quot;{pickup.notes}&quot;
              </div>
            )}
          </ProviderCard>

          {/* Checklist */}
          <HandoverChecklistSection
            checklist={pickup.checklist}
            itemDescription={pickup.itemDescription}
            onToggle={(key) => toggleChecklist({ pickupId: pickup.id, key })}
            isToggling={isToggling}
          />
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <HandoffTimelineCard status={pickup.status} handedOverAt={pickup.handedOverAt} />

          <AssignedPartnerCard
            partner={pickup.partner}
            status={pickup.status}
            availablePartners={availablePartners}
            onAssignPartner={(partnerId) => assignPartner({ pickupId: pickup.id, partnerId })}
            onConfirmHandoffClick={() => setIsConfirmOpen(true)}
            isAssigning={isAssigning}
          />
        </div>
      </div>

      {/* Confirm Handover Modal */}
      <ConfirmHandoverModal
        pickup={pickup}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmHandoff}
        isConfirming={isConfirming}
      />

      {/* Report Issue Modal */}
      <ReportHandoverIssueModal
        pickup={pickup}
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onConfirm={handleReportIssue}
        isReporting={isReporting}
      />
    </div>
  );
}
