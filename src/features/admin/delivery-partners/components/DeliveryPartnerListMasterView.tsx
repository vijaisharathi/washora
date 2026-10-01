"use client";

import React, { useState } from "react";
import { useAdminDeliveryPartners } from "../../hooks/useAdminDeliveryPartners";
import { useAdminSession } from "../../hooks/useAdminSession";
import { DeliveryPartner } from "@/types/admin";
import { DeliveryPartnerManagementHeader } from "./DeliveryPartnerManagementHeader";
import { DeliveryPartnerSummaryWidgets } from "./DeliveryPartnerSummaryWidgets";
import { DeliveryPartnerSearchFilterBar } from "./DeliveryPartnerSearchFilterBar";
import { DeliveryPartnerTable } from "./DeliveryPartnerTable";
import { DeliveryPartnerPagination } from "./DeliveryPartnerPagination";
import { DeliveryPartnerEditModal } from "./DeliveryPartnerEditModal";
import { DeliveryPartnerApprovalModal } from "./DeliveryPartnerApprovalModal";
import { DeliveryPartnerStatusModal } from "./DeliveryPartnerStatusModal";

export function DeliveryPartnerListMasterView() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const {
    data,
    metrics,
    cities,
    vehicleTypes,
    isLoading,
    search,
    status,
    approvalStatus,
    vehicleType,
    city,
    rating,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setApprovalStatus,
    setVehicleType,
    setCity,
    setRating,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    updateDeliveryPartner,
    updateDeliveryPartnerApproval,
    updateDeliveryPartnerStatus,
  } = useAdminDeliveryPartners();

  // Modal states
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [reviewingPartner, setReviewingPartner] = useState<DeliveryPartner | null>(null);
  const [statusPartner, setStatusPartner] = useState<DeliveryPartner | null>(null);

  const deliveryPartners = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <DeliveryPartnerManagementHeader
        totalCount={metrics?.totalPartners || total}
        organizationId={organizationId}
      />

      {/* 2. Stitch KPI Summary Widgets */}
      <DeliveryPartnerSummaryWidgets metrics={metrics} isLoading={isLoading} />

      {/* 3. Search & Filter Bar */}
      <DeliveryPartnerSearchFilterBar
        search={search}
        status={status}
        approvalStatus={approvalStatus}
        vehicleType={vehicleType}
        city={city}
        rating={rating}
        cities={cities}
        vehicleTypes={vehicleTypes}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onApprovalStatusChange={setApprovalStatus}
        onVehicleTypeChange={setVehicleType}
        onCityChange={setCity}
        onRatingChange={setRating}
        onClearFilters={clearFilters}
      />

      {/* 4. Delivery Partner Table (Desktop + Mobile) */}
      <DeliveryPartnerTable
        deliveryPartners={deliveryPartners}
        sort={sort}
        sortDirection={sortDirection}
        onSortChange={setSort}
        onEditPartner={(p) => setEditingPartner(p)}
        onReviewApproval={(p) => setReviewingPartner(p)}
        onChangeStatus={(p) => setStatusPartner(p)}
        isLoading={isLoading}
      />

      {/* 5. Pagination & Page Size */}
      <DeliveryPartnerPagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* 6. Edit Delivery Partner Modal */}
      <DeliveryPartnerEditModal
        isOpen={!!editingPartner}
        deliveryPartner={editingPartner}
        onClose={() => setEditingPartner(null)}
        onSave={updateDeliveryPartner}
      />

      {/* 7. Verification Review Modal */}
      <DeliveryPartnerApprovalModal
        isOpen={!!reviewingPartner}
        deliveryPartner={reviewingPartner}
        onClose={() => setReviewingPartner(null)}
        onConfirmApproval={updateDeliveryPartnerApproval}
      />

      {/* 8. Operational Status Modal */}
      <DeliveryPartnerStatusModal
        isOpen={!!statusPartner}
        deliveryPartner={statusPartner}
        onClose={() => setStatusPartner(null)}
        onConfirmStatus={updateDeliveryPartnerStatus}
      />
    </div>
  );
}
