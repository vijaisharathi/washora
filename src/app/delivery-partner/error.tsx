"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DeliveryPartnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally if needed
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center border border-error/20">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Valet Portal Notice</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          An operational interruption occurred while rendering this view. Your active session remains protected.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Retry Operation
      </button>
    </div>
  );
}
