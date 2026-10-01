import React from "react";
import Link from "next/link";
import { DisputeClaimData } from "@/types/customer/disputesRefunds";
import { Clock, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisputeStatusCardProps {
  dispute: DisputeClaimData;
}

export function DisputeStatusCard({ dispute }: DisputeStatusCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Active Dispute Investigation
          </span>
          <div className="flex items-center gap-3">
            <h3 className="font-mono font-bold text-lg sm:text-xl text-primary">
              {dispute.disputeNumber}
            </h3>
            <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {dispute.status}
            </span>
          </div>
        </div>

        <div className="text-right sm:text-right">
          <span className="text-[10px] text-on-surface-variant block">Requested Refund</span>
          <span className="font-mono font-bold text-base text-on-surface">
            ₹{dispute.refundAmount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 space-y-1">
          <span className="text-on-surface-variant font-medium block">Dispute Reason</span>
          <p className="font-bold text-on-surface">{dispute.reasonLabel}</p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 space-y-1">
          <span className="text-on-surface-variant font-medium block">Estimated Decision</span>
          <p className="font-bold text-green-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{dispute.estimatedResolutionDate}</span>
          </p>
        </div>
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-xs text-on-surface leading-relaxed">
        <strong>Mediation in Progress:</strong> Our customer protection team has notified the care studio center. Your payment is held securely in escrow pending resolution.
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href={`/customer/orders/${dispute.orderId}`}>
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            Back to Tracking
          </Button>
        </Link>
        <Link href="/customer/support">
          <Button size="sm" className="gap-2 text-xs font-bold shadow-lg shadow-primary/20">
            <span>Help Center</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
