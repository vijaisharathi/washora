"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Calendar,
  Layers,
  CheckCircle2,
  CreditCard,
  IndianRupee,
} from "lucide-react";
import {
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from "@/types/admin";

interface PaymentsSearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  type: TransactionType | "all";
  onTypeChange: (val: TransactionType | "all") => void;
  status: TransactionStatus | "all";
  onStatusChange: (val: TransactionStatus | "all") => void;
  paymentMethod: PaymentMethod | "all";
  onPaymentMethodChange: (val: PaymentMethod | "all") => void;
  datePreset: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days";
  onDatePresetChange: (
    val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  ) => void;
  amountRange: "all" | "under_500" | "500_999" | "1000_4999" | "5000_plus";
  onAmountRangeChange: (
    val: "all" | "under_500" | "500_999" | "1000_4999" | "5000_plus"
  ) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function PaymentsSearchFilterBar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  datePreset,
  onDatePresetChange,
  amountRange,
  onAmountRangeChange,
  onReset,
  hasActiveFilters,
}: PaymentsSearchFilterBarProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 mb-4 space-y-3 shadow-xs">
      {/* Search Input and Reset Action */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Txn ID, Ref, Booking #, Customer, Provider, or Valet..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-surface-container/60 border border-outline-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/60"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0 self-end md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Multi-Filter Dropdown Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Transaction Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-primary" />
            Type
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as TransactionType | "all")}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-surface-container/60 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="Payment">Payment</option>
            <option value="Refund">Refund</option>
            <option value="Provider Earning">Provider Earning</option>
            <option value="Delivery Partner Earning">Delivery Partner Earning</option>
          </select>
        </div>

        {/* Transaction Status */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as TransactionStatus | "all")}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-surface-container/60 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Reversed">Reversed</option>
          </select>
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-primary" />
            Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              onPaymentMethodChange(e.target.value as PaymentMethod | "all")
            }
            className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-surface-container/60 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Date Preset */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-primary" />
            Date Range
          </label>
          <select
            value={datePreset}
            onChange={(e) =>
              onDatePresetChange(
                e.target.value as
                  | "all"
                  | "today"
                  | "yesterday"
                  | "last_7_days"
                  | "last_30_days"
              )
            }
            className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-surface-container/60 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
            <IndianRupee className="w-3 h-3 text-primary" />
            Amount Range
          </label>
          <select
            value={amountRange}
            onChange={(e) =>
              onAmountRangeChange(
                e.target.value as
                  | "all"
                  | "under_500"
                  | "500_999"
                  | "1000_4999"
                  | "5000_plus"
              )
            }
            className="w-full py-1.5 px-2.5 text-xs rounded-lg bg-surface-container/60 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Amounts</option>
            <option value="under_500">Under ₹500</option>
            <option value="500_999">₹500 – ₹999</option>
            <option value="1000_4999">₹1,000 – ₹4,999</option>
            <option value="5000_plus">₹5,000+</option>
          </select>
        </div>
      </div>
    </div>
  );
}
