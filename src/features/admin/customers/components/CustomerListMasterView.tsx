"use client";

import React, { useState } from "react";
import { useAdminCustomers } from "@/features/admin/hooks/useAdminCustomers";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { CustomerManagementHeader } from "./CustomerManagementHeader";
import { CustomerSummaryWidgets } from "./CustomerSummaryWidgets";
import { CustomerSearchFilterBar } from "./CustomerSearchFilterBar";
import { CustomerTable } from "./CustomerTable";
import { CustomerPagination } from "./CustomerPagination";
import { CustomerEditModal } from "./CustomerEditModal";
import { CustomerStatusModal } from "./CustomerStatusModal";
import { Customer } from "@/types/admin";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerListMasterView() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const {
    data,
    metrics,
    cities,
    isLoading,
    isRefreshing,
    error,
    search,
    status,
    city,
    bookingActivity,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setCity,
    setBookingActivity,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh,
    updateCustomer,
    updateCustomerStatus,
  } = useAdminCustomers();

  // Modals state
  const [activeEditCustomer, setActiveEditCustomer] = useState<Customer | null>(null);
  const [activeStatusCustomer, setActiveStatusCustomer] = useState<Customer | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <CustomerManagementHeader
        totalCount={metrics?.totalCustomers || data?.total || 0}
        organizationId={organizationId}
      />

      {/* Error state if service fails */}
      {error && (
        <div className="p-4 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refresh()}
            className="text-xs h-7 border-critical/40 text-critical hover:bg-critical/20 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* 2. KPI Summary Widgets */}
      <CustomerSummaryWidgets metrics={metrics} isLoading={isLoading} />

      {/* 3. Search and Filters Toolbar */}
      <CustomerSearchFilterBar
        search={search}
        status={status}
        city={city}
        bookingActivity={bookingActivity}
        cities={cities}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCityChange={setCity}
        onBookingActivityChange={setBookingActivity}
        onClearFilters={clearFilters}
      />

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="flex items-center gap-2 text-xs text-primary font-medium px-1">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Synchronizing customer directory...</span>
        </div>
      )}

      {/* 4. Customer Table (Desktop & Mobile) */}
      <CustomerTable
        customers={data?.items || []}
        sort={sort}
        sortDirection={sortDirection}
        onSortChange={setSort}
        onEditCustomer={(customer) => setActiveEditCustomer(customer)}
        onChangeStatus={(customer) => setActiveStatusCustomer(customer)}
        isLoading={isLoading}
      />

      {/* 5. Pagination */}
      {data && data.total > 0 && (
        <CustomerPagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Global Modals */}
      <CustomerEditModal
        isOpen={Boolean(activeEditCustomer)}
        customer={activeEditCustomer}
        onClose={() => setActiveEditCustomer(null)}
        onSave={updateCustomer}
      />

      <CustomerStatusModal
        isOpen={Boolean(activeStatusCustomer)}
        customer={activeStatusCustomer}
        onClose={() => setActiveStatusCustomer(null)}
        onConfirmStatus={updateCustomerStatus}
      />
    </div>
  );
}
