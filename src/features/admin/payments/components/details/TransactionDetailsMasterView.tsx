"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Store,
  Bike,
  Building2,
  Calendar,
  User,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useAdminTransactionDetails } from "@/features/admin/hooks/useAdminPayments";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";
import { CreateRefundModal } from "../modals/CreateRefundModal";
import { adminPaymentService } from "@/services/admin/adminPaymentService";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { CreateRefundFormValues } from "@/types/admin/payment";

interface TransactionDetailsMasterViewProps {
  transactionId: string;
}

export function TransactionDetailsMasterView({
  transactionId,
}: TransactionDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const { loading, error, data, refetch } = useAdminTransactionDetails(transactionId);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  if (loading) {
    return <AdminLoadingState message={`Loading transaction #${transactionId}...`} />;
  }

  if (error || !data) {
    return (
      <AdminErrorState
        title="Transaction Not Found"
        message={error || "Could not retrieve transaction details."}
        onRetry={refetch}
      />
    );
  }

  const { transaction, booking, payment, financialBreakdown } = data;

  const handleCreateRefund = async (payload: CreateRefundFormValues) => {
    await adminPaymentService.createRefund(organizationId, payload);
    await refetch();
  };

  const isEligibleForRefund =
    payment &&
    (payment.status === "Paid" || payment.status === "Partially Refunded") &&
    payment.paidAmount - payment.refundedAmount > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="space-y-1">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Payments Ledger
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-on-surface">
              Transaction #{transaction.id}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30">
              {transaction.reference}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEligibleForRefund && (
            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Issue Refund</span>
            </button>
          )}

          <Link
            href={`/admin/payments/bookings/${transaction.bookingId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
          >
            <span>View Booking Ledger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Transaction Information */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Transaction Details
            </h3>
            {transaction.status === "Completed" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Completed
              </span>
            )}
            {transaction.status === "Pending" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-2.5 h-2.5" />
                Pending
              </span>
            )}
            {transaction.status === "Failed" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-2.5 h-2.5" />
                Failed
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs divide-y divide-outline-variant/20">
            <div className="flex justify-between pt-1 text-on-surface-variant">
              <span>Amount:</span>
              <span className="font-bold text-base text-on-surface">
                ₹{transaction.amount.toLocaleString("en-IN")} {transaction.currency}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Transaction Type:</span>
              <span className="font-semibold text-on-surface">{transaction.type}</span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Reference ID:</span>
              <span className="font-mono text-on-surface">{transaction.reference}</span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Created Timestamp:</span>
              <span className="text-on-surface">
                {new Date(transaction.createdAt).toLocaleString("en-IN")}
              </span>
            </div>
            {transaction.completedAt && (
              <div className="flex justify-between pt-2 text-on-surface-variant">
                <span>Completed Timestamp:</span>
                <span className="text-on-surface">
                  {new Date(transaction.completedAt).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="pt-2 text-on-surface-variant">
              <span className="block mb-1 font-medium">Description:</span>
              <p className="text-on-surface text-[11px] bg-surface-container/50 p-2 rounded-lg">
                {transaction.description}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Linked Booking & Customer */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Booking Reference
            </h3>
            <Link
              href={`/admin/bookings/${transaction.bookingId}`}
              className="text-primary hover:underline text-[11px] flex items-center gap-1"
            >
              Order Details
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs divide-y divide-outline-variant/20">
            <div className="flex justify-between pt-1 text-on-surface-variant">
              <span>Booking Number:</span>
              <span className="font-semibold text-on-surface">
                {booking?.bookingNumber || transaction.bookingId}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Service Name:</span>
              <span className="font-medium text-on-surface">
                {booking?.serviceName || "WASHORA Service"}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Customer Name:</span>
              <span className="font-medium text-on-surface">
                {booking?.customerName || "Customer"}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Scheduled Date:</span>
              <span className="text-on-surface">
                {booking?.scheduledAt
                  ? new Date(booking.scheduledAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
            {payment && (
              <div className="flex justify-between pt-2 text-on-surface-variant">
                <span>Payment Method:</span>
                <span className="font-medium px-2 py-0.5 rounded bg-surface-container text-on-surface">
                  {payment.method}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Payment Record & Balance */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Settlement Status
            </h3>
            <span className="font-mono text-xs text-on-surface-variant">
              {payment?.id || "N/A"}
            </span>
          </div>

          <div className="space-y-2.5 text-xs divide-y divide-outline-variant/20">
            <div className="flex justify-between pt-1 text-on-surface-variant">
              <span>Paid Amount:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{payment?.paidAmount.toLocaleString("en-IN") || 0}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Refunded Amount:</span>
              <span className="font-semibold text-rose-500">
                ₹{payment?.refundedAmount.toLocaleString("en-IN") || 0}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant font-bold">
              <span>Remaining Refundable:</span>
              <span className="text-on-surface">
                ₹
                {payment
                  ? (payment.paidAmount - payment.refundedAmount).toLocaleString("en-IN")
                  : 0}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-on-surface-variant">
              <span>Payment Status:</span>
              <span className="font-semibold text-on-surface">{payment?.status || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Tripartite Profit & Commission Breakdown Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Financial Breakdown & Profit Allocation
        </h3>
        <p className="text-xs text-on-surface-variant">
          Tripartite reconciliation across customer gross invoice, provider workshop net, valet delivery fee, and WASHORA platform margins.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant font-medium block">
              Booking Total
            </span>
            <span className="text-sm font-bold text-on-surface">
              ₹{financialBreakdown.bookingTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant font-medium block">
              Customer Fee
            </span>
            <span className="text-sm font-bold text-primary">
              ₹{financialBreakdown.serviceFee.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant font-medium block">
              Provider Net
            </span>
            <span className="text-sm font-bold text-indigo-500">
              ₹{financialBreakdown.providerNet.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant font-medium block">
              Valet Net
            </span>
            <span className="text-sm font-bold text-sky-500">
              ₹{financialBreakdown.deliveryPartnerNet.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant font-medium block">
              Platform Gross
            </span>
            <span className="text-sm font-bold text-emerald-500">
              ₹{financialBreakdown.platformFeeTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant font-medium block">
              Refunds
            </span>
            <span className="text-sm font-bold text-rose-500">
              -₹{financialBreakdown.refundedAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-[10px] text-primary font-bold block">
              Net Platform Revenue
            </span>
            <span className="text-sm font-bold text-primary">
              ₹{financialBreakdown.netRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        bookingId={transaction.bookingId}
        payment={payment}
        onSubmit={handleCreateRefund}
      />
    </div>
  );
}
