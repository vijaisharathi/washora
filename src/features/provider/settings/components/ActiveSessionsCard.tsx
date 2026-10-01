"use client";

import React from "react";
import { ProviderSecuritySession } from "@/types/provider/settings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ActiveSessionsCardProps {
  sessions: ProviderSecuritySession[];
  onRevokeSession: (id: string) => Promise<void>;
  isRevoking: boolean;
}

export function ActiveSessionsCard({
  sessions,
  onRevokeSession,
  isRevoking,
}: ActiveSessionsCardProps) {
  return (
    <ProviderCard variant="container" className="p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">devices</span>
        <div>
          <h3 className="text-sm font-bold text-on-surface">Active Partner Sessions</h3>
          <p className="text-xs text-on-surface-variant">
            Devices and workstations currently logged into your studio account.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-container-low border border-white/5 gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">{sess.device}</span>
                {sess.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 uppercase">
                    Current Device
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {sess.browser} • {sess.ipAddress} • {sess.location}
              </p>
              <p className="text-[10px] text-on-surface-variant/70">{sess.lastActive}</p>
            </div>

            {!sess.isCurrent && (
              <button
                type="button"
                onClick={() => onRevokeSession(sess.id)}
                disabled={isRevoking}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-950/20 text-red-400 text-xs font-semibold transition-colors self-start sm:self-auto"
              >
                Revoke Access
              </button>
            )}
          </div>
        ))}
      </div>
    </ProviderCard>
  );
}
