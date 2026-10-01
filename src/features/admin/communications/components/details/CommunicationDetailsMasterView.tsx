"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  FileEdit,
  Archive,
  Send,
  Users,
  ExternalLink,
  Clock,
  CheckCircle,
  Building2,
  AlertTriangle,
  Layers,
  Store,
  Bike,
} from "lucide-react";
import { useAdminCommunicationDetails } from "@/features/admin/hooks/useAdminCommunications";
import { CommunicationStatus } from "@/types/admin/notification";
import { ArchiveMessageModal } from "../modals/ArchiveMessageModal";

interface CommunicationDetailsMasterViewProps {
  communicationId: string;
}

export function CommunicationDetailsMasterView({
  communicationId,
}: CommunicationDetailsMasterViewProps) {
  const router = useRouter();
  const {
    loading,
    error,
    data,
    archive,
  } = useAdminCommunicationDetails(communicationId);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="w-32 h-6 bg-surface-container-high rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-surface-container-high rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-surface-container-high rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl my-6">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-on-surface mb-1">
          Message Record Not Found
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
          {error || `Message ${communicationId} was not found in this organization.`}
        </p>
        <Link
          href="/admin/communications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Communications</span>
        </Link>
      </div>
    );
  }

  const { message, resolvedRecipients, relatedEntitySummary } = data;

  const renderStatusBadge = (status: CommunicationStatus) => {
    switch (status) {
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Draft Message
          </span>
        );
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Broadcast Sent
          </span>
        );
      case "Archived":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Archive className="w-3.5 h-3.5" />
            Archived Record
          </span>
        );
    }
  };

  const formattedCreated = new Date(message.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedSent = message.sentAt
    ? new Date(message.sentAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/communications"
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to communications"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-on-surface tracking-tight font-mono">
                {message.id}
              </h1>
              {renderStatusBadge(message.status)}
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {message.channel}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>Sender: {message.senderName || message.senderId}</span>
              <span>•</span>
              <span className="font-mono">Org: {message.organizationId}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {message.status === "Draft" && (
            <Link
              href={`/admin/communications/new?draftId=${message.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Edit & Send Draft</span>
            </Link>
          )}

          {message.status === "Sent" && (
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-xs font-medium text-slate-300 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Message Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="pb-3 border-b border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">
                Subject
              </span>
              <h2 className="text-base font-bold text-on-surface">
                {message.subject}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {message.body}
            </div>

            {/* Timestamps Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-surface-container/40 border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-0.5">
                  Created Date
                </span>
                <span className="font-mono text-on-surface">{formattedCreated}</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container/40 border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-0.5">
                  Broadcast Date
                </span>
                <span className="font-mono text-on-surface">
                  {formattedSent ? formattedSent : "Not yet sent (Draft)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recipients & Related Entity */}
        <div className="space-y-6">
          {/* Recipients List */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Recipients ({message.recipientType})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant">
                {resolvedRecipients.length} total
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {resolvedRecipients.map((r: { id: string; name: string; contactInfo?: string }) => (
                <div
                  key={r.id}
                  className="p-2 rounded bg-surface-container/50 border border-outline-variant/20 text-xs"
                >
                  <div className="font-semibold text-on-surface text-xs">
                    {r.name}
                  </div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    ID: {r.id} {r.contactInfo ? `• ${r.contactInfo}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Entity Context */}
          {relatedEntitySummary && (
            <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Related Entity
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
                  {relatedEntitySummary.type}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <p className="font-semibold text-on-surface">
                  {relatedEntitySummary.label}
                </p>
                {relatedEntitySummary.route && (
                  <Link
                    href={relatedEntitySummary.route}
                    className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline"
                  >
                    <span>View in {relatedEntitySummary.type} Directory</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Archive Modal */}
      <ArchiveMessageModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        message={message}
        onConfirm={async () => {
          await archive();
          router.push("/admin/communications");
        }}
      />
    </div>
  );
}
