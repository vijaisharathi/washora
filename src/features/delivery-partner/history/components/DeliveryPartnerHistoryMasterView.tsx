"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw, Layers } from "lucide-react";
import { HistoryFilterParams } from "@/types/delivery-partner";
import {
  useDeliveryPartnerHistorySummary,
  useDeliveryPartnerHistoryRecords,
} from "../hooks/useDeliveryPartnerHistory";
import { HistoryHeroCard } from "./HistoryHeroCard";
import { HistoryFilterBar } from "./HistoryFilterBar";
import { HistoryRecordCard } from "./HistoryRecordCard";

export function DeliveryPartnerHistoryMasterView() {
  const { summary, isLoading: isSummaryLoading, isError: isSummaryError, refetch: refetchSummary } =
    useDeliveryPartnerHistorySummary();

  const [filter, setFilter] = useState<HistoryFilterParams>({
    outcome: "ALL",
    searchQuery: "",
  });

  const {
    records,
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useDeliveryPartnerHistoryRecords(filter);

  const isLoading = isSummaryLoading || isRecordsLoading;
  const isError = isSummaryError || isRecordsError;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="h-14 rounded-2xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="space-y-4">
          <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
          <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 rounded-3xl bg-surface-container/70 border border-error/30 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-on-surface">Failed to load delivery history</p>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          History log service unavailable. Please check connection.
        </p>
        <button
          onClick={() => {
            refetchSummary();
            refetchRecords();
          }}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Stats */}
      <HistoryHeroCard summary={summary} />

      {/* Filter and Search Bar */}
      <HistoryFilterBar filter={filter} onChange={setFilter} />

      {/* List of Records */}
      {records.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
          <Layers className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
          <p className="text-sm font-bold text-on-surface">No matching historical deliveries</p>
          <p className="text-xs text-on-surface-variant">
            Try adjusting your search query or switching tabs.
          </p>
          <button
            onClick={() => setFilter({ outcome: "ALL", searchQuery: "" })}
            className="px-4 py-1.5 rounded-xl bg-surface-container-highest text-xs font-semibold text-primary hover:underline mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <HistoryRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
