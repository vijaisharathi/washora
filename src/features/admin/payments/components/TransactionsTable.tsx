"use client";

import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  Bike,
  CreditCard,
  Building2,
} from "lucide-react";
import { Transaction, TransactionType, TransactionStatus } from "@/types/admin";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onInitiateRefund?: (bookingId: string, paymentId?: string) => void;
}

export function TransactionsTable({
  transactions,
  isLoading,
  onInitiateRefund,
}: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
        <div className="p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-surface-container/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
          <CreditCard className="w-6 h-6 opacity-60" />
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">
          No transactions found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          No transactions match your current search query or active filter selections.
        </p>
      </div>
    );
  }

  const renderTypeBadge = (type: TransactionType) => {
    switch (type) {
      case "Payment":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3 h-3" />
            Payment
          </span>
        );
      case "Refund":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <RotateCcw className="w-3 h-3" />
            Refund
          </span>
        );
      case "Provider Earning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Store className="w-3 h-3" />
            Provider
          </span>
        );
      case "Delivery Partner Earning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Bike className="w-3 h-3" />
            Valet
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            {type}
          </span>
        );
    }
  };

  const renderStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Completed
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-2.5 h-2.5" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-2.5 h-2.5" />
            Failed
          </span>
        );
      case "Reversed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
            Reversed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-on-surface">
            {status}
          </span>
        );
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
      {/* Desktop / Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Booking</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 hidden md:table-cell">Created At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {transactions.map((txn) => {
              const isPayment = txn.type === "Payment";
              const isRefund = txn.type === "Refund";
              const amountPrefix = isPayment ? "+" : isRefund ? "-" : "";

              return (
                <tr
                  key={txn.id}
                  className="hover:bg-surface-container/40 transition-colors group"
                >
                  {/* Transaction ID & Reference */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/payments/transactions/${txn.id}`}
                      className="font-mono font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      {txn.id}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <span className="text-[10px] text-on-surface-variant font-mono block truncate max-w-[150px]">
                      {txn.reference}
                    </span>
                  </td>

                  {/* Booking ID & Link */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/payments/bookings/${txn.bookingId}`}
                      className="font-medium text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span>{txn.bookingId}</span>
                    </Link>
                    <span className="text-[10px] text-on-surface-variant truncate block max-w-[140px]">
                      {txn.description}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderTypeBadge(txn.type)}
                  </td>

                  {/* Amount in INR */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        isPayment
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isRefund
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-on-surface"
                      }`}
                    >
                      {amountPrefix}₹{txn.amount.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderStatusBadge(txn.status)}
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap text-on-surface-variant text-[11px]">
                    {formatDate(txn.createdAt)}
                  </td>

                  {/* Action Links */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/payments/transactions/${txn.id}`}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </Link>

                      {isPayment && txn.status === "Completed" && onInitiateRefund && (
                        <button
                          onClick={() => onInitiateRefund(txn.bookingId, txn.paymentId)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                          title="Initiate refund workflow"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
