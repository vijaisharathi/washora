import React from "react";
import Link from "next/link";
import {
  LifeBuoy,
  ExternalLink,
  UserCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  User,
  Store,
  Bike,
  Building2,
} from "lucide-react";
import {
  SupportTicket,
  SupportStatus,
  SupportPriority,
  SupportCategory,
  SupportRequesterType,
} from "@/types/admin/support";

interface SupportTableProps {
  tickets: SupportTicket[];
  loading?: boolean;
  onAssignClick: (ticket: SupportTicket) => void;
  onStatusClick: (ticket: SupportTicket) => void;
}

export function SupportTable({
  tickets,
  loading,
  onAssignClick,
  onStatusClick,
}: SupportTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
        <div className="p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-surface-container/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3">
          <LifeBuoy className="w-6 h-6 text-on-surface-variant" />
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">
          No support tickets found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
          No tickets match your search criteria or active filters. Try adjusting your search query or resetting filters.
        </p>
      </div>
    );
  }

  const renderPriorityBadge = (priority: SupportPriority) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <Flame className="w-3 h-3" />
            <span>Urgent</span>
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>High</span>
          </span>
        );
      case "Normal":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30">
            <span>Normal</span>
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <span>Low</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: SupportStatus) => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Open</span>
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      case "Waiting for Response":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <HelpCircle className="w-3 h-3" />
            <span>Waiting</span>
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <ShieldCheck className="w-3 h-3" />
            <span>Closed</span>
          </span>
        );
    }
  };

  const renderRequesterIcon = (type: SupportRequesterType) => {
    switch (type) {
      case "Customer":
        return <User className="w-3 h-3 text-blue-500" />;
      case "Provider":
        return <Store className="w-3 h-3 text-amber-500" />;
      case "Delivery Partner":
        return <Bike className="w-3 h-3 text-emerald-500" />;
      case "Admin":
      case "Operations":
        return <Building2 className="w-3 h-3 text-purple-500" />;
    }
  };

  return (
    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-on-surface">
          <thead className="bg-surface-container/60 border-b border-outline-variant/30 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Requester</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Related Booking</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {tickets.map((t) => {
              const formattedDate = new Date(t.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr
                  key={t.id}
                  className="hover:bg-surface-container/30 transition-colors group"
                >
                  {/* Ticket */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-primary">
                          {t.ticketNumber}
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          ({t.id})
                        </span>
                      </div>
                      <span className="text-xs font-medium text-on-surface truncate max-w-[220px] mt-0.5">
                        {t.subject}
                      </span>
                    </div>
                  </td>

                  {/* Requester */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {renderRequesterIcon(t.requesterType)}
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-on-surface">
                          {t.requesterId}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {t.requesterType}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container/60 border border-outline-variant/30 text-on-surface">
                      {t.category}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">{renderPriorityBadge(t.priority)}</td>

                  {/* Status */}
                  <td className="py-3 px-4">{renderStatusBadge(t.status)}</td>

                  {/* Related Booking */}
                  <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">
                    {t.bookingId ? (
                      <Link
                        href={`/admin/bookings/${t.bookingId}`}
                        className="text-primary hover:underline font-semibold"
                      >
                        {t.bookingId}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-4">
                    {t.assignedTo ? (
                      <span className="font-medium text-xs text-on-surface flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>{t.assignedTo}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant italic">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="py-3 px-4 text-[11px] text-on-surface-variant whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/support/${t.id}`}
                        className="p-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                        title="View Ticket Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>

                      {t.status !== "Resolved" && t.status !== "Closed" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onAssignClick(t)}
                            className="p-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Assign Case"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onStatusClick(t)}
                            className="p-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-amber-500 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Change Status"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Status</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
