"use client";

import React from "react";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface DangerZoneSectionProps {
  onOpenLogout: () => void;
  onOpenDeactivate: () => void;
}

export function DangerZoneSection({
  onOpenLogout,
  onOpenDeactivate,
}: DangerZoneSectionProps) {
  return (
    <ProviderCard variant="container" className="p-6 space-y-6 border-red-500/20">
      <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
        <span className="material-symbols-outlined text-red-400 text-[20px]">warning</span>
        <div>
          <h3 className="text-sm font-bold text-red-400">Account Actions &amp; Security</h3>
          <p className="text-xs text-on-surface-variant">
            Sign out of this session or temporarily deactivate your provider operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sign out */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-on-surface mb-1">Sign Out of Partner Portal</h4>
            <p className="text-[11px] text-on-surface-variant">
              End your active session securely on this workstation.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLogout}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors self-start"
          >
            Sign Out
          </button>
        </div>

        {/* Deactivate */}
        <div className="p-4 rounded-xl bg-red-950/10 border border-red-500/20 flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-red-400 mb-1">Deactivate Provider Operations</h4>
            <p className="text-[11px] text-on-surface-variant">
              Temporarily unpublish your studio from marketplace search and direct customer booking.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDeactivate}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-colors self-start"
          >
            Deactivate Studio
          </button>
        </div>
      </div>
    </ProviderCard>
  );
}
