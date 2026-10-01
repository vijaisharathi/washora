"use client";

import React, { useState } from "react";
import { useAdminProviders } from "../../hooks/useAdminProviders";
import { useAdminSession } from "../../hooks/useAdminSession";
import { Provider } from "@/types/admin";
import { ProviderManagementHeader } from "./ProviderManagementHeader";
import { ProviderSummaryWidgets } from "./ProviderSummaryWidgets";
import { ProviderSearchFilterBar } from "./ProviderSearchFilterBar";
import { ProviderTable } from "./ProviderTable";
import { ProviderPagination } from "./ProviderPagination";
import { ProviderEditModal } from "./ProviderEditModal";
import { ProviderApprovalModal } from "./ProviderApprovalModal";
import { ProviderStatusModal } from "./ProviderStatusModal";

export function ProviderListMasterView() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const {
    data,
    metrics,
    cities,
    categories,
    isLoading,
    search,
    status,
    approvalStatus,
    serviceCategory,
    city,
    rating,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setApprovalStatus,
    setServiceCategory,
    setCity,
    setRating,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    updateProvider,
    updateProviderApproval,
    updateProviderStatus,
  } = useAdminProviders();

  // Modal states
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [reviewingProvider, setReviewingProvider] = useState<Provider | null>(null);
  const [statusProvider, setStatusProvider] = useState<Provider | null>(null);

  const providers = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <ProviderManagementHeader
        totalCount={metrics?.totalProviders || total}
        organizationId={organizationId}
      />

      {/* 2. Stitch KPI Summary Widgets */}
      <ProviderSummaryWidgets metrics={metrics} isLoading={isLoading} />

      {/* 3. Search & Filter Bar */}
      <ProviderSearchFilterBar
        search={search}
        status={status}
        approvalStatus={approvalStatus}
        serviceCategory={serviceCategory}
        city={city}
        rating={rating}
        cities={cities}
        categories={categories}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onApprovalStatusChange={setApprovalStatus}
        onServiceCategoryChange={setServiceCategory}
        onCityChange={setCity}
        onRatingChange={setRating}
        onClearFilters={clearFilters}
      />

      {/* 4. Provider Data Table (Desktop + Mobile) */}
      <ProviderTable
        providers={providers}
        sort={sort}
        sortDirection={sortDirection}
        onSortChange={setSort}
        onEditProvider={(p) => setEditingProvider(p)}
        onReviewApproval={(p) => setReviewingProvider(p)}
        onChangeStatus={(p) => setStatusProvider(p)}
        isLoading={isLoading}
      />

      {/* 5. Pagination & Page Size */}
      <ProviderPagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* 6. Edit Provider Modal */}
      <ProviderEditModal
        isOpen={!!editingProvider}
        provider={editingProvider}
        onClose={() => setEditingProvider(null)}
        onSave={updateProvider}
      />

      {/* 7. Verification Review Modal */}
      <ProviderApprovalModal
        isOpen={!!reviewingProvider}
        provider={reviewingProvider}
        onClose={() => setReviewingProvider(null)}
        onConfirmApproval={updateProviderApproval}
      />

      {/* 8. Operational Status Modal */}
      <ProviderStatusModal
        isOpen={!!statusProvider}
        provider={statusProvider}
        onClose={() => setStatusProvider(null)}
        onConfirmStatus={updateProviderStatus}
      />
    </div>
  );
}
