"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Paperclip,
} from "lucide-react";
import { useDeliveryPartnerTicketDetail, useDeliveryPartnerSupportActions } from "../hooks/useDeliveryPartnerSupport";

interface SupportTicketDetailMasterViewProps {
  ticketId: string;
}

export function SupportTicketDetailMasterView({
  ticketId,
}: SupportTicketDetailMasterViewProps) {
  const { ticket, isLoading, isError, error, refetch } = useDeliveryPartnerTicketDetail(ticketId);
  const { replyTicket, isReplying } = useDeliveryPartnerSupportActions();
  const [replyText, setReplyText] = useState("");

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    try {
      await replyTicket({
        ticketId: ticket.id,
        message: replyText.trim(),
      });
      setReplyText("");
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-96 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Ticket Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error ? error.message : "The requested support ticket does not exist or is unauthorized."}
          </p>
        </div>
        <Link
          href="/delivery-partner/support"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Support Desk</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery-partner/support"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Desk</span>
        </Link>

        <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-bold">
          {ticket.status}
        </span>
      </div>

      {/* Main Ticket Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
                #{ticket.ticketNumber}
              </span>
              {ticket.relatedOrderId && (
                <span className="text-[10px] font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                  Order #{ticket.relatedOrderId}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight">
              {ticket.subject}
            </h1>
            <p className="text-xs text-on-surface-variant font-mono">
              Created: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border self-start sm:self-auto ${
              ticket.status === "RESOLVED"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : ticket.status === "IN_REVIEW"
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
            }`}
          >
            {ticket.status}
          </span>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Conversation Thread ({ticket.messages.length})
          </h2>

          <div className="space-y-3">
            {ticket.messages.map((msg) => {
              const isPartner = msg.senderType === "VALET_PARTNER";
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isPartner
                      ? "bg-surface/90 border-primary/25 ml-4 sm:ml-8"
                      : "bg-surface-container-high/90 border-outline-variant/30 mr-4 sm:mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isPartner
                            ? "bg-primary/20 text-primary"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {isPartner ? <User className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      </div>
                      <span className="font-bold text-on-surface">{msg.senderName}</span>
                      {!isPartner && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                          Staff
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-on-surface-variant">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {msg.attachmentUrl && (
                    <div className="pt-2 flex items-center gap-2 text-[11px] text-primary">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="font-mono underline">Attached Proof Document</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reply Box */}
        {ticket.status !== "CLOSED" && (
          <form onSubmit={handleSendReply} className="pt-4 border-t border-outline-variant/20 space-y-3">
            <label className="text-xs font-semibold text-on-surface-variant">
              Post Follow-up Message
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your response to the support dispatcher..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-surface border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={isReplying || !replyText.trim()}
                className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
              >
                {isReplying ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Reply</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
