"use client";

import React, { useState } from "react";
import { useAdminCommunications } from "../../hooks/useAdminCommunications";
import { CommunicationsHeader } from "./CommunicationsHeader";
import { CommunicationsSearchFilterBar } from "./CommunicationsSearchFilterBar";
import { CommunicationsTable } from "./CommunicationsTable";
import { CommunicationsPagination } from "./CommunicationsPagination";
import { ArchiveMessageModal } from "./modals/ArchiveMessageModal";
import { CommunicationMessage } from "@/types/admin/notification";

export function CommunicationsListMasterView() {
  const {
    organizationId,
    loading,
    error,
    result,
    search,
    setSearch,
    status,
    setStatus,
    recipientType,
    setRecipientType,
    channel,
    setChannel,
    datePreset,
    setDatePreset,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
    refetch,
    archiveMessage,
  } = useAdminCommunications();

  const [archiveTarget, setArchiveTarget] = useState<CommunicationMessage | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const handleArchiveClick = (msg: CommunicationMessage) => {
    setArchiveTarget(msg);
    setIsArchiveModalOpen(true);
  };

  const isFiltered =
    Boolean(search) ||
    status !== "all" ||
    recipientType !== "all" ||
    channel !== "all" ||
    datePreset !== "all";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <CommunicationsHeader
        organizationId={organizationId}
        totalMessages={result.total}
        draftCount={result.draftCount}
        onRefresh={refetch}
        isLoading={loading}
      />

      {/* Search & Filters */}
      <CommunicationsSearchFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        recipientType={recipientType}
        onRecipientTypeChange={setRecipientType}
        channel={channel}
        onChannelChange={setChannel}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
          {error}
        </div>
      )}

      {/* Table */}
      <CommunicationsTable
        messages={result.messages}
        isLoading={loading}
        onArchiveClick={handleArchiveClick}
        onResetFilters={resetFilters}
      />

      {/* Pagination */}
      <CommunicationsPagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        totalPages={result.totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Archive Modal */}
      <ArchiveMessageModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setArchiveTarget(null);
        }}
        message={archiveTarget}
        onConfirm={async () => {
          if (archiveTarget) {
            await archiveMessage(archiveTarget.id);
          }
        }}
      />
    </div>
  );
}
