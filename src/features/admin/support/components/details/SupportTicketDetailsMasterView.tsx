"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LifeBuoy,
  UserCheck,
  UserX,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Flame,
  User,
  Store,
  Bike,
  Building2,
  CreditCard,
  Star,
  ExternalLink,
  MessageSquare,
  Send,
  Calendar,
  Layers,
} from "lucide-react";
import { useAdminSupportDetail } from "../../../hooks/useAdminSupport";
import {
  SupportStatus,
  SupportPriority,
  SupportRequesterType,
  AddSupportNoteSchema,
} from "@/types/admin/support";
import { AssignTicketModal } from "../modals/AssignTicketModal";
import { ChangeTicketStatusModal } from "../modals/ChangeTicketStatusModal";
import { ResolveTicketModal } from "../modals/ResolveTicketModal";
import { CloseTicketModal } from "../modals/CloseTicketModal";

interface SupportTicketDetailsMasterViewProps {
  ticketId: string;
}

export function SupportTicketDetailsMasterView({
  ticketId,
}: SupportTicketDetailsMasterViewProps) {
  const router = useRouter();
  const {
    loading,
    error,
    detail,
    assignees,
    refetch,
    updateStatus,
    updatePriority,
    assignTicket,
    unassignTicket,
    addNote,
  } = useAdminSupportDetail(ticketId);

  // Note form state
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        <div className="h-8 w-48 rounded bg-surface-container/50 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-surface-container/40 animate-pulse" />
          <div className="h-96 rounded-2xl bg-surface-container/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto text-center py-16">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-on-surface mb-1">
          {error || "Ticket Not Found"}
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          The requested support ticket does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Desk</span>
        </Link>
      </div>
    );
  }

  const { ticket, requester, assignedAgent, relatedRecords, notes, activities } = detail;
  const isTerminal = ticket.status === "Closed";

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = AddSupportNoteSchema.safeParse({ note: newNoteText.trim() });
    if (!result.success) {
      setNoteError(result.error.errors[0]?.message || "Invalid note format.");
      return;
    }

    setIsAddingNote(true);
    setNoteError(null);
    try {
      await addNote(newNoteText.trim());
      setNewNoteText("");
    } catch (err: any) {
      setNoteError(err?.message || "Failed to add internal note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const renderPriorityBadge = (priority: SupportPriority) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <Flame className="w-3.5 h-3.5" />
            <span>Urgent Priority</span>
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Priority</span>
          </span>
        );
      case "Normal":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/30">
            <span>Normal Priority</span>
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <span>Low Priority</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: SupportStatus) => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Open</span>
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </span>
        );
      case "Waiting for Response":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Waiting for Response</span>
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Closed</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/support"
            className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Back to Support Tickets"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                {ticket.ticketNumber}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                ({ticket.id})
              </span>
              {renderStatusBadge(ticket.status)}
              {renderPriorityBadge(ticket.priority)}
            </div>
            <h1 className="text-lg font-bold text-on-surface mt-0.5">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        {!isTerminal && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-xs font-medium text-on-surface inline-flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>{ticket.assignedTo ? "Reassign" : "Assign"}</span>
            </button>

            {ticket.status === "Open" && (
              <button
                type="button"
                onClick={() => updateStatus("In Progress")}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Working</span>
              </button>
            )}

            {ticket.status === "In Progress" && (
              <button
                type="button"
                onClick={() => updateStatus("Waiting for Response")}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Wait for Response</span>
              </button>
            )}

            {ticket.status === "Waiting for Response" && (
              <button
                type="button"
                onClick={() => updateStatus("In Progress")}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Resume Work</span>
              </button>
            )}

            {(ticket.status === "In Progress" || ticket.status === "Waiting for Response") && (
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCloseModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 border border-outline-variant/30 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Close Case</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Ticket Info, Related Records, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-primary" />
                <span>Ticket Details</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span>Category:</span>
                <span className="font-semibold text-on-surface px-2 py-0.5 rounded bg-surface-container/60 border border-outline-variant/30">
                  {ticket.category}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-on-surface-variant">
                Description / Problem Report:
              </span>
              <p className="text-xs text-on-surface leading-relaxed mt-1 whitespace-pre-wrap bg-surface-container/30 p-3.5 rounded-xl border border-outline-variant/20">
                {ticket.description}
              </p>
            </div>

            {/* Resolution Box if resolved/closed */}
            {ticket.resolution && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolution Recorded</span>
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  {ticket.resolution}
                </p>
                {ticket.resolvedAt && (
                  <p className="text-[10px] text-on-surface-variant font-mono pt-1">
                    Resolved at: {new Date(ticket.resolvedAt).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-on-surface-variant border-t border-outline-variant/20">
              <div>
                <span className="block text-[10px] uppercase font-bold text-on-surface-variant">
                  Created At
                </span>
                <span className="text-on-surface">
                  {new Date(ticket.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-on-surface-variant">
                  Last Updated
                </span>
                <span className="text-on-surface">
                  {new Date(ticket.updatedAt).toLocaleString("en-IN")}
                </span>
              </div>
              {ticket.closedAt && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-on-surface-variant">
                    Closed At
                  </span>
                  <span className="text-on-surface">
                    {new Date(ticket.closedAt).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Related Records Card */}
          {relatedRecords && (relatedRecords.booking || relatedRecords.payment || relatedRecords.review) && (
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>Related Platform Records</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Booking */}
                {relatedRecords.booking && (
                  <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Booking Record
                      </span>
                      <Link
                        href={relatedRecords.booking.route}
                        className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="font-mono text-xs font-bold text-on-surface">
                      {relatedRecords.booking.bookingNumber} ({relatedRecords.booking.id})
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {relatedRecords.booking.serviceName} • Status: <span className="font-semibold text-on-surface">{relatedRecords.booking.status}</span>
                    </div>
                  </div>
                )}

                {/* Payment */}
                {relatedRecords.payment && (
                  <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Payment Record
                      </span>
                      <span className="text-xs font-bold font-mono text-on-surface">
                        ₹{relatedRecords.payment.amount}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-on-surface">
                      {relatedRecords.payment.id}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Method: {relatedRecords.payment.paymentMethod} • Status: <span className="font-semibold text-on-surface">{relatedRecords.payment.status}</span>
                    </div>
                  </div>
                )}

                {/* Review */}
                {relatedRecords.review && (
                  <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Customer Review ({relatedRecords.review.rating} ★)</span>
                      </span>
                      <Link
                        href={relatedRecords.review.route}
                        className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>Moderate Review</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-on-surface italic">
                      &ldquo;{relatedRecords.review.comment}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Internal Notes Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Internal Operations Notes</span>
              </h2>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {notes.length} notes (Admin only)
              </span>
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => {
                  setNewNoteText(e.target.value);
                  if (noteError) setNoteError(null);
                }}
                placeholder="Add an internal note for operations and shift handoffs (5–500 chars)..."
                className="w-full p-3 text-xs rounded-xl bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
              />

              {noteError && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {noteError}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {newNoteText.length} / 500 characters
                </span>
                <button
                  type="submit"
                  disabled={isAddingNote || newNoteText.trim().length < 5}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{isAddingNote ? "Saving..." : "Add Note"}</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-2">
              {notes.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-2 text-center">
                  No internal notes yet.
                </p>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/20 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-on-surface">
                        {n.createdByName}
                      </span>
                      <span className="text-on-surface-variant font-mono">
                        {new Date(n.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {n.note}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Requester, Assignee, Activity Timeline */}
        <div className="space-y-6">
          {/* Requester Profile Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <User className="w-4 h-4 text-primary" />
              <span>Requester Profile</span>
            </h2>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                  Name / Identifier
                </span>
                <div className="text-xs font-semibold text-on-surface">
                  {requester.name}
                </div>
                <div className="text-[11px] font-mono text-primary">
                  ID: {requester.id}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                  Account Type
                </span>
                <div className="text-xs text-on-surface">
                  {requester.type}
                </div>
              </div>

              {requester.email && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                    Email
                  </span>
                  <div className="text-xs font-mono text-on-surface">
                    {requester.email}
                  </div>
                </div>
              )}

              {requester.phone && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                    Phone
                  </span>
                  <div className="text-xs font-mono text-on-surface">
                    {requester.phone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Agent Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Assigned Agent</span>
              </h2>
              {!isTerminal && assignedAgent && (
                <button
                  type="button"
                  onClick={unassignTicket}
                  className="text-[11px] text-rose-500 hover:underline font-medium"
                >
                  Unassign
                </button>
              )}
            </div>

            {assignedAgent ? (
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {assignedAgent.name}
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {assignedAgent.role} • ID: {assignedAgent.id}
                  </div>
                </div>
                {assignedAgent.assignedAt && (
                  <div className="text-[10px] font-mono text-on-surface-variant">
                    Assigned: {new Date(assignedAgent.assignedAt).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-on-surface-variant italic mb-2">
                  No agent currently assigned to this ticket.
                </p>
                {!isTerminal && (
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                  >
                    Assign Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity History Timeline */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span>Activity History</span>
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic text-center py-2">
                  No activity recorded yet.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 text-xs pb-2 border-b border-outline-variant/10 last:border-none"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 text-[10px] text-on-surface-variant font-mono">
                        <span className="font-bold text-on-surface">{act.type}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        By {act.performedByName}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignTicketModal
        isOpen={isAssignModalOpen}
        ticket={ticket}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={assignTicket}
      />

      <ChangeTicketStatusModal
        isOpen={isStatusModalOpen}
        ticket={ticket}
        onClose={() => setIsStatusModalOpen(false)}
        onSelectStatus={(st) => {
          if (st === "Resolved") setIsResolveModalOpen(true);
          else if (st === "Closed") setIsCloseModalOpen(true);
          else updateStatus(st);
        }}
      />

      <ResolveTicketModal
        isOpen={isResolveModalOpen}
        ticket={ticket}
        onClose={() => setIsResolveModalOpen(false)}
        onResolve={async (tId, res) => {
          await updateStatus("Resolved", res);
        }}
      />

      <CloseTicketModal
        isOpen={isCloseModalOpen}
        ticket={ticket}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirmClose={async () => {
          await updateStatus("Closed");
        }}
      />
    </div>
  );
}
