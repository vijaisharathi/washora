"use client";

import React from "react";
import Link from "next/link";
import { useProviderOnboarding } from "@/features/provider/hooks/useProviderOnboarding";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

export default function ProviderOnboardingStatusPage() {
  const { statusData, isLoadingStatus } = useProviderOnboarding();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Top Header */}
      <header className="bg-surface/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-12 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">cleaning_services</span>
          <span className="font-headline-md text-lg font-bold text-on-surface">WASHORA</span>
          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
            Studio
          </span>
        </div>
        <Link
          href="/provider/auth/login"
          className="text-xs text-on-surface-variant hover:text-on-surface font-medium transition-colors"
        >
          Sign Out
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 md:py-16 flex flex-col items-center">
        {/* Verification Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-primary-container/30 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10">
          <span className="material-symbols-outlined text-3xl">hourglass_top</span>
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-500/30 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Application Under Review
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight mb-2">
            Onboarding Submitted Successfully
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Thank you for applying to join the WASHORA Certified Partner Network. Our operations team is reviewing your business documentation.
          </p>
        </div>

        {/* Application Details Card */}
        <ProviderCard variant="high" className="w-full p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-xs">
            <span className="text-on-surface-variant">Application Reference</span>
            <span className="font-mono font-bold text-on-surface">{statusData?.applicationNumber || "APP-PROV-20260901-782"}</span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-xs">
            <span className="text-on-surface-variant">Studio Trade Name</span>
            <span className="font-semibold text-on-surface">{statusData?.businessName || "LuxeCare Garment Studio"}</span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-xs">
            <span className="text-on-surface-variant">Estimated Review SLA</span>
            <span className="text-emerald-400 font-semibold">Under 24 Hours</span>
          </div>

          {/* Verification Checklist */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-on-surface-variant block mb-3">Verification Checklist</span>
            <div className="space-y-2.5">
              {(
                statusData?.verifiedItems || [
                  { label: "Business Registration & Legal Entity", isComplete: true },
                  { label: "Studio Geo-Location & Service Radius", isComplete: true },
                  { label: "Service Capabilities & SLA Parameters", isComplete: true },
                  { label: "GST Certificate & Legal Documents", isComplete: true },
                ]
              ).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-on-surface">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ProviderCard>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/provider"
            className="w-full sm:flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <span>Preview Studio Workspace</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <a
            href="tel:18004209000"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-container hover:bg-surface-variant text-on-surface text-sm font-semibold transition-colors border border-white/5 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">headset_mic</span>
            <span>Contact Partner Desk</span>
          </a>
        </div>
      </main>
    </div>
  );
}
