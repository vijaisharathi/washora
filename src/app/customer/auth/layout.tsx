import React from "react";
import Link from "next/link";

export default function CustomerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
      {/* Background ambient lighting matching Stitch */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

      {/* Header Bar */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between z-10 mb-4 sm:mb-6">
        <Link href="/customer" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary font-headline">
            WASHORA
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-white/5">
            Customer
          </span>
        </Link>
        <Link
          href="/customer"
          className="text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
        >
          <span>Explore Guest</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </header>

      {/* Main Form Content Shell */}
      <main className="w-full max-w-lg mx-auto z-10 my-auto py-2">
        {children}
      </main>

      {/* Auth Footer */}
      <footer className="w-full max-w-lg mx-auto text-center text-xs text-on-surface-variant/70 z-10 mt-6 space-y-1">
        <p>Protected by 256-bit SSL encryption &amp; Queryholic Security</p>
        <div className="flex justify-center gap-4 text-[11px] text-on-surface-variant">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/customer/support" className="hover:underline">Help</Link>
        </div>
      </footer>
    </div>
  );
}
