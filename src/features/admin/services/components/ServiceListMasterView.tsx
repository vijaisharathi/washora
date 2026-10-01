"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminServices } from "../../hooks/useAdminServices";
import { useAdminSession } from "../../hooks/useAdminSession";
import { Service } from "@/types/admin/serviceCatalog";
import { ServiceCatalogHeader } from "./ServiceCatalogHeader";
import { ServiceSummaryWidgets } from "./ServiceSummaryWidgets";
import { ServiceSearchFilterBar } from "./ServiceSearchFilterBar";
import { ServiceTable } from "./ServiceTable";
import { ServicePagination } from "./ServicePagination";
import { ServiceStatusDialog } from "./ServiceStatusDialog";
import { CheckCircle2 } from "lucide-react";

export function ServiceListMasterView() {
  const router = useRouter();
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const {
    data,
    metrics,
    isLoading,
    search,
    status,
    category,
    priceRange,
    duration,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setCategory,
    setPriceRange,
    setDuration,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    updateServiceStatus,
  } = useAdminServices();

  // Status Dialog state
  const [statusService, setStatusService] = useState<Service | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const services = data?.services || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEditService = (service: Service) => {
    router.push(`/admin/services/${service.id}/edit`);
  };

  const handleStatusConfirm = async (
    serviceId: string,
    newStatus: import("@/types/admin/serviceCatalog").ServiceStatus,
    reason?: string
  ) => {
    const updated = await updateServiceStatus(serviceId, newStatus, reason);
    showToast(`Service ${updated.name} (${updated.id}) marked as ${newStatus}.`);
    return updated;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <ServiceCatalogHeader
        totalCount={metrics?.total || total}
        organizationId={organizationId}
      />

      {/* 2. Bento KPI Summary Widgets */}
      <ServiceSummaryWidgets metrics={metrics} isLoading={isLoading} />

      {/* 3. Search & Filter Bar */}
      <ServiceSearchFilterBar
        search={search}
        status={status}
        category={category}
        priceRange={priceRange}
        duration={duration}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onPriceRangeChange={setPriceRange}
        onDurationChange={setDuration}
        onClearFilters={clearFilters}
      />

      {/* 4. Service Table (Desktop + Mobile) */}
      <ServiceTable
        services={services}
        sort={sort}
        sortDirection={sortDirection}
        onSortChange={(field) => {
          if (sort === field) {
            setSort(field, sortDirection === "asc" ? "desc" : "asc");
          } else {
            setSort(field, "asc");
          }
        }}
        onEditService={handleEditService}
        onUpdateStatus={(service) => setStatusService(service)}
        isLoading={isLoading}
      />

      {/* 5. Pagination */}
      <ServicePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* 6. Status Action Confirmation Dialog */}
      <ServiceStatusDialog
        isOpen={!!statusService}
        service={statusService}
        onClose={() => setStatusService(null)}
        onConfirm={handleStatusConfirm}
      />

      {/* 7. Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-container-highest border border-primary/40 rounded-xl shadow-xl text-xs text-on-surface font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
