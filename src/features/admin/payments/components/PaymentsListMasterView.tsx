"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  RotateCcw,
  Store,
  Bike,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useAdminSession } from "../../hooks/useAdminSession";
import { useAdminPayments } from "../../hooks/useAdminPayments";
import { PaymentsHeader } from "./PaymentsHeader";
import { PaymentsSummaryCards } from "./PaymentsSummaryCards";
import { PaymentsSearchFilterBar } from "./PaymentsSearchFilterBar";
import { TransactionsTable } from "./TransactionsTable";
import { PaymentsPagination } from "./PaymentsPagination";
import { CreateRefundModal } from "./modals/CreateRefundModal";
import { MarkRefundCompleteModal } from "./modals/MarkRefundCompleteModal";
import { AdminLoadingState } from "../../components/AdminLoadingState";
import { AdminErrorState } from "../../components/AdminErrorState";
import { Refund, Payment } from "@/types/admin";
import { getMockPaymentsByOrg } from "@/mocks/admin/payment.mock";

export function PaymentsListMasterView() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [activeTab, setActiveTab] = useState<"transactions" | "refunds" | "links">(
    "transactions"
  );

  const {
    loading,
    error,
    summary,
    result,
    refunds,
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    datePreset,
    setDatePreset,
    amountRange,
    setAmountRange,
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch,
    createRefund,
    markRefundComplete,
    resetFilters,
  } = useAdminPayments();

  // Refund Modals State
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<{
    bookingId: string;
    payment: Payment | null;
  } | null>(null);

  const [selectedRefundForCompletion, setSelectedRefundForCompletion] =
    useState<Refund | null>(null);

  const hasActiveFilters =
    search !== "" ||
    type !== "all" ||
    status !== "all" ||
    paymentMethod !== "all" ||
    datePreset !== "all" ||
    amountRange !== "all";

  const handleOpenRefundModal = (bookingId: string, paymentId?: string) => {
    const orgPayments = getMockPaymentsByOrg(organizationId);
    const payment = paymentId
      ? orgPayments.find((p) => p.id === paymentId) || null
      : orgPayments.find((p) => p.bookingId === bookingId) || null;

    setSelectedBookingForRefund({ bookingId, payment });
  };

  if (loading && !summary) {
    return <AdminLoadingState message="Loading financial ledger & payments data..." />;
  }

  if (error && !summary) {
    return (
      <AdminErrorState
        title="Failed to Load Payments"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <PaymentsHeader
        organizationId={organizationId}
        totalTransactions={result.total}
        onRefresh={refetch}
        isLoading={loading}
      />

      {/* 2. Top Summary KPI Cards */}
      <PaymentsSummaryCards metrics={summary} isLoading={loading} />

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "transactions"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>All Transactions ({result.total})</span>
          </button>

          <button
            onClick={() => setActiveTab("refunds")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "refunds"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refunds Queue ({refunds.length})</span>
            {summary && summary.pendingRefundsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {summary.pendingRefundsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("links")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "links"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quick Subviews</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: All Transactions Table View */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <PaymentsSearchFilterBar
            search={search}
            onSearchChange={setSearch}
            type={type}
            onTypeChange={setType}
            status={status}
            onStatusChange={setStatus}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            amountRange={amountRange}
            onAmountRangeChange={setAmountRange}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <TransactionsTable
            transactions={result.transactions}
            isLoading={loading}
            onInitiateRefund={handleOpenRefundModal}
          />

          <PaymentsPagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            totalPages={result.totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* 5. Tab 2: Refunds Queue */}
      {activeTab === "refunds" && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Refunds Ledger & Requests</h3>
              <p className="text-xs text-on-surface-variant">
                Manage compensation, order cancellations, and customer adjustments.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface">
              {refunds.length} Total Refunds
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Refund ID</th>
                  <th className="py-3 px-4">Booking</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requested At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {ref.id}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/payments/bookings/${ref.bookingId}`}
                        className="font-medium text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {ref.bookingId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      ₹{ref.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-on-surface" title={ref.reason}>
                      {ref.reason}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {ref.status === "Completed" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Completed
                        </span>
                      )}
                      {ref.status === "Processing" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-2.5 h-2.5" />
                          Processing
                        </span>
                      )}
                      {ref.status === "Requested" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          <Clock className="w-2.5 h-2.5" />
                          Requested
                        </span>
                      )}
                      {ref.status === "Rejected" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap text-[11px]">
                      {new Date(ref.requestedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {(ref.status === "Processing" || ref.status === "Requested") && (
                        <button
                          onClick={() => setSelectedRefundForCompletion(ref)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Quick Subviews (Providers, Delivery Partners, Bookings) */}
      {activeTab === "links" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Provider Earnings Shortcuts */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-indigo-500">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-on-surface">Provider Earnings</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Inspect gross earnings, platform commission deductions, and accrued payouts per workshop provider.
            </p>
            <div className="space-y-1.5 pt-1">
              {organizationId === "ORG-0001" ? (
                <>
                  <Link
                    href="/admin/payments/providers/PRO-0001"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Sparkle Cleaners (PRO-0001)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                  <Link
                    href="/admin/payments/providers/PRO-0002"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Urban Care Hub (PRO-0002)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                  <Link
                    href="/admin/payments/providers/PRO-0003"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Elite Garment Spa (PRO-0003)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/payments/providers/PRO-0007"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Kochi Laundry Works (PRO-0007)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                  <Link
                    href="/admin/payments/providers/PRO-0008"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Malabar Fabric Care (PRO-0008)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Delivery Partner Earnings Shortcuts */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-sky-500">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-on-surface">Valet Partner Earnings</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Track pickup/dropoff valet payouts, platform fee splits, and delivery settlement summaries.
            </p>
            <div className="space-y-1.5 pt-1">
              {organizationId === "ORG-0001" ? (
                <>
                  <Link
                    href="/admin/payments/delivery-partners/DLP-0001"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Karthik Raja (DLP-0001)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                  <Link
                    href="/admin/payments/delivery-partners/DLP-0002"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Vignesh Kumar (DLP-0002)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/payments/delivery-partners/DLP-0006"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Anand Mohan (DLP-0006)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                  <Link
                    href="/admin/payments/delivery-partners/DLP-0007"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                  >
                    <span>Midhun Raj (DLP-0007)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Booking Financial Ledger Drilldowns */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-500">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-on-surface">Booking Breakdown</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Review full transaction audit trails and tripartite profit splits for individual booking orders.
            </p>
            <div className="space-y-1.5 pt-1">
              <Link
                href={organizationId === "ORG-0001" ? "/admin/payments/bookings/BKG-000001" : "/admin/payments/bookings/BKG-000036"}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
              >
                <span>{organizationId === "ORG-0001" ? "BKG-000001 (WAS-2026-000001)" : "BKG-000036 (WAS-2026-000036)"}</span>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
              </Link>
              <Link
                href={organizationId === "ORG-0001" ? "/admin/payments/bookings/BKG-000002" : "/admin/payments/bookings/BKG-000037"}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
              >
                <span>{organizationId === "ORG-0001" ? "BKG-000002 (Steam Press)" : "BKG-000037 (Dry Clean)"}</span>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modals */}
      <CreateRefundModal
        isOpen={!!selectedBookingForRefund}
        onClose={() => setSelectedBookingForRefund(null)}
        bookingId={selectedBookingForRefund?.bookingId || ""}
        payment={selectedBookingForRefund?.payment || null}
        onSubmit={createRefund}
      />

      <MarkRefundCompleteModal
        isOpen={!!selectedRefundForCompletion}
        onClose={() => setSelectedRefundForCompletion(null)}
        refund={selectedRefundForCompletion}
        onConfirm={markRefundComplete}
      />
    </div>
  );
}
