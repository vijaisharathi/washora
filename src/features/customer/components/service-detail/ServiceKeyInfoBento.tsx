import React from "react";

interface ServiceKeyInfoBentoProps {
  turnaround: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  locationName: string;
}

export function ServiceKeyInfoBento({
  turnaround,
  pickupAvailable,
  deliveryAvailable,
  locationName,
}: ServiceKeyInfoBentoProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
      {/* Turnaround */}
      <div className="bg-surface-container p-4 rounded-xl border border-white/10 flex flex-col gap-1 hover:border-primary/40 transition-colors shadow-md">
        <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
          Turnaround
        </span>
        <span className="text-xs sm:text-sm font-bold text-on-surface">{turnaround}</span>
      </div>

      {/* Pickup */}
      <div className="bg-surface-container p-4 rounded-xl border border-white/10 flex flex-col gap-1 hover:border-primary/40 transition-colors shadow-md">
        <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
          Doorstep Pickup
        </span>
        <span className="text-xs sm:text-sm font-bold text-green-400">
          {pickupAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Delivery */}
      <div className="bg-surface-container p-4 rounded-xl border border-white/10 flex flex-col gap-1 hover:border-primary/40 transition-colors shadow-md">
        <span className="material-symbols-outlined text-primary text-2xl">door_front</span>
        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
          Return Delivery
        </span>
        <span className="text-xs sm:text-sm font-bold text-green-400">
          {deliveryAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Location */}
      <div className="bg-surface-container p-4 rounded-xl border border-white/10 flex flex-col gap-1 hover:border-primary/40 transition-colors shadow-md">
        <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
          Serving Area
        </span>
        <span className="text-xs sm:text-sm font-bold text-on-surface truncate">{locationName}</span>
      </div>
    </div>
  );
}
