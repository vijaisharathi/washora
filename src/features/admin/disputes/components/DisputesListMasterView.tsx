"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAdminDisputesList } from "../../hooks/useAdminDisputes";
import { Dispute, DisputeStatus } from "@/types/admin/support";
import { DisputesSummaryCards } from "./DisputesSummaryCards";
import { DisputesSearchFilterBar } from "./DisputesSearchFilterBar";
import { DisputesTable } from "./DisputesTable";
import { DisputesPagination } from "./DisputesPagination";
import { AssignDisputeModal } from "./modals/AssignDisputeModal";
import { ChangeDisputeStatusModal } from "./modals/ChangeDisputeStatusModal";
import { RecordDecisionModal } from "./modals/RecordDecisionModal";

export function DisputesListMasterView() {
  const {
    loading,
    error,
    summary,
    disputes,
    total,
    totalPages,
    page,
    pageSize,
    search,
    status,
    type,
    priority,
    raisedBy,
    assignedState,
    datePreset,
    sort,
    sortDirection,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setType,
    setPriority,
    setRaisedBy,
    setAssignedState,
    setDatePreset,
    setSort,
    setSortDirection,
    refetch,
    updateStatus,
    assignDispute,
    recordDecision,
  } = useAdminDisputesList();

  // Modals state
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const handleAssignClick = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsAssignModalOpen(true);
  };

  const handleStatusClick = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsStatusModalOpen(true);
  };

  const handleSelectStatusTransition = (newStatus: DisputeStatus) => {
    if (!selectedDispute) return;
    if (newStatus === "Decision Made") {
      setIsDecisionModalOpen(true);
    } else {
      updateStatus(selectedDispute.id, newStatus);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setPriority("all");
    setRaisedBy("all");
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
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              Dispute Resolution Center
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant">
            Investigate customer, merchant, and courier dispute claims, review evidence, and record formal decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Refresh Dispute Records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <DisputesSummaryCards summary={summary} loading={loading} />

      {/* Search & Filter Bar */}
      <DisputesSearchFilterBar
        search={search}
        status={status}
        type={type}
        priority={priority}
        raisedBy={raisedBy}
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
        onTypeChange={(val) => {
          setType(val);
          setPage(1);
        }}
        onPriorityChange={(val) => {
          setPriority(val);
          setPage(1);
        }}
        onRaisedByChange={(val) => {
          setRaisedBy(val);
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

      {/* Disputes Table */}
      <DisputesTable
        disputes={disputes}
        loading={loading}
        onAssignClick={handleAssignClick}
        onStatusClick={handleStatusClick}
      />

      {/* Pagination */}
      <DisputesPagination
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
      <AssignDisputeModal
        isOpen={isAssignModalOpen}
        dispute={selectedDispute}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={assignDispute}
      />

      <ChangeDisputeStatusModal
        isOpen={isStatusModalOpen}
        dispute={selectedDispute}
        onClose={() => setIsStatusModalOpen(false)}
        onSelectStatus={handleSelectStatusTransition}
      />

      <RecordDecisionModal
        isOpen={isDecisionModalOpen}
        dispute={selectedDispute}
        onClose={() => setIsDecisionModalOpen(false)}
        onRecordDecision={async (outcome, res) => {
          if (selectedDispute) {
            await recordDecision(selectedDispute.id, outcome, res);
          }
        }}
      />
    </div>
  );
}
