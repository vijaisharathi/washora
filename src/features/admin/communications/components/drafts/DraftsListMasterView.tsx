"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileEdit,
  Trash2,
  Send,
  PlusCircle,
  Clock,
  Users,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useAdminDrafts } from "@/features/admin/hooks/useAdminCommunications";
import { CommunicationMessage } from "@/types/admin/notification";
import { DeleteDraftModal } from "../modals/DeleteDraftModal";

export function DraftsListMasterView() {
  const { loading, error, drafts, deleteDraft, refetch } = useAdminDrafts();
  const [deleteTarget, setDeleteTarget] = useState<CommunicationMessage | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (msg: CommunicationMessage) => {
    setDeleteTarget(msg);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="w-32 h-6 bg-surface-container-high rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
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
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <FileEdit className="w-4 h-4 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                Saved Message Drafts
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {drafts.length}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Unsent operational communication drafts created by your user profile.
            </p>
          </div>
        </div>

        <Link
          href="/admin/communications/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Draft</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
            <FileEdit className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-on-surface mb-1">
            No Message Drafts
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
            You do not have any unsent operational message drafts saved.
          </p>
          <Link
            href="/admin/communications/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Compose Message</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((d: CommunicationMessage) => {
            const formattedDate = new Date(d.updatedAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-on-surface-variant">
                      {d.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">
                      Draft
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                      {d.recipientType} ({d.recipientIds.length})
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono sm:ml-auto">
                      Saved: {formattedDate}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-on-surface truncate">
                    {d.subject || "Untitled Draft"}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                    {d.body || "No message body written..."}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 justify-end">
                  <Link
                    href={`/admin/communications/new?draftId=${d.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Continue Editing</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteClick(d)}
                    className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteDraftModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        message={deleteTarget}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteDraft(deleteTarget.id);
          }
        }}
      />
    </div>
  );
}
