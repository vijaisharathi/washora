import React from "react";
import { Calendar, MapPin } from "lucide-react";

interface TrackingCurrentActionCardProps {
  pickupWindow: string;
  addressLine1: string;
  addressLine2: string;
}

export function TrackingCurrentActionCard({
  pickupWindow,
  addressLine1,
  addressLine2,
}: TrackingCurrentActionCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-xl space-y-4">
      {/* Subtle ambient electric violet glow matching Stitch */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <h3 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider">
        Current Action Needed
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pickup Window Box */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 flex items-start gap-3 shadow-inner">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Pickup Window
            </span>
            <p className="font-bold text-sm sm:text-base text-on-surface">
              {pickupWindow}
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
              Please ensure items are ready for valet collection.
            </p>
          </div>
        </div>

        {/* Pickup Location Box */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 flex items-start gap-3 shadow-inner">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Pickup Location
            </span>
            <p className="font-bold text-sm sm:text-base text-on-surface">
              {addressLine1}
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed pt-1 truncate max-w-[200px]">
              {addressLine2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
