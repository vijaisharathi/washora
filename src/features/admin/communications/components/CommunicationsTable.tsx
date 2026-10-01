"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Eye,
  FileEdit,
  Archive,
  ExternalLink,
  Users,
  RotateCcw,
  CheckCircle,
  Clock,
  ArchiveRestore,
} from "lucide-react";
import {
  CommunicationMessage,
  CommunicationStatus,
} from "@/types/admin/notification";

interface CommunicationsTableProps {
  messages: CommunicationMessage[];
  isLoading?: boolean;
  onArchiveClick: (msg: CommunicationMessage) => void;
  onResetFilters?: () => void;
}

export function CommunicationsTable({
  messages,
  isLoading,
  onArchiveClick,
  onResetFilters,
}: CommunicationsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-20 h-4 bg-surface-container-high rounded" />
            <div className="w-48 h-4 bg-surface-container-high rounded" />
            <div className="w-24 h-4 bg-surface-container-high rounded" />
            <div className="w-24 h-4 bg-surface-container-high rounded" />
            <div className="w-16 h-4 bg-surface-container-high rounded" />
            <div className="w-16 h-4 bg-surface-container-high rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">
          No Communication Records Found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
          No messages match your active search and filter criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  const renderStatusBadge = (status: CommunicationStatus) => {
    switch (status) {
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Sent
          </span>
        );
      case "Archived":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="py-3 px-4">Message ID & Date</th>
              <th className="py-3 px-4">Subject & Content</th>
              <th className="py-3 px-4">Recipient Type</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-xs text-on-surface">
            {messages.map((m) => {
              const formattedDate = new Date(m.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr
                  key={m.id}
                  className="hover:bg-surface-container-high/40 transition-colors"
                >
                  {/* Message ID & Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Link
                      href={`/admin/communications/${m.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{m.id}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </Link>
                    <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                      {formattedDate}
                    </div>
                  </td>

                  {/* Subject & Preview */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <Link
                      href={`/admin/communications/${m.id}`}
                      className="font-semibold text-xs text-on-surface hover:text-primary transition-colors block truncate"
                    >
                      {m.subject}
                    </Link>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                      {m.body}
                    </p>
                    {m.relatedBookingId && (
                      <span className="inline-block mt-1 font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-primary">
                        Booking #{m.relatedBookingId}
                      </span>
                    )}
                  </td>

                  {/* Recipient Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-on-surface-variant" />
                      <span className="font-medium text-on-surface">
                        {m.recipientType}
                      </span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                      {m.recipientIds.length} recipient{m.recipientIds.length === 1 ? "" : "s"}
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        m.channel === "Internal"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {m.channel}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(m.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/communications/${m.id}`}
                        className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                        title="View Message Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {m.status === "Draft" && (
                        <Link
                          href={`/admin/communications/new?draftId=${m.id}`}
                          className="p-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                          title="Edit Draft"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {m.status === "Sent" && (
                        <button
                          onClick={() => onArchiveClick(m)}
                          className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-slate-500/10 text-on-surface-variant hover:text-slate-300 transition-colors"
                          title="Archive Message"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
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
