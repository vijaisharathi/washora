"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAdminSupportList } from "../../hooks/useAdminSupport";
import { SupportTicket, SupportStatus } from "@/types/admin/support";
import { SupportSummaryCards } from "./SupportSummaryCards";
import { SupportSearchFilterBar } from "./SupportSearchFilterBar";
import { SupportTable } from "./SupportTable";
import { SupportPagination } from "./SupportPagination";
import { AssignTicketModal } from "./modals/AssignTicketModal";
import { ChangeTicketStatusModal } from "./modals/ChangeTicketStatusModal";
import { ResolveTicketModal } from "./modals/ResolveTicketModal";
import { CloseTicketModal } from "./modals/CloseTicketModal";

export function SupportListMasterView() {
  const {
    loading,
    error,
    summary,
    tickets,
    total,
    totalPages,
    page,
    pageSize,
    search,
    status,
    priority,
    category,
    requesterType,
    assignedState,
    datePreset,
    sort,
    sortDirection,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setPriority,
    setCategory,
    setRequesterType,
    setAssignedState,
    setDatePreset,
    setSort,
    setSortDirection,
    refetch,
    updateStatus,
    assignTicket,
  } = useAdminSupportList();

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const handleAssignClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsAssignModalOpen(true);
  };

  const handleStatusClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsStatusModalOpen(true);
  };

  const handleSelectStatusTransition = (newStatus: SupportStatus) => {
    if (!selectedTicket) return;
    if (newStatus === "Resolved") {
      setIsResolveModalOpen(true);
    } else if (newStatus === "Closed") {
      setIsCloseModalOpen(true);
    } else {
      updateStatus(selectedTicket.id, newStatus);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setRequesterType("all");
    setAssignedState("all");
    setDatePreset("all");
    setSort("updated_at");
    setSortDirection("desc");
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              Support Tickets Desk
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant">
            Manage customer, merchant, and delivery partner operational support inquiries and service escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Refresh Support Records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/support/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <SupportSummaryCards summary={summary} loading={loading} />

      {/* Search & Filter Bar */}
      <SupportSearchFilterBar
        search={search}
        status={status}
        priority={priority}
        category={category}
        requesterType={requesterType}
        assignedState={assignedState}
        datePreset={datePreset}
        sort={sort}
        sortDirection={sortDirection}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onPriorityChange={(val) => {
          setPriority(val);
          setPage(1);
        }}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        onRequesterTypeChange={(val) => {
          setRequesterType(val);
          setPage(1);
        }}
        onAssignedStateChange={(val) => {
          setAssignedState(val);
          setPage(1);
        }}
        onDatePresetChange={(val) => {
          setDatePreset(val);
          setPage(1);
        }}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
        onSortDirectionToggle={() => {
          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Tickets Table */}
      <SupportTable
        tickets={tickets}
        loading={loading}
        onAssignClick={handleAssignClick}
        onStatusClick={handleStatusClick}
      />

      {/* Pagination */}
      <SupportPagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />

      {/* Modals */}
      <AssignTicketModal
        isOpen={isAssignModalOpen}
        ticket={selectedTicket}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={assignTicket}
      />

      <ChangeTicketStatusModal
        isOpen={isStatusModalOpen}
        ticket={selectedTicket}
        onClose={() => setIsStatusModalOpen(false)}
        onSelectStatus={handleSelectStatusTransition}
      />

      <ResolveTicketModal
        isOpen={isResolveModalOpen}
        ticket={selectedTicket}
        onClose={() => setIsResolveModalOpen(false)}
        onResolve={async (ticketId, res) => {
          await updateStatus(ticketId, "Resolved", res);
        }}
      />

      <CloseTicketModal
        isOpen={isCloseModalOpen}
        ticket={selectedTicket}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirmClose={async (ticketId) => {
          await updateStatus(ticketId, "Closed");
        }}
      />
    </div>
  );
}
