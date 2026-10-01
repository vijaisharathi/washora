"use client";

import React from "react";
import { Building2, ShieldCheck, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface BankSettlementCardProps {
  paymentMethod: {
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    upiIdMasked: string;
    autoSettlementSchedule: string;
  };
}

export function BankSettlementCard({ paymentMethod }: BankSettlementCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container/80 border border-outline-variant/25 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Bank Settlement Details</h2>
            <p className="text-[11px] text-on-surface-variant">Automated daily bank transfer destination</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> KYC Verified Bank
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Primary Bank</span>
          <p className="font-bold text-on-surface text-sm">{paymentMethod.bankName}</p>
          <p className="font-mono text-on-surface-variant text-[11px]">
            A/C: {paymentMethod.accountNumberMasked}
          </p>
          <p className="font-mono text-on-surface-variant text-[10px]">IFSC: {paymentMethod.ifscCode}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">UPI VPA Link</span>
          <p className="font-mono font-bold text-on-surface text-sm">{paymentMethod.upiIdMasked}</p>
          <div className="flex items-center gap-1.5 text-primary text-[11px] pt-1">
            <Clock className="w-3 h-3" />
            <span>Schedule: {paymentMethod.autoSettlementSchedule}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
