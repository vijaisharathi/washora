import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";

export function TrackingSupportBanner() {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3 text-xs sm:text-sm text-on-surface">
        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
        <span className="font-medium">Need help or special assistance with this order?</span>
      </div>

      <Link
        href="/customer/support"
        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
      >
        <span>Contact Support</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
