"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Clock, ChevronRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { SupportTicket } from "@/types/delivery-partner";

interface SupportTicketsListProps {
  tickets: SupportTicket[];
}

export function SupportTicketsList({ tickets }: SupportTicketsListProps) {
  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Open
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 animate-pulse">
            In Review
          </span>
        );
      case "RESOLVED":
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
          </span>
        );
      case "CLOSED":
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant/70 border border-outline-variant/30">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">My Support Tickets</h2>
            <p className="text-[11px] text-on-surface-variant">Active issues, queries, and resolution threads</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {tickets.length} Total
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface border border-outline-variant/20 space-y-2">
          <ShieldCheck className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
          <p className="text-xs font-bold text-on-surface">No Support Tickets Raised</p>
          <p className="text-[11px] text-on-surface-variant">
            Everything is running smoothly! If you encounter issues during your shift, tap &ldquo;Raise Support Ticket&rdquo; above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((tkt) => (
            <Link
              key={tkt.id}
              href={`/delivery-partner/support/requests/${tkt.id}`}
              className="block p-4 rounded-2xl bg-surface border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high transition-all space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-primary group-hover:underline">
                      #{tkt.ticketNumber}
                    </span>
                    {getStatusBadge(tkt.status)}
                    {tkt.priority === "URGENT" && (
                      <span className="text-[9px] uppercase font-bold text-error bg-error/15 px-1.5 py-0.2 rounded border border-error/30">
                        Urgent
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-on-surface truncate">
                    {tkt.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-on-surface-variant group-hover:text-primary">
                  <span className="text-[10px] font-mono">
                    {new Date(tkt.updatedAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/10">
                <span className="font-mono">
                  {tkt.relatedOrderId ? `Order #${tkt.relatedOrderId}` : "General Logistics"}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-primary/70" />
                  {tkt.messages.length} messages
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
