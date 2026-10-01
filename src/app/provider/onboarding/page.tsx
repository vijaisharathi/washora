"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProviderOnboarding } from "@/features/provider/hooks/useProviderOnboarding";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

export default function ProviderOnboardingPage() {
  const {
    draft,
    saveDraft,
    isSavingDraft,
    uploadDoc,
    isUploadingDoc,
    submitOnboarding,
    isSubmittingOnboarding,
  } = useProviderOnboarding();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: draft?.businessInfo.businessName || "LuxeCare Garment Studio",
    legalEntityName: draft?.businessInfo.legalEntityName || "LuxeCare Care Services LLP",
    businessCategory: draft?.businessInfo.businessCategory || "laundry",
    gstNumber: draft?.businessInfo.gstNumber || "29AABCU9603R1ZM",
    panNumber: draft?.businessInfo.panNumber || "AABCU9603R",
    businessType: draft?.businessInfo.businessType || "llp",
    establishedYear: draft?.businessInfo.establishedYear || "2021",

    streetAddress: draft?.location.streetAddress || "Shop 14, Ground Floor, 100ft Road",
    buildingSuite: draft?.location.buildingSuite || "Indiranagar Galleria",
    locality: draft?.location.locality || "Indiranagar",
    city: draft?.location.city || "Bangalore",
    state: draft?.location.state || "Karnataka",
    postalCode: draft?.location.postalCode || "560038",
    coverageRadiusKm: draft?.location.coverageRadiusKm || 8,

    turnaroundSlaHours: draft?.capabilities.turnaroundSlaHours || 24,
    dailyCapacityUnits: draft?.capabilities.dailyCapacityUnits || 60,
    workingHoursStart: draft?.capabilities.workingHoursStart || "08:00 AM",
    workingHoursEnd: draft?.capabilities.workingHoursEnd || "08:00 PM",
  });

  const STEPS = [
    { num: 1, label: "Business Identity", icon: "domain" },
    { num: 2, label: "Studio Location", icon: "location_on" },
    { num: 3, label: "Capabilities & SLA", icon: "tune" },
    { num: 4, label: "KYC & Documents", icon: "description" },
    { num: 5, label: "Review & Submit", icon: "fact_check" },
  ];

  const handleNext = async () => {
    await saveDraft({
      step: currentStep + 1,
      businessInfo: {
        businessName: formData.businessName,
        legalEntityName: formData.legalEntityName,
        businessCategory: formData.businessCategory,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        businessType: formData.businessType as any,
        establishedYear: formData.establishedYear,
      },
      location: {
        streetAddress: formData.streetAddress,
        buildingSuite: formData.buildingSuite,
        locality: formData.locality,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        coverageRadiusKm: formData.coverageRadiusKm,
      },
      capabilities: {
        primarySpecialties: ["Couture Dry Cleaning", "Sneaker Deep Clean"],
        turnaroundSlaHours: formData.turnaroundSlaHours,
        dailyCapacityUnits: formData.dailyCapacityUnits,
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        workingHoursStart: formData.workingHoursStart,
        workingHoursEnd: formData.workingHoursEnd,
        pickupDropAvailable: true,
      },
    });
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleDocUploadSimulated = async (docType: "gst_certificate" | "trade_license" | "owner_id" | "storefront_photo") => {
    const fakeFile = new File(["mock_content"], `${docType}_verified_2026.pdf`, {
      type: "application/pdf",
    });
    await uploadDoc({ docType, file: fakeFile });
  };

  const handleSubmitApplication = async () => {
    await submitOnboarding();
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Top Header */}
      <header className="bg-surface/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-12 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">cleaning_services</span>
          <span className="font-headline-md text-lg font-bold text-on-surface">WASHORA</span>
          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
            Partner Onboarding
          </span>
        </div>
        <Link
          href="/provider/auth/login"
          className="text-xs text-on-surface-variant hover:text-on-surface font-medium transition-colors"
        >
          Save & Exit
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative mb-2">
            {STEPS.map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : isCurrent
                        ? "bg-primary-container text-on-primary-container border-primary shadow-md shadow-primary/20"
                        : "bg-surface-container text-on-surface-variant border-white/10"
                    }`}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      step.num
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                      isCurrent ? "text-primary font-semibold" : "text-on-surface-variant"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card Content */}
        <ProviderCard variant="high" className="p-6 md:p-8 mb-6">
          {/* STEP 1: Business Identity */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Business Identity & Registration</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Enter your formal registered business information and tax details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Business Trade Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Legal Entity Name</label>
                  <input
                    type="text"
                    value={formData.legalEntityName}
                    onChange={(e) => setFormData({ ...formData, legalEntityName: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Entity Structure</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  >
                    <option value="proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership Firm</option>
                    <option value="llp">Limited Liability Partnership (LLP)</option>
                    <option value="private_limited">Private Limited Company</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Business Category</label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  >
                    <option value="laundry">Dry Cleaning & Laundry</option>
                    <option value="shoes">Sneaker & Footwear Restoration</option>
                    <option value="bags">Leather Handbags & Accessories</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Business PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Studio Location */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Studio Location & Service Radius</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Specify your workshop physical location for customer discovery and valet routing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Street Address & Landmark</label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Locality / Area</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">PIN Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Service Radius: {formData.coverageRadiusKm} km
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={formData.coverageRadiusKm}
                    onChange={(e) => setFormData({ ...formData, coverageRadiusKm: parseInt(e.target.value, 10) })}
                    className="w-full accent-primary mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Capabilities & SLA */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Service Capabilities & SLAs</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Configure daily order throughput limits, working shifts, and turnaround guarantees.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Turnaround SLA Guarantee</label>
                  <select
                    value={formData.turnaroundSlaHours}
                    onChange={(e) => setFormData({ ...formData, turnaroundSlaHours: parseInt(e.target.value, 10) })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  >
                    <option value={12}>12 Hours (Same Day Express)</option>
                    <option value={24}>24 Hours (Standard Fast Track)</option>
                    <option value={48}>48 Hours (Comprehensive Specialty Care)</option>
                    <option value={72}>72 Hours (Delicate Restoration)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Daily Unit Capacity Limit</label>
                  <input
                    type="number"
                    value={formData.dailyCapacityUnits}
                    onChange={(e) => setFormData({ ...formData, dailyCapacityUnits: parseInt(e.target.value, 10) })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Shift Start Time</label>
                  <input
                    type="text"
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Shift End Time</label>
                  <input
                    type="text"
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KYC & Documents */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-on-surface">KYC & Business Documents</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Upload trade licenses, tax documents, and storefront photos for marketplace verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "gst_certificate", title: "GSTIN Certificate", icon: "receipt_long" },
                  { key: "trade_license", title: "Municipal Trade License", icon: "badge" },
                  { key: "owner_id", title: "Owner Govt ID (Aadhaar/Passport)", icon: "account_box" },
                  { key: "storefront_photo", title: "Studio Storefront Photo", icon: "store" },
                ].map((item) => {
                  const uploaded = draft?.documents.find((d) => d.docType === item.key);

                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                          <p className="text-xs text-on-surface-variant">PDF, PNG, JPG (Max 5MB)</p>
                        </div>
                      </div>

                      {uploaded ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                          <span className="truncate max-w-[180px] font-medium">{uploaded.fileName}</span>
                          <span className="text-[10px] font-bold uppercase bg-emerald-500/20 px-1.5 py-0.5 rounded">
                            Uploaded
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDocUploadSimulated(item.key as any)}
                          disabled={isUploadingDoc}
                          className="w-full py-2 rounded-lg bg-surface-variant hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center justify-center gap-1.5 border border-white/5"
                        >
                          <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          <span>Upload Document</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Review & Submit Application</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Please verify your studio setup information before submitting for onboarding review.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-on-surface-variant block">Business Trade Name</span>
                    <span className="font-semibold text-sm text-on-surface">{formData.businessName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase text-[10px]">
                    {formData.businessType}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-on-surface-variant block">Studio Address</span>
                    <span className="font-semibold text-on-surface">
                      {formData.streetAddress}, {formData.locality}, {formData.city} - {formData.postalCode}
                    </span>
                  </div>
                  <span className="text-primary font-medium">{formData.coverageRadiusKm} km Radius</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-on-surface-variant block">Turnaround SLA & Capacity</span>
                    <span className="font-semibold text-on-surface">
                      {formData.turnaroundSlaHours} Hours SLA Guarantee | {formData.dailyCapacityUnits} units/day
                    </span>
                  </div>
                  <span className="text-emerald-400 font-medium">{formData.workingHoursStart} – {formData.workingHoursEnd}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-on-surface-variant block">Verified KYC Documents</span>
                    <span className="font-semibold text-on-surface">
                      {draft?.documents.length || 2} Legal Documents Attached
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </ProviderCard>

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-sm font-semibold text-on-surface transition-colors border border-white/5"
            >
              ← Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSavingDraft}
              className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-sm font-semibold transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <span>Save & Continue</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={isSubmittingOnboarding}
              className="px-8 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-sm font-bold transition-all shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmittingOnboarding ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Partner Application</span>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
