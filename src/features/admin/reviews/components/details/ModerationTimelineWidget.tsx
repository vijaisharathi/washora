"use client";

import React from "react";
import {
  History,
  Flag,
  EyeOff,
  RotateCcw,
  CheckCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { ReviewModerationActivity, ModerationActivityType } from "@/types/admin/review";

interface ModerationTimelineWidgetProps {
  activities: ReviewModerationActivity[];
  isLoading?: boolean;
}

export function ModerationTimelineWidget({
  activities,
  isLoading,
}: ModerationTimelineWidgetProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse space-y-4">
        <div className="w-32 h-4 bg-surface-container-high rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-container-high rounded" />
          ))}
        </div>
      </div>
    );
  }

  const renderIcon = (type: ModerationActivityType) => {
    switch (type) {
      case "Review Flagged":
        return <Flag className="w-3.5 h-3.5 text-rose-500" />;
      case "Review Hidden":
        return <EyeOff className="w-3.5 h-3.5 text-slate-400" />;
      case "Review Restored":
        return <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />;
      case "Review Published":
        return <CheckCircle className="w-3.5 h-3.5 text-primary" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-on-surface-variant" />;
    }
  };

  const renderBadge = (type: ModerationActivityType) => {
    switch (type) {
      case "Review Flagged":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Flagged
          </span>
        );
      case "Review Hidden":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Hidden
          </span>
        );
      case "Review Restored":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Restored
          </span>
        );
      case "Review Published":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
            Published
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            Moderation & Audit History
          </h3>
        </div>
        <span className="text-[11px] text-on-surface-variant font-mono">
          {activities.length} event{activities.length === 1 ? "" : "s"}
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-on-surface-variant">
          No moderation actions taken yet for this review.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
          {activities.map((act) => {
            const formattedTime = new Date(act.timestamp).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={act.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container border border-outline-variant/60 flex items-center justify-center">
                  {renderIcon(act.type)}
                </div>

                <div className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-on-surface">
                        {act.type}
                      </span>
                      {renderBadge(act.type)}
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {formattedTime}
                    </span>
                  </div>

                  {act.reason && (
                    <div className="text-[11px] font-medium text-rose-500 mb-0.5">
                      Reason: {act.reason}
                    </div>
                  )}

                  {act.note && (
                    <p className="text-[11px] text-on-surface-variant italic">
                      &ldquo;{act.note}&rdquo;
                    </p>
                  )}

                  <div className="text-[10px] text-on-surface-variant/80 font-mono mt-1.5 pt-1.5 border-t border-outline-variant/20">
                    By: {act.performedBy}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
