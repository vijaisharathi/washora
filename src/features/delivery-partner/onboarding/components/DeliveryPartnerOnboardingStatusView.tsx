"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  ArrowRight,
  Headphones,
} from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";

export function DeliveryPartnerOnboardingStatusView() {
  const { onboardingStatus, isOnboardingStatusLoading } = useDeliveryPartnerSession();

  if (isOnboardingStatusLoading || !onboardingStatus) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-on-surface-variant">Loading verification status...</p>
      </div>
    );
  }

  const isApproved = onboardingStatus.stage === "APPROVED";
  const isUnderVerification = onboardingStatus.stage === "UNDER_VERIFICATION" || onboardingStatus.stage === "SUBMITTED";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 text-primary shadow-lg mb-2">
          {isApproved ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <Clock className="w-8 h-8 text-amber-400 animate-pulse" />}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
          {isApproved ? "Valet Application Approved!" : "Application Under Verification"}
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto">
          {isApproved
            ? "Your identity, driving license, and vehicle registration have been verified. You can now take orders."
            : "Our logistics compliance team is reviewing your documents and background check."}
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-surface-container/80 border border-outline-variant/30 backdrop-blur-xl shadow-xl space-y-6">
        {/* Status Tracker Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-on-surface-variant">Verification Stage</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <p className="text-sm font-bold text-on-surface">
                {onboardingStatus.stage.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-on-surface-variant">Allocated Dispatch Hub</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-on-surface truncate">{onboardingStatus.assignedHub}</p>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance Verification Checklist
          </h3>

          <div className="space-y-2">
            {[
              { title: "National Identity & Aadhaar KYC", status: "Verified & Approved" },
              { title: "Vehicle RC & License Background Scan", status: "In Automated Review" },
              { title: "Fulfillment Hub Allocation & Dispatch Zone", status: "Completed" },
              { title: "Direct Bank / UPI Settlement Escrow Link", status: "Linked" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant/15 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="text-on-surface font-medium">{item.title}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer Note */}
        {onboardingStatus.reviewerNotes && (
          <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/20 text-xs space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Operations Reviewer Notes</span>
            <p className="text-on-surface-variant leading-relaxed">{onboardingStatus.reviewerNotes}</p>
          </div>
        )}

        {/* Action button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/delivery-partner"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <span>Proceed to Valet Command Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/delivery-partner/onboarding"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors text-center"
          >
            Edit Application Draft
          </Link>
        </div>
      </div>
    </div>
  );
}
