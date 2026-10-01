"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDisputesRefunds } from "@/features/customer/hooks/useDisputesRefunds";
import { ReceiptFinancialSummary } from "@/features/customer/components/disputes-refunds/ReceiptFinancialSummary";
import { ReceiptDocumentActions } from "@/features/customer/components/disputes-refunds/ReceiptDocumentActions";
import { ReceiptSupportCard } from "@/features/customer/components/disputes-refunds/ReceiptSupportCard";
import { DisputeSkeleton } from "@/features/customer/components/disputes-refunds/DisputeSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ArrowLeft } from "lucide-react";

export default function OrderReceiptPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "WSH-20260901-1024";

  const { receipt, isLoading, refetch } = useDisputesRefunds(orderId);

  if (isLoading || !receipt) {
    return <DisputeSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Header matching Stitch anything_clean_receipt_invoice_support */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/customer/orders/${orderId}`}
            className="w-8 h-8 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
            Receipt &amp; Support
          </h1>
        </div>

        <div className="font-mono font-bold text-xs sm:text-sm text-primary bg-surface-container px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
          ID: {receipt.orderNumber}
        </div>
      </div>

      {/* 2-Column Split matching Stitch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Financial Summary & Documents (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ReceiptFinancialSummary receipt={receipt} />
          <ReceiptDocumentActions orderNumber={receipt.orderNumber} />
        </div>

        {/* Right Column: Support Hub & Dispute Triggers (5 cols) */}
        <div className="lg:col-span-5">
          <ReceiptSupportCard orderNumber={receipt.orderNumber} />
        </div>
      </div>
    </div>
  );
}
