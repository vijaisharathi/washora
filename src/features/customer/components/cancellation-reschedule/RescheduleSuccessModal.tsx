"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RescheduleSuccessModalProps {
  orderId: string;
  newSchedule: string;
}

export function RescheduleSuccessModal({
  orderId,
  newSchedule,
}: RescheduleSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto shadow-lg shadow-green-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold text-on-surface font-headline">
            Pickup Rescheduled
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Order <strong className="text-on-surface font-mono">{orderId}</strong> is now scheduled for:
          </p>
          <p className="text-sm font-bold text-primary font-headline">
            {newSchedule}
          </p>
        </div>

        <Link href={`/customer/orders/${orderId}`} className="block">
          <Button size="lg" className="w-full gap-2 font-semibold shadow-lg shadow-primary/20">
            <span>Back to Live Tracking</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
