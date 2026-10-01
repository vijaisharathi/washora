import React from "react";
import Link from "next/link";
import { Bike, ArrowLeft } from "lucide-react";

export default function DeliveryPartnerNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center border border-outline-variant/30">
        <Bike className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Route Destination Not Found</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          The requested dispatch route is not available in the WASHORA Delivery Partner portal.
        </p>
      </div>
      <Link
        href="/delivery-partner"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Valet Command
      </Link>
    </div>
  );
}
