"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProviderSupportTicket } from "@/features/provider/support/hooks/useProviderSupport";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface SupportTicketDetailViewProps {
  ticketId: string;
}

export function SupportTicketDetailView({ ticketId }: SupportTicketDetailViewProps) {
  const { ticket, isLoading, isError, addMessage, isAddingMessage, closeTicket, isClosingTicket } =
    useProviderSupportTicket(ticketId);

  const [replyText, setReplyText] = useState("");

  if (isLoading) {
    return <ProviderLoadingState message="Loading Support Ticket Thread..." />;
  }

  if (isError || !ticket) {
    return <ProviderErrorState title="Support ticket not found" />;
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await addMessage({ ticketId: ticket.id, messageText: replyText.trim() });
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* Back and Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/provider/support"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Help Center</span>
        </Link>

        {ticket.status !== "CLOSED" && (
          <button
            type="button"
            onClick={() => closeTicket(ticket.id)}
            disabled={isClosingTicket}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors self-start"
          >
            {isClosingTicket ? "Closing..." : "Close Ticket"}
          </button>
        )}
      </div>

      {/* Grid: Left Column (Ticket Meta) | Right Column (Communication Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <ProviderCard variant="container" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-on-surface">Ticket Summary</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  ticket.status === "OPEN"
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/40"
                }`}
              >
                {ticket.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-on-surface-variant block mb-0.5">Ticket ID</span>
                <span className="font-mono text-primary font-bold">{ticket.ticketNumber}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block mb-0.5">Subject</span>
                <span className="font-bold text-on-surface">{ticket.subject}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block mb-0.5">Category</span>
                <span className="text-on-surface font-medium">{ticket.category}</span>
              </div>
              {ticket.entityId && (
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Related ID</span>
                  <span className="font-mono text-on-surface">{ticket.entityId}</span>
                </div>
              )}
            </div>
          </ProviderCard>
        </div>

        {/* Right Column (8 cols - Conversation Thread) */}
        <div className="lg:col-span-8">
          <ProviderCard variant="container" className="flex flex-col h-[560px] overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-surface-container-low border-b border-white/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">forum</span>
              <h3 className="text-sm font-bold text-on-surface">Communication Log</h3>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-surface">
              {ticket.messages.map((msg) => {
                const isProvider = msg.senderRole === "PROVIDER";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                      isProvider ? "" : "ml-auto flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isProvider
                          ? "bg-surface-container-high border border-white/10 text-primary"
                          : "bg-primary text-on-primary"
                      }`}
                    >
                      {isProvider ? "You" : <span className="material-symbols-outlined text-[14px]">support_agent</span>}
                    </div>

                    <div className={`flex flex-col gap-1 ${isProvider ? "" : "items-end"}`}>
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                        <span className="font-bold text-on-surface">{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isProvider
                            ? "bg-surface-container-high rounded-tl-sm text-on-surface border border-white/5"
                            : "bg-primary/10 text-on-surface rounded-tr-sm border border-primary/20"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer */}
            {ticket.status !== "CLOSED" ? (
              <form onSubmit={handleSendReply} className="p-3 bg-surface-container-low border-t border-white/5">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to support..."
                    className="flex-1 bg-surface text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:border-primary outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isAddingMessage || !replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all flex items-center gap-1 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Send</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-surface-container-low border-t border-white/5 text-center text-xs text-on-surface-variant">
                This ticket is marked as resolved and closed.
              </div>
            )}
          </ProviderCard>
        </div>
      </div>
    </div>
  );
}
