import React from "react";

export default function DeliveryPartnerLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-xs font-mono text-on-surface-variant animate-pulse">
        Loading WASHORA Valet portal...
      </p>
    </div>
  );
}
