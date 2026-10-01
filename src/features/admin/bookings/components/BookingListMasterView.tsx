"use client";

import React, { useState } from "react";
import { useAdminBookings } from "../../hooks/useAdminBookings";
import { useAdminSession } from "../../hooks/useAdminSession";
import { BookingOrder, BookingStatus } from "@/types/admin";
import { BookingManagementHeader } from "./BookingManagementHeader";
import { BookingSummaryWidgets } from "./BookingSummaryWidgets";
import { BookingSearchFilterBar } from "./BookingSearchFilterBar";
import { BookingTable } from "./BookingTable";
import { BookingPagination } from "./BookingPagination";
import { BookingEditModal } from "./BookingEditModal";
import { BookingStatusActionDialog } from "./BookingStatusActionDialog";
import { CheckCircle2 } from "lucide-react";

export function BookingListMasterView() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const {
    data,
    metrics,
    availableCities,
    availableCategories,
    availableProviders,
    availableCustomers,
    isLoading,
    search,
    status,
    date,
    serviceCategory,
    city,
    providerId,
    customerId,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setDate,
    setServiceCategory,
    setCity,
    setProviderId,
    setCustomerId,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    updateBooking,
    updateBookingStatus,
  } = useAdminBookings();

  // Modal states
  const [editingBooking, setEditingBooking] = useState<BookingOrder | null>(null);
  const [statusBooking, setStatusBooking] = useState<BookingOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bookings = data?.bookings || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <BookingManagementHeader
        totalCount={metrics?.total || total}
        organizationId={organizationId}
      />

      {/* 2. Bento KPI Summary Widgets */}
      <BookingSummaryWidgets metrics={metrics} isLoading={isLoading} />

      {/* 3. Search & Filter Bar */}
      <BookingSearchFilterBar
        search={search}
        status={status}
        date={date}
        serviceCategory={serviceCategory}
        city={city}
        providerId={providerId}
        customerId={customerId}
        availableCities={availableCities}
        availableCategories={availableCategories}
        availableProviders={availableProviders}
        availableCustomers={availableCustomers}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateChange={setDate}
        onCategoryChange={setServiceCategory}
        onCityChange={setCity}
        onProviderChange={setProviderId}
        onCustomerChange={setCustomerId}
        onClearFilters={clearFilters}
      />

      {/* 4. Booking Table (Desktop + Mobile) */}
      <BookingTable
        bookings={bookings}
        sort={sort}
        sortDirection={sortDirection}
        onSortChange={setSort}
        onEditBooking={(b) => setEditingBooking(b)}
        onUpdateStatus={(b) => setStatusBooking(b)}
        isLoading={isLoading}
      />

      {/* 5. Pagination */}
      <BookingPagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* 6. Edit Booking Modal */}
      {editingBooking && (
        <BookingEditModal
          isOpen={!!editingBooking}
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={async (id, payload) => {
            const updated = await updateBooking(id, payload);
            showToast(`Order ${updated.bookingNumber} details updated successfully.`);
            return updated;
          }}
        />
      )}

      {/* 7. Status Lifecycle Action Dialog */}
      {statusBooking && (
        <BookingStatusActionDialog
          isOpen={!!statusBooking}
          booking={statusBooking}
          onClose={() => setStatusBooking(null)}
          onConfirm={async (id, newStatus, reason) => {
            const updated = await updateBookingStatus(id, newStatus, reason);
            showToast(
              `Order ${updated.bookingNumber} transitioned to ${newStatus.toUpperCase()}.`
            );
            return updated;
          }}
        />
      )}

      {/* 8. Success Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-container-lowest border border-primary/40 rounded-xl shadow-2xl text-xs text-on-surface animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
