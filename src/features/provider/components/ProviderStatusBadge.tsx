import React from "react";
import { cn } from "@/lib/utils";
import { ProviderAccountStatus } from "@/types/provider";

interface ProviderStatusBadgeProps {
  status: ProviderAccountStatus | "ONLINE" | "OFFLINE" | "IN_PROCESSING" | "READY" | "COMPLETED";
  className?: string;
}

export function ProviderStatusBadge({ status, className }: ProviderStatusBadgeProps) {
  const configMap: Record<string, { label: string; bg: string; text: string; border: string; dot?: string }> = {
    ACTIVE: { label: "Active Verified", bg: "bg-emerald-950/40", text: "text-emerald-300", border: "border-emerald-500/30", dot: "bg-emerald-400" },
    ONLINE: { label: "Studio Online", bg: "bg-emerald-950/40", text: "text-emerald-300", border: "border-emerald-500/30", dot: "bg-emerald-400" },
    OFFLINE: { label: "Offline", bg: "bg-zinc-900", text: "text-zinc-400", border: "border-zinc-700/40", dot: "bg-zinc-500" },
    PENDING_ONBOARDING: { label: "Pending Setup", bg: "bg-amber-950/40", text: "text-amber-300", border: "border-amber-500/30", dot: "bg-amber-400" },
    UNDER_VERIFICATION: { label: "Under Review", bg: "bg-purple-950/40", text: "text-purple-300", border: "border-purple-500/30", dot: "bg-purple-400" },
    KYC_SUBMITTED: { label: "KYC Received", bg: "bg-blue-950/40", text: "text-blue-300", border: "border-blue-500/30", dot: "bg-blue-400" },
    SUSPENDED: { label: "Suspended", bg: "bg-rose-950/40", text: "text-rose-300", border: "border-rose-500/30", dot: "bg-rose-400" },
    IN_PROCESSING: { label: "In Care Processing", bg: "bg-purple-950/40", text: "text-purple-300", border: "border-purple-500/30", dot: "bg-purple-400" },
    READY: { label: "Ready For Valet", bg: "bg-sky-950/40", text: "text-sky-300", border: "border-sky-500/30", dot: "bg-sky-400" },
    COMPLETED: { label: "Completed", bg: "bg-emerald-950/40", text: "text-emerald-300", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  };

  const current = configMap[status] || {
    label: status,
    bg: "bg-zinc-900",
    text: "text-zinc-400",
    border: "border-zinc-700/40",
    dot: "bg-zinc-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {current.dot && <div className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />}
      <span>{current.label}</span>
    </span>
  );
}
