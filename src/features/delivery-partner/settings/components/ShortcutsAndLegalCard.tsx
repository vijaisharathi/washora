"use client";

import React from "react";
import Link from "next/link";
import {
  Wallet,
  Bell,
  HelpCircle,
  FileText,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";

interface ShortcutsAndLegalCardProps {
  onDeactivateClick: () => void;
}

export function ShortcutsAndLegalCard({ onDeactivateClick }: ShortcutsAndLegalCardProps) {
  const { logout } = useDeliveryPartnerSession();

  return (
    <div className="space-y-4">
      {/* Canonical Feature Shortcuts */}
      <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Quick Portals & Hub Shortcuts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link
            href="/delivery-partner/earnings"
            className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 hover:border-primary/40 hover:bg-surface-container-high transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface group-hover:text-primary">Payouts & Bank</p>
                <p className="text-[10px] text-on-surface-variant">D8 Wallet</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
          </Link>

          <Link
            href="/delivery-partner/notifications"
            className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 hover:border-primary/40 hover:bg-surface-container-high transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface group-hover:text-primary">Dispatch Alerts</p>
                <p className="text-[10px] text-on-surface-variant">D11 Center</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
          </Link>

          <Link
            href="/delivery-partner/support"
            className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 hover:border-primary/40 hover:bg-surface-container-high transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface group-hover:text-primary">Help & Hotline</p>
                <p className="text-[10px] text-on-surface-variant">D12 Desk</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
          </Link>
        </div>
      </div>

      {/* Legal & App Info */}
      <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Legal & App Information
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 flex items-center justify-between">
            <span className="text-on-surface flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" /> Valet Partner Agreement & Terms
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant">v2.4</span>
          </div>

          <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 flex items-center justify-between">
            <span className="text-on-surface flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Safety Guidelines & Code of Conduct
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant">Updated 2026</span>
          </div>

          <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 flex items-center justify-between">
            <span className="text-on-surface-variant">App Build Version</span>
            <span className="text-[10px] font-mono font-bold text-primary">v2.4.0-valet-prod</span>
          </div>
        </div>
      </div>

      {/* Account Lifecycle Actions: Logout & Deactivate */}
      <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface hover:text-error hover:border-error/30 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-error" />
          <span>Log Out Valet Session</span>
        </button>

        <button
          type="button"
          onClick={onDeactivateClick}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant/70 hover:text-error transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Deactivate Account</span>
        </button>
      </div>
    </div>
  );
}
