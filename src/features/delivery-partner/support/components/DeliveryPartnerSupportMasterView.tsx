"use client";

import React, { useState } from "react";
import {
  useDeliveryPartnerSupportFaqs,
  useDeliveryPartnerSupportTickets,
  useDeliveryPartnerSupportActions,
} from "../hooks/useDeliveryPartnerSupport";
import { SupportHeroCard } from "./SupportHeroCard";
import { FaqAccordionSection } from "./FaqAccordionSection";
import { SupportTicketsList } from "./SupportTicketsList";
import { CreateTicketModal } from "./CreateTicketModal";

export function DeliveryPartnerSupportMasterView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { faqs, isLoading: isFaqsLoading } = useDeliveryPartnerSupportFaqs(searchQuery);
  const { tickets, isLoading: isTicketsLoading } = useDeliveryPartnerSupportTickets();
  const { createTicket, isCreating } = useDeliveryPartnerSupportActions();

  if (isFaqsLoading && isTicketsLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-44 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header & Emergency Hotline */}
      <SupportHeroCard onRaiseTicket={() => setIsModalOpen(true)} />

      {/* Support Tickets Section */}
      <SupportTicketsList tickets={tickets} />

      {/* FAQ Knowledgebase Section */}
      <FaqAccordionSection
        faqs={faqs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTicket}
        isSubmitting={isCreating}
      />
    </div>
  );
}
