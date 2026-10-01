"use client";

import React from "react";
import { Star, ShieldAlert, EyeOff, CheckCircle2, MessageSquare } from "lucide-react";
import { useAdminReviewsReport } from "../../../hooks/useAdminAnalytics";
import { ReportsHeader } from "../ReportsHeader";
import { AnalyticsKpiCard, AnalyticsKpiGrid } from "../AnalyticsKpiCard";
import { AreaTrendChart } from "../charts/AreaTrendChart";
import { DonutDistributionChart } from "../charts/DonutDistributionChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";
import { AnalyticsDataTable, TableColumn } from "../tables/AnalyticsDataTable";
import { AnalyticsSkeleton } from "../skeletons/AnalyticsSkeleton";

export function ReviewsReportView() {
  const {
    loading,
    error,
    data,
    dateRange,
    startDate,
    endDate,
    city,
    serviceCategory,
    providerId,
    deliveryPartnerId,
    serviceId,
    filterOptions,
    activeFilterCount,
    setDateRange,
    setStartDate,
    setEndDate,
    setCity,
    setServiceCategory,
    setProviderId,
    setDeliveryPartnerId,
    setServiceId,
    resetFilters,
    refetch,
  } = useAdminReviewsReport();

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-500">{error || "Unable to load review analytics."}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { kpis, ratingDistribution, reviewsTrend, averageRatingTrend, categoryReviewsDistribution, recentReviewsBreakdown } = data;

  const tableColumns: TableColumn<typeof recentReviewsBreakdown[0]>[] = [
    { key: "bookingNumber", header: "Booking Order", sortable: true, render: (r) => <span className="font-mono font-bold text-xs">{r.bookingNumber}</span> },
    { key: "customerName", header: "Customer", sortable: true },
    { key: "providerName", header: "Provider Facility", sortable: true },
    {
      key: "rating",
      header: "Score",
      align: "center",
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold flex items-center justify-center gap-1 text-amber-500">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {r.rating}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      render: (r) => {
        const isPub = r.status === "Published" || r.status === "Restored";
        const isFlagged = r.status === "Flagged";
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPub
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : isFlagged
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
            }`}
          >
            {r.status}
          </span>
        );
      },
    },
    {
      key: "comment",
      header: "Review Snippet",
      render: (r) => <span className="line-clamp-1 text-on-surface-variant max-w-xs">{r.comment}</span>,
    },
    {
      key: "createdAt",
      header: "Date",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-on-surface-variant text-[11px]">
          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportsHeader
        title="Review & Sentiment Quality Analytics"
        subtitle="Customer feedback distribution, sentiment trends, and content moderation records"
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onSelectPreset={setDateRange}
        onApplyCustomRange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setDateRange("custom");
        }}
        city={city}
        serviceCategory={serviceCategory}
        providerId={providerId}
        deliveryPartnerId={deliveryPartnerId}
        serviceId={serviceId}
        filterOptions={filterOptions}
        activeFilterCount={activeFilterCount}
        onSetCity={setCity}
        onSetCategory={setServiceCategory}
        onSetProvider={setProviderId}
        onSetDeliveryPartner={setDeliveryPartnerId}
        onSetService={setServiceId}
        onResetFilters={resetFilters}
        onRefresh={refetch}
        isRefreshing={loading}
      />

      {/* Warning Notice about Excluded Reviews */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
        <span className="font-medium flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
          <span>
            <strong>Rating Integrity Rule:</strong> Average customer score strictly calculates from{" "}
            <em>Published</em> and <em>Restored</em> feedback. Flagged and Hidden reviews are excluded from publicly visible averages.
          </span>
        </span>
      </div>

      {/* KPIs Grid */}
      <AnalyticsKpiGrid columns={5}>
        <AnalyticsKpiCard kpi={kpis.totalReviews} icon={<MessageSquare className="w-4 h-4 text-blue-500" />} />
        <AnalyticsKpiCard kpi={kpis.averageRating} icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />} />
        <AnalyticsKpiCard kpi={kpis.publishedCount} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <AnalyticsKpiCard kpi={kpis.flaggedCount} icon={<ShieldAlert className="w-4 h-4 text-amber-500" />} />
        <AnalyticsKpiCard kpi={kpis.hiddenCount} icon={<EyeOff className="w-4 h-4 text-rose-500" />} />
      </AnalyticsKpiGrid>

      {/* Star Breakdowns Grid */}
      <AnalyticsKpiGrid columns={5}>
        <AnalyticsKpiCard kpi={kpis.fiveStar} />
        <AnalyticsKpiCard kpi={kpis.fourStar} />
        <AnalyticsKpiCard kpi={kpis.threeStar} />
        <AnalyticsKpiCard kpi={kpis.twoStar} />
        <AnalyticsKpiCard kpi={kpis.oneStar} />
      </AnalyticsKpiGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Customer Sentiment & Rating Trend"
            subtitle="Evolution of verified average score over the reporting period"
            data={averageRatingTrend}
            primarySeries={{
              name: "Average Rating (★)",
              color: "#F59E0B",
              gradientId: "grad-rev-avg",
              formatter: (v) => `${v.toFixed(1)} ★`,
            }}
            height={260}
          />
        </div>

        <div>
          <DonutDistributionChart
            title="Star Rating Distribution"
            subtitle="Proportion of feedback across rating scale"
            items={ratingDistribution}
            centerLabel="Rating Avg"
            centerValue={kpis.averageRating.formattedValue}
          />
        </div>
      </div>

      {/* Category Sentiment Distribution */}
      <div className="grid grid-cols-1 gap-6">
        <HorizontalBarChart
          title="Review Volume by Service Category"
          subtitle="Feedback density received per category offering"
          items={categoryReviewsDistribution}
          color="#F59E0B"
        />
      </div>

      {/* Moderation & Feedback Table */}
      <AnalyticsDataTable
        title="Recent Customer Feedback Roster"
        subtitle="Individual review submissions and moderation status"
        columns={tableColumns}
        data={recentReviewsBreakdown}
        loading={loading}
      />
    </div>
  );
}
