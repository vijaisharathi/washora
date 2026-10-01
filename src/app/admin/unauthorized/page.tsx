"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container-low border border-critical/30 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-critical/15 border border-critical/40 flex items-center justify-center text-critical mx-auto shadow-lg shadow-critical/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-on-surface">Access Restricted</h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Your current session does not possess Administrative or Operations privileges. Access to the Lumina Admin Console is strictly guarded.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 text-left space-y-1">
          <p className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
            Boundary Enforcement
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Customer, Provider, and Delivery Partner accounts cannot access the administrative tier.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/admin/login"
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in as Administrator</span>
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
