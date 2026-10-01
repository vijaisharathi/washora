"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building2,
} from "lucide-react";
import { useAdminDeliveryPartnerEarnings } from "@/features/admin/hooks/useAdminPayments";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";
import { EarningsStatus, EarningsRecord } from "@/types/admin/payment";

interface DeliveryPartnerEarningsMasterViewProps {
  partnerId: string;
}

export function DeliveryPartnerEarningsMasterView({
  partnerId,
}: DeliveryPartnerEarningsMasterViewProps) {
  const { loading, error, data, refetch, updateStatus } =
    useAdminDeliveryPartnerEarnings(partnerId);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (loading) {
    return (
      <AdminLoadingState message={`Loading valet #${partnerId} earnings ledger...`} />
    );
  }

  if (error || !data) {
    return (
      <AdminErrorState
        title="Delivery Partner Not Found"
        message={error || "Could not retrieve delivery partner earnings ledger."}
        onRetry={refetch}
      />
    );
  }

  const handleStatusChange = async (earningsId: string, newStatus: EarningsStatus) => {
    try {
      setUpdatingId(earningsId);
      await updateStatus(earningsId, newStatus);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update earnings status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Breadcrumb & Header */}
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
            <h1 className="text-xl font-bold text-on-surface">{data.partnerName}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30">
              {data.partnerId}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Vehicle: <span className="font-semibold text-on-surface capitalize">{data.vehicleType}</span> ({data.vehicleNumber}) • Organization:{" "}
            <span className="font-mono font-semibold text-on-surface">{data.organizationId}</span> • Completed Deliveries:{" "}
            <span className="font-bold text-on-surface">{data.totalCompletedDeliveries}</span>
          </p>
        </div>

        <Link
          href={`/admin/delivery-partners/${data.partnerId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-all"
        >
          <span>Partner Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
          <span className="text-[11px] text-on-surface-variant font-medium block">Total Net Realized</span>
          <span className="text-lg font-bold text-primary block mt-0.5">
            ₹{data.totalEarnings.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-on-surface-variant">Accrued + Paid</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
          <span className="text-[11px] text-on-surface-variant font-medium block">Paid Payouts</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
            ₹{data.paidEarnings.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-on-surface-variant">Disbursed</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
          <span className="text-[11px] text-on-surface-variant font-medium block">Accrued Balance</span>
          <span className="text-lg font-bold text-sky-500 block mt-0.5">
            ₹{data.accruedEarnings.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-on-surface-variant">Ready for payout</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
          <span className="text-[11px] text-on-surface-variant font-medium block">Pending Settlement</span>
          <span className="text-lg font-bold text-amber-500 block mt-0.5">
            ₹{data.pendingEarnings.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-on-surface-variant">In-flight deliveries</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
          <span className="text-[11px] text-on-surface-variant font-medium block">Cancelled / Forfeited</span>
          <span className="text-lg font-bold text-rose-500 block mt-0.5">
            ₹{data.cancelledEarnings.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-on-surface-variant">Cancelled deliveries</span>
        </div>
      </div>

      {/* Delivery Partner Records Ledger */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface">Valet Delivery Fee Ledger ({data.records.length})</h3>
          <span className="text-xs text-on-surface-variant">Trip commission split</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container/50 border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-semibold uppercase">
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4">Gross Fee</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {data.records.map((rec: EarningsRecord) => (
                <tr key={rec.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{rec.id}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/payments/bookings/${rec.bookingId}`}
                      className="font-medium text-on-surface hover:text-primary flex items-center gap-1"
                    >
                      {rec.bookingId}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium">₹{rec.grossAmount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 text-rose-500 font-medium">-₹{rec.platformFee.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400">
                    ₹{rec.netAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    {rec.status === "Paid" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Paid
                      </span>
                    )}
                    {rec.status === "Accrued" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Accrued
                      </span>
                    )}
                    {rec.status === "Pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Pending
                      </span>
                    )}
                    {rec.status === "Cancelled" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                    {new Date(rec.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {rec.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(rec.id, "Accrued")}
                            disabled={updatingId === rec.id}
                            className="px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-semibold"
                          >
                            Accrue
                          </button>
                          <button
                            onClick={() => handleStatusChange(rec.id, "Cancelled")}
                            disabled={updatingId === rec.id}
                            className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {rec.status === "Accrued" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(rec.id, "Paid")}
                            disabled={updatingId === rec.id}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleStatusChange(rec.id, "Cancelled")}
                            disabled={updatingId === rec.id}
                            className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(rec.status === "Paid" || rec.status === "Cancelled") && (
                        <span className="text-[10px] text-on-surface-variant font-mono">Finalized</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
