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
  ChevronRight,
} from "lucide-react";
import { useAdminBookingFinancialDetails } from "@/features/admin/hooks/useAdminPayments";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";
import { CreateRefundModal } from "../modals/CreateRefundModal";
import { adminPaymentService } from "@/services/admin/adminPaymentService";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { Transaction, CreateRefundFormValues } from "@/types/admin/payment";

interface BookingFinancialDetailsMasterViewProps {
  bookingId: string;
}

export function BookingFinancialDetailsMasterView({
  bookingId,
}: BookingFinancialDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const { loading, error, data, refetch } = useAdminBookingFinancialDetails(bookingId);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  if (loading) {
    return <AdminLoadingState message={`Loading booking ledger #${bookingId}...`} />;
  }

  if (error || !data) {
    return (
      <AdminErrorState
        title="Booking Financial Record Not Found"
        message={error || "Could not retrieve financial records for this booking."}
        onRetry={refetch}
      />
    );
  }

  const { booking, payment, earnings, transactions, refunds, remainingRefundableAmount } = data;

  const handleCreateRefund = async (payload: CreateRefundFormValues) => {
    await adminPaymentService.createRefund(organizationId, payload);
    await refetch();
  };

  const isEligibleForRefund =
    payment &&
    (payment.status === "Paid" || payment.status === "Partially Refunded") &&
    remainingRefundableAmount > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="space-y-1">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Payments
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-on-surface">
              Booking Ledger: {booking.bookingNumber}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30">
              {booking.id}
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
              <span>Issue Customer Refund</span>
            </button>
          )}

          <Link
            href={`/admin/bookings/${booking.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-all"
          >
            <span>Order Operation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Booking Info & Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Booking Summary Card */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3.5 shadow-xs">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Order Context
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant block">Service</span>
              <span className="font-medium text-on-surface">{booking.serviceName}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Category</span>
              <span className="font-medium text-on-surface">{booking.serviceCategory}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Customer</span>
              <span className="font-medium text-on-surface">{booking.customerName}</span>
              <span className="text-[10px] text-on-surface-variant block font-mono">{booking.customerPhone}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Scheduled Slot</span>
              <span className="font-medium text-on-surface">
                {new Date(booking.scheduledAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Assigned Provider</span>
              <Link
                href={`/admin/payments/providers/${booking.providerId}`}
                className="font-medium text-primary hover:underline"
              >
                {booking.providerName}
              </Link>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Assigned Valet</span>
              {booking.deliveryPartnerId ? (
                <Link
                  href={`/admin/payments/delivery-partners/${booking.deliveryPartnerId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {booking.deliveryPartnerName || booking.deliveryPartnerId}
                </Link>
              ) : (
                <span className="text-on-surface-variant">Not assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Customer Payment Ledger
            </h3>
            {payment && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {payment.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant block">Total Bill</span>
              <span className="text-sm font-bold text-on-surface">
                ₹{booking.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant block">Paid</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ₹{payment?.paidAmount.toLocaleString("en-IN") || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant block">Refunded</span>
              <span className="text-sm font-bold text-rose-500">
                ₹{payment?.refundedAmount.toLocaleString("en-IN") || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant block">Refundable</span>
              <span className="text-sm font-bold text-on-surface">
                ₹{remainingRefundableAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {payment && (
            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Method: <strong className="text-on-surface">{payment.method}</strong></span>
              <span>Paid At: <strong className="text-on-surface">{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN") : "Pending"}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Tripartite Earnings Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Provider Earnings Card */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-500" />
              Provider Earnings ({booking.providerName})
            </h3>
            {earnings.providerEarnings && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {earnings.providerEarnings.status}
              </span>
            )}
          </div>

          {earnings.providerEarnings ? (
            <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-surface-container/50">
                <span className="text-[10px] text-on-surface-variant block">Gross Fee</span>
                <span className="font-bold text-on-surface">
                  ₹{earnings.providerEarnings.grossAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container/50">
                <span className="text-[10px] text-on-surface-variant block">Platform Cut</span>
                <span className="font-bold text-rose-500">
                  -₹{earnings.providerEarnings.platformFee.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
                  Net Payout
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{earnings.providerEarnings.netAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant py-3">No provider earnings generated.</p>
          )}
        </div>

        {/* Delivery Partner Earnings Card */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Bike className="w-4 h-4 text-sky-500" />
              Delivery Valet Earnings ({booking.deliveryPartnerName || "Valet"})
            </h3>
            {earnings.deliveryPartnerEarnings && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {earnings.deliveryPartnerEarnings.status}
              </span>
            )}
          </div>

          {earnings.deliveryPartnerEarnings ? (
            <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-surface-container/50">
                <span className="text-[10px] text-on-surface-variant block">Gross Valet</span>
                <span className="font-bold text-on-surface">
                  ₹{earnings.deliveryPartnerEarnings.grossAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container/50">
                <span className="text-[10px] text-on-surface-variant block">Platform Cut</span>
                <span className="font-bold text-rose-500">
                  -₹{earnings.deliveryPartnerEarnings.platformFee.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block">
                  Net Payout
                </span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  ₹{earnings.deliveryPartnerEarnings.netAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant py-3">No valet delivery earnings record.</p>
          )}
        </div>
      </div>

      {/* Transactions Associated with this Booking */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface">Related Transactions ({transactions.length})</h3>
          <span className="text-xs text-on-surface-variant">Booking Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container/50 border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-semibold uppercase">
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {transactions.map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-surface-container/40">
                  <td className="py-2.5 px-4 font-mono font-bold text-primary">{t.id}</td>
                  <td className="py-2.5 px-4">{t.type}</td>
                  <td className="py-2.5 px-4 font-semibold">₹{t.amount.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 px-4">{t.status}</td>
                  <td className="py-2.5 px-4 text-on-surface-variant">
                    {new Date(t.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Link
                      href={`/admin/payments/transactions/${t.id}`}
                      className="text-primary hover:underline text-xs"
                    >
                      Details &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      <CreateRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        bookingId={booking.id}
        payment={payment}
        onSubmit={handleCreateRefund}
      />
    </div>
  );
}
