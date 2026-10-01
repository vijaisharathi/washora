"use client";

import React, { useState } from "react";
import { useAdminOperations } from "@/features/admin/hooks/useAdminOperations";
import { OperationsHeader } from "./OperationsHeader";
import { OperationsSummaryCards } from "./OperationsSummaryCards";
import { OperationsSearchFilterBar } from "./OperationsSearchFilterBar";
import { OperationsTable } from "./OperationsTable";
import { OperationsPagination } from "./OperationsPagination";
import { AssignProviderModal } from "./modals/AssignProviderModal";
import { AssignDeliveryPartnerModal } from "./modals/AssignDeliveryPartnerModal";
import { ReassignModal } from "./modals/ReassignModal";
import { UnassignModal } from "./modals/UnassignModal";
import { OperationalBookingView } from "@/types/admin/operations";
import { CheckCircle2 } from "lucide-react";

export function OperationsListMasterView() {
  const ops = useAdminOperations();

  // Modal states
  const [modalType, setModalType] = useState<
    | "assign_provider"
    | "reassign_provider"
    | "unassign_provider"
    | "assign_delivery"
    | "reassign_delivery"
    | "unassign_delivery"
    | null
  >(null);
  const [selectedBookingView, setSelectedBookingView] = useState<OperationalBookingView | null>(
    null
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Action handlers
  const handleOpenAssignProvider = (item: OperationalBookingView) => {
    setSelectedBookingView(item);
    setModalType("assign_provider");
  };

  const handleOpenReassignProvider = (item: OperationalBookingView) => {
    setSelectedBookingView(item);
    setModalType("reassign_provider");
  };

  const handleOpenUnassignProvider = (item: OperationalBookingView) => {
    setSelectedBookingView(item);
    setModalType("unassign_provider");
  };

  const handleOpenAssignDelivery = (item: OperationalBookingView) => {
    setSelectedBookingView(item);
    setModalType("assign_delivery");
  };

  const handleOpenReassignDelivery = (item: OperationalBookingView) => {
    setSelectedBookingView(item);
    setModalType("reassign_delivery");
  };

  const handleOpenUnassignDelivery = (item: OperationalBookingView) => {
    setSelectedBookingView(item);
    setModalType("unassign_delivery");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedBookingView(null);
  };

  // Confirm callbacks
  const handleConfirmAssignProvider = async (
    bookingId: string,
    providerId: string,
    notes?: string
  ) => {
    await ops.assignProvider(bookingId, providerId, notes);
    showFeedback(`Provider assigned successfully to booking #${bookingId}`);
  };

  const handleConfirmReassignProvider = async (
    bookingId: string,
    newProviderId: string,
    notes?: string
  ) => {
    await ops.reassignProvider(bookingId, newProviderId, notes);
    showFeedback(`Provider reassigned successfully for booking #${bookingId}`);
  };

  const handleConfirmUnassignProvider = async (bookingId: string, notes?: string) => {
    await ops.unassignProvider(bookingId, notes);
    showFeedback(`Provider unassigned from booking #${bookingId}`);
  };

  const handleConfirmAssignDelivery = async (
    bookingId: string,
    partnerId: string,
    notes?: string
  ) => {
    await ops.assignDeliveryPartner(bookingId, partnerId, notes);
    showFeedback(`Delivery valet assigned successfully to booking #${bookingId}`);
  };

  const handleConfirmReassignDelivery = async (
    bookingId: string,
    newPartnerId: string,
    notes?: string
  ) => {
    await ops.reassignDeliveryPartner(bookingId, newPartnerId, notes);
    showFeedback(`Delivery valet reassigned successfully for booking #${bookingId}`);
  };

  const handleConfirmUnassignDelivery = async (bookingId: string, notes?: string) => {
    await ops.unassignDeliveryPartner(bookingId, notes);
    showFeedback(`Delivery valet unassigned from booking #${bookingId}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header with Title, Org badge, Refresh and Queue Tabs */}
      <OperationsHeader
        organizationId={ops.data?.items[0]?.booking.organizationId || "ORG-0001"}
        activeTab={ops.queueTab}
        onTabChange={ops.setQueueTab}
        metrics={ops.metrics}
      />

      {/* Summary KPI Cards */}
      <OperationsSummaryCards
        metrics={ops.metrics}
        isLoading={ops.isLoading}
      />

      {/* Search & Multifaceted Filter Bar */}
      <OperationsSearchFilterBar
        search={ops.search}
        onSearchChange={ops.setSearch}
        assignmentStatus={ops.assignmentStatus}
        onAssignmentStatusChange={ops.setAssignmentStatus}
        bookingStatus={ops.bookingStatus}
        onBookingStatusChange={ops.setBookingStatus}
        category={ops.category}
        onCategoryChange={ops.setCategory}
        city={ops.city}
        onCityChange={ops.setCity}
        providerId={ops.providerId}
        onProviderChange={ops.setProviderId}
        deliveryPartnerId={ops.deliveryPartnerId}
        onDeliveryPartnerChange={ops.setDeliveryPartnerId}
        date={ops.date}
        onDateChange={ops.setDate}
        onClearFilters={ops.clearFilters}
        availableCategories={ops.availableCategories}
        availableCities={ops.availableCities}
        availableProviders={ops.availableProviders}
        availableDeliveryPartners={ops.availableDeliveryPartners}
      />

      {/* Table & Mobile Cards */}
      <OperationsTable
        items={ops.items}
        isLoading={ops.isLoading}
        searchQuery={ops.search}
        sort={ops.sort}
        sortDirection={ops.sortDirection}
        onSort={(field) => {
          if (ops.sort === field) {
            ops.setSort(field, ops.sortDirection === "asc" ? "desc" : "asc");
          } else {
            ops.setSort(field, "asc");
          }
        }}
        onAssignProvider={handleOpenAssignProvider}
        onReassignProvider={handleOpenReassignProvider}
        onUnassignProvider={handleOpenUnassignProvider}
        onAssignDeliveryPartner={handleOpenAssignDelivery}
        onReassignDeliveryPartner={handleOpenReassignDelivery}
        onUnassignDeliveryPartner={handleOpenUnassignDelivery}
      />

      {/* Pagination */}
      {ops.data && (
        <OperationsPagination
          page={ops.page}
          pageSize={ops.pageSize}
          total={ops.data.total}
          totalPages={ops.data.totalPages}
          onPageChange={ops.setPage}
          onPageSizeChange={ops.setPageSize}
        />
      )}

      {/* Modals */}
      <AssignProviderModal
        isOpen={modalType === "assign_provider"}
        onClose={closeModal}
        bookingView={selectedBookingView}
        onConfirm={handleConfirmAssignProvider}
      />

      <AssignDeliveryPartnerModal
        isOpen={modalType === "assign_delivery"}
        onClose={closeModal}
        bookingView={selectedBookingView}
        onConfirm={handleConfirmAssignDelivery}
      />

      <ReassignModal
        isOpen={modalType === "reassign_provider" || modalType === "reassign_delivery"}
        onClose={closeModal}
        bookingView={selectedBookingView}
        targetType={modalType === "reassign_provider" ? "provider" : "delivery_partner"}
        onConfirm={
          modalType === "reassign_provider"
            ? handleConfirmReassignProvider
            : handleConfirmReassignDelivery
        }
      />

      <UnassignModal
        isOpen={modalType === "unassign_provider" || modalType === "unassign_delivery"}
        onClose={closeModal}
        bookingView={selectedBookingView}
        targetType={modalType === "unassign_provider" ? "provider" : "delivery_partner"}
        onConfirm={
          modalType === "unassign_provider"
            ? handleConfirmUnassignProvider
            : handleConfirmUnassignDelivery
        }
      />
    </div>
  );
}
