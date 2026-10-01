"use client";

import React, { useState } from "react";
import { useProviderSupport } from "@/features/provider/support/hooks/useProviderSupport";
import {
  ProviderSupportCategory,
  CreateSupportTicketPayload,
} from "@/types/provider/support";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { SupportSearchBar } from "./SupportSearchBar";
import { SupportFaqSection } from "./SupportFaqSection";
import { SupportTicketsList } from "./SupportTicketsList";
import { CreateTicketModal } from "./CreateTicketModal";

export function ProviderSupportCenterView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProviderSupportCategory | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { faqs, isLoadingFaqs, tickets, isLoadingTickets, createTicket, isCreatingTicket } =
    useProviderSupport(selectedCategory, searchQuery);

  if (isLoadingFaqs || isLoadingTickets) {
    return <ProviderLoadingState message="Loading Studio Knowledge Base &amp; Support Requests..." />;
  }

  const handleCreateSubmit = async (payload: CreateSupportTicketPayload) => {
    await createTicket(payload);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <SupportSearchBar value={searchQuery} onChange={setSearchQuery} />

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add_comment</span>
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Grid: Left (FAQs) | Right (Active Tickets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Frequently Asked Questions</h3>
            <span className="text-xs text-on-surface-variant font-mono">{faqs.length} article(s)</span>
          </div>
          <SupportFaqSection
            faqs={faqs}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Right: Active Support Requests (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Your Support Requests</h3>
            <span className="text-xs text-on-surface-variant font-mono">{tickets.length} ticket(s)</span>
          </div>

          {tickets.length === 0 ? (
            <div className="p-6 rounded-2xl bg-surface-container border border-white/5 text-center text-xs text-on-surface-variant">
              No active support requests.
            </div>
          ) : (
            <SupportTicketsList tickets={tickets} />
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreatingTicket}
      />
    </div>
  );
}
