import React from "react";
import Link from "next/link";

export function CustomerFooter() {
  return (
    <footer className="hidden md:block border-t border-white/[0.08] bg-surface-dim text-slate-400 py-10 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-on-surface">WASHORA</span>
          <span>© {new Date().getFullYear()} Queryholic Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/customer/support" className="hover:text-on-surface transition-colors">
            Help Center
          </Link>
          <Link href="/privacy" className="hover:text-on-surface transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-on-surface transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
