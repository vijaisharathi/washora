"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useProviderOrderItem,
  useProviderOrders,
} from "@/features/provider/orders/hooks/useProviderOrders";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProcessingChecklistCard } from "./ProcessingChecklistCard";
import { OrderPhotosTimerCard } from "./OrderPhotosTimerCard";
import { AdvanceStageModal } from "./AdvanceStageModal";
import { ReportIssueModal } from "./ReportIssueModal";
import { ProviderOrderStatus } from "@/types/provider/orders";

interface ProviderOrderDetailViewProps {
  orderId: string;
}

export function ProviderOrderDetailView({ orderId }: ProviderOrderDetailViewProps) {
  const { data: order, isLoading, isError } = useProviderOrderItem(orderId);
  const {
    advanceStage,
    isAdvancing,
    toggleChecklistStep,
    isTogglingStep,
    reportIssue,
    isReportingIssue,
  } = useProviderOrders();

  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Service Processing Checklist..." />;
  }

  if (isError || !order) {
    return <ProviderErrorState title="Order not found or access restricted" />;
  }

  const handleAdvance = async (nextStatus: ProviderOrderStatus) => {
    await advanceStage({ orderId: order.id, nextStatus });
    setIsAdvanceOpen(false);
  };

  const handleReportIssue = async (reason: string, details: string) => {
    await reportIssue({ orderId: order.id, reason, details });
    setIsIssueOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/provider/orders"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Care Queue</span>
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

          {order.status !== "READY_VALET" && (
            <button
              type="button"
              onClick={() => setIsAdvanceOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              <span>Advance Next Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left (Timer + Photos) | Right (Checklist + Notes) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (4 cols) */}
        <div className="md:col-span-4">
          <OrderPhotosTimerCard order={order} />
        </div>

        {/* Right Column (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          <ProcessingChecklistCard
            steps={order.checklist}
            serviceTitle={order.serviceName}
            onToggleStep={(stepId) => toggleChecklistStep({ orderId: order.id, stepId })}
            isToggling={isTogglingStep}
          />

          {/* Exception Audit if logged */}
          {order.issueReport && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-xs text-error space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Active Issue: {order.issueReport.reason}</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">{order.issueReport.details}</p>
            </div>
          )}
        </div>
      </div>

      {/* Advance Stage Modal */}
      <AdvanceStageModal
        order={order}
        isOpen={isAdvanceOpen}
        onClose={() => setIsAdvanceOpen(false)}
        onConfirm={handleAdvance}
        isAdvancing={isAdvancing}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        order={order}
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onConfirm={handleReportIssue}
        isReporting={isReportingIssue}
      />
    </div>
  );
}
