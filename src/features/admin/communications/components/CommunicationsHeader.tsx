"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  PlusCircle,
  FileEdit,
  RefreshCw,
  Building2,
} from "lucide-react";

interface CommunicationsHeaderProps {
  organizationId: string;
  totalMessages: number;
  draftCount: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function CommunicationsHeader({
  organizationId,
  totalMessages,
  draftCount,
  onRefresh,
  isLoading,
}: CommunicationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            Operational Communications
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            A12
          </span>
          {draftCount > 0 && (
            <Link
              href="/admin/communications/drafts"
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              {draftCount} Draft{draftCount === 1 ? "" : "s"}
            </Link>
          )}
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-2">
          <span>Internal messaging, provider notices, and valet dispatch advisories.</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface">
            <Building2 className="w-3 h-3 text-primary" />
            {organizationId}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/admin/communications/drafts"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          title="View saved drafts"
        >
          <FileEdit className="w-3.5 h-3.5 text-on-surface-variant" />
          <span>Drafts ({draftCount})</span>
        </Link>

        <Link
          href="/admin/communications/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Compose</span>
        </Link>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          title="Refresh messages"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
