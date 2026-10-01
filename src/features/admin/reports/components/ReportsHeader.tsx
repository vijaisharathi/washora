"use client";

import React from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { ReportDateRange } from "@/types/admin/analytics";
import { DateRangeSelector } from "./DateRangeSelector";
import { GlobalFilterSheet } from "./GlobalFilterSheet";
import { FilterOptionsState } from "../../hooks/useAdminAnalytics";

interface ReportsHeaderProps {
  title: string;
  subtitle: string;
  dateRange: ReportDateRange;
  startDate: string;
  endDate: string;
  onSelectPreset: (preset: ReportDateRange) => void;
  onApplyCustomRange: (startDate: string, endDate: string) => void;
  city: string;
  serviceCategory: string;
  providerId: string;
  deliveryPartnerId: string;
  serviceId: string;
  filterOptions: FilterOptionsState;
  activeFilterCount: number;
  onSetCity: (val: string) => void;
  onSetCategory: (val: string) => void;
  onSetProvider: (val: string) => void;
  onSetDeliveryPartner: (val: string) => void;
  onSetService: (val: string) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  hiddenFilters?: ("city" | "category" | "provider" | "deliveryPartner" | "service")[];
}

export function ReportsHeader({
  title,
  subtitle,
  dateRange,
  startDate,
  endDate,
  onSelectPreset,
  onApplyCustomRange,
  city,
  serviceCategory,
  providerId,
  deliveryPartnerId,
  serviceId,
  filterOptions,
  activeFilterCount,
  onSetCity,
  onSetCategory,
  onSetProvider,
  onSetDeliveryPartner,
  onSetService,
  onResetFilters,
  onRefresh,
  isRefreshing = false,
  hiddenFilters,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <DateRangeSelector
          dateRange={dateRange}
          startDate={startDate}
          endDate={endDate}
          onSelectPreset={onSelectPreset}
          onApplyCustomRange={onApplyCustomRange}
        />

        <GlobalFilterSheet
          city={city}
          serviceCategory={serviceCategory}
          providerId={providerId}
          deliveryPartnerId={deliveryPartnerId}
          serviceId={serviceId}
          filterOptions={filterOptions}
          activeFilterCount={activeFilterCount}
          onSetCity={onSetCity}
          onSetCategory={onSetCategory}
          onSetProvider={onSetProvider}
          onSetDeliveryPartner={onSetDeliveryPartner}
          onSetService={onSetService}
          onResetFilters={onResetFilters}
          hiddenFilters={hiddenFilters}
        />

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-on-surface-variant"}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
