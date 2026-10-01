import React from "react";
import { Info, Truck, CheckCircle2, Clock } from "lucide-react";

interface ProviderAboutLogisticsProps {
  aboutText: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  estimatedHours: number;
}

export function ProviderAboutLogistics({
  aboutText,
  pickupAvailable,
  deliveryAvailable,
  estimatedHours,
}: ProviderAboutLogisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* About Box */}
      <section className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3 shadow-lg">
        <h3 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span>About the Studio</span>
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">{aboutText}</p>
      </section>

      {/* Logistics Box */}
      <section className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3 shadow-lg flex flex-col justify-between">
        <h3 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <span>Logistics &amp; Turnaround</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-green-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-on-surface">Doorstep Pickup {pickupAvailable ? "Available" : "Unavailable"}</span>
          </div>
          <div className="flex items-center gap-2 text-green-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-on-surface">Return Delivery {deliveryAvailable ? "Available" : "Unavailable"}</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-medium">
            <Clock className="h-4 w-4" />
            <span className="text-on-surface">{estimatedHours} hrs average turnaround</span>
          </div>
        </div>
      </section>
    </div>
  );
}
