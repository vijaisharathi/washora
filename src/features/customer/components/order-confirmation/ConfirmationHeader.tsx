import React from "react";
import { CheckCircle2 } from "lucide-react";

export function ConfirmationHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-3 pb-4">
      <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/20 animate-pulse">
        <CheckCircle2 className="h-9 w-9 text-green-400" />
      </div>

      <h1 className="text-2xl sm:text-4xl font-bold text-on-surface font-headline tracking-tight">
        Your Order is Confirmed
      </h1>

      <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
        Thank you for choosing WASHORA. Our certified care specialist and valet team will take it from here.
      </p>
    </div>
  );
}
