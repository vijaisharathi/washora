import React from "react";
import Link from "next/link";
import { CustomerBookingDraft } from "@/types/customer/booking";
import { Calendar } from "lucide-react";

interface CheckoutScheduleCardProps {
  draft: CustomerBookingDraft;
}

export function CheckoutScheduleCard({ draft }: CheckoutScheduleCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" />
          <h3 className="font-bold text-base text-on-surface font-headline">Pickup Schedule</h3>
        </div>

        <Link
          href={`/customer/booking?serviceId=${draft.serviceId}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Edit
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-white/10 flex flex-col items-center justify-center min-w-[72px] shadow-inner">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Pickup
          </span>
          <span className="text-xl font-bold text-primary font-headline">
            {draft.pickupDate === "Tomorrow" ? "02" : "01"}
          </span>
        </div>

        <div className="space-y-0.5">
          <p className="font-bold text-sm text-on-surface">
            {draft.pickupDate || "Tomorrow"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {draft.pickupTimeSlotLabel || "10:00 AM – 12:00 PM"}
          </p>
        </div>
      </div>
    </div>
  );
}
