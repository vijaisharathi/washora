"use client";

import React from "react";
import Link from "next/link";
import { ProviderSupportTicket } from "@/types/provider/support";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface SupportTicketsListProps {
  tickets: ProviderSupportTicket[];
}

export function SupportTicketsList({ tickets }: SupportTicketsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-500/30";
      case "IN_PROGRESS":
        return "bg-purple-950/40 text-purple-300 border-purple-500/30";
      case "RESOLVED":
      case "CLOSED":
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700/40";
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`/provider/support/${ticket.id}`} className="block group">
          <ProviderCard
            variant="container"
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40 border-l-4 border-l-primary"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary font-bold">
                  {ticket.ticketNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
                <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                  {ticket.category}
                </span>
              </div>

              <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                {ticket.subject}
              </h4>
              <p className="text-xs text-on-surface-variant truncate">
                {ticket.description}
              </p>
            </div>

            <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-xs">
              <span className="text-on-surface-variant">{ticket.messages.length} message(s)</span>
              <span className="font-semibold text-primary flex items-center gap-1">
                <span>View Details</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </ProviderCard>
        </Link>
      ))}
    </div>
  );
}
