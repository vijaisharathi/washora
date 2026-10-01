import React from "react";
import { Calendar, MapPin, Info } from "lucide-react";

interface ConfirmationLogisticsCardProps {
  pickupDateFormatted: string;
  pickupTimeSlot: string;
  addressFormatted: string;
  turnaroundEstimate: string;
}

export function ConfirmationLogisticsCard({
  pickupDateFormatted,
  pickupTimeSlot,
  addressFormatted,
  turnaroundEstimate,
}: ConfirmationLogisticsCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 md:col-span-2 shadow-xl">
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
        Pickup Logistics &amp; Delivery
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-primary shrink-0 shadow-inner">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs sm:text-sm font-bold text-on-surface">
              {pickupDateFormatted}, {pickupTimeSlot}
            </span>
            <p className="text-[11px] text-on-surface-variant">Scheduled Doorstep Window</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-primary shrink-0 shadow-inner">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs sm:text-sm font-bold text-on-surface line-clamp-1">
              {addressFormatted}
            </span>
            <p className="text-[11px] text-on-surface-variant">Doorstep Address</p>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 flex items-center gap-2.5 text-xs text-on-surface-variant">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <p>
          Estimated Turnaround: <strong className="text-on-surface font-semibold">{turnaroundEstimate}</strong>.
        </p>
      </div>
    </div>
  );
}
