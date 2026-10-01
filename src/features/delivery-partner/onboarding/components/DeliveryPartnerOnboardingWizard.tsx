"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bike,
  Clock,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";
import {
  DeliveryPartnerOnboardingDraft,
  VehicleType,
} from "@/types/delivery-partner";

const STEPS = [
  { step: 1, label: "Personal & KYC", icon: User, desc: "Legal identity & address" },
  { step: 2, label: "Vehicle & License", icon: Bike, desc: "Transit details & RC/DL" },
  { step: 3, label: "Shift & Hub", icon: Clock, desc: "Working zone & emergency" },
  { step: 4, label: "Settlement Account", icon: CreditCard, desc: "Bank & UPI payouts" },
];

export function DeliveryPartnerOnboardingWizard() {
  const router = useRouter();
  const {
    onboardingDraft,
    isOnboardingDraftLoading,
    saveOnboardingDraft,
    isSavingOnboarding,
    submitOnboarding,
    isSubmittingOnboarding,
  } = useDeliveryPartnerSession();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DeliveryPartnerOnboardingDraft | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ rc?: boolean; dl?: boolean }>({
    rc: true,
    dl: true,
  });

  useEffect(() => {
    if (onboardingDraft) {
      setFormData(onboardingDraft);
      setCurrentStep(onboardingDraft.currentStep || 1);
    }
  }, [onboardingDraft]);

  if (isOnboardingDraftLoading || !formData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-on-surface-variant">Loading valet onboarding draft...</p>
      </div>
    );
  }

  const handleNext = async () => {
    setErrorMsg(null);

    // Validation per step
    if (currentStep === 1) {
      if (!formData.personalInfo.fullName || !formData.personalInfo.aadhaarOrDlNumber || !formData.personalInfo.city) {
        setErrorMsg("Please complete all required identity and address fields.");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.vehicleInfo.vehiclePlate || !formData.vehicleInfo.drivingLicenseNumber) {
        setErrorMsg("Please provide your vehicle plate and driving license details.");
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.shiftInfo.emergencyContactPhone) {
        setErrorMsg("Please provide an emergency contact phone number.");
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.bankInfo.accountNumber || !formData.bankInfo.ifscCode) {
        setErrorMsg("Please provide valid bank account details for settlement payouts.");
        return;
      }

      // Submit final onboarding
      try {
        await submitOnboarding(formData);
        router.push("/delivery-partner/onboarding/status");
        return;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Failed to submit onboarding. Please retry.");
        }
        return;
      }
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    await saveOnboardingDraft({ ...formData, currentStep: nextStep });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Valet Partner Onboarding Wizard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
          Garment Valet Registration & KYC
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant max-w-lg mx-auto">
          Complete your 4-step partner verification to begin receiving high-priority pickup and delivery dispatch tasks.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div
              key={s.step}
              onClick={() => isDone && setCurrentStep(s.step)}
              className={`p-3.5 rounded-2xl border transition-all text-left ${
                isCurrent
                  ? "bg-primary/15 border-primary/40 shadow-sm"
                  : isDone
                  ? "bg-surface-container-high/80 border-outline-variant/30 cursor-pointer hover:border-outline-variant/60"
                  : "bg-surface-container/40 border-outline-variant/15 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">Step 0{s.step}</span>
              </div>
              <p className="text-xs font-bold text-on-surface leading-tight">{s.label}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-container/80 border border-outline-variant/30 backdrop-blur-xl shadow-xl space-y-6">
        {/* STEP 1: Personal & KYC */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Step 1: Personal Identification & Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, fullName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Aadhaar or National ID</label>
                <input
                  type="text"
                  value={formData.personalInfo.aadhaarOrDlNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, aadhaarOrDlNumber: e.target.value },
                    })
                  }
                  placeholder="5421 8890 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personalInfo.dob}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, dob: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Operating City</label>
                <input
                  type="text"
                  value={formData.personalInfo.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, city: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Residential Address</label>
                <input
                  type="text"
                  value={formData.personalInfo.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, address: e.target.value },
                    })
                  }
                  placeholder="Street address, building, landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Vehicle & License */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
              <Bike className="w-4 h-4 text-primary" /> Step 2: Vehicle Registration & License Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Vehicle Type</label>
                <select
                  value={formData.vehicleInfo.vehicleType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: { ...formData.vehicleInfo, vehicleType: e.target.value as VehicleType },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="ELECTRIC_BIKE">Electric Bike (Ather / Ola / Chetak)</option>
                  <option value="SCOOTER">Scooter / Activa</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="VAN">Light Cargo Van</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Vehicle Model & Make</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.vehicleModel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: { ...formData.vehicleInfo, vehicleModel: e.target.value },
                    })
                  }
                  placeholder="e.g. Ather 450X Pro"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">License Plate Number</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.vehiclePlate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: { ...formData.vehicleInfo, vehiclePlate: e.target.value },
                    })
                  }
                  placeholder="KA-01-EV-4289"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Driving License Number</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.drivingLicenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: { ...formData.vehicleInfo, drivingLicenseNumber: e.target.value },
                    })
                  }
                  placeholder="KA-01-2018-0094821"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              {/* Mock Document Uploads */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">RC Document Copy</p>
                      <p className="text-[10px] text-emerald-400">✓ Uploaded & Validated</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadProgress({ ...uploadProgress, rc: true })}
                    className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg text-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Driving License Front/Back</p>
                      <p className="text-[10px] text-emerald-400">✓ Uploaded & Validated</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadProgress({ ...uploadProgress, dl: true })}
                    className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg text-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Shift & Hub */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Step 3: Shift Preference & Operational Hub
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Preferred Dispatch Shift</label>
                <select
                  value={formData.shiftInfo.preferredShift}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shiftInfo: {
                        ...formData.shiftInfo,
                        preferredShift: e.target.value as "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE_FULL_DAY",
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="FLEXIBLE_FULL_DAY">Flexible Full Day (08:00 - 20:00)</option>
                  <option value="MORNING">Morning Peak Shift (07:00 - 14:00)</option>
                  <option value="EVENING">Evening Express Shift (14:00 - 21:00)</option>
                  <option value="NIGHT">Late Night Rush (20:00 - 02:00)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Assigned Fulfillment Hub</label>
                <input
                  type="text"
                  value={formData.shiftInfo.hubName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shiftInfo: { ...formData.shiftInfo, hubName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Emergency Contact Name & Relation</label>
                <input
                  type="text"
                  value={formData.shiftInfo.emergencyContactName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shiftInfo: { ...formData.shiftInfo, emergencyContactName: e.target.value },
                    })
                  }
                  placeholder="e.g. Rajesh Singh (Brother)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.shiftInfo.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shiftInfo: { ...formData.shiftInfo, emergencyContactPhone: e.target.value },
                    })
                  }
                  placeholder="+91 98765 11223"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Bank & Settlement */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Step 4: Bank Account & Payout Settlement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Beneficiary Account Holder Name</label>
                <input
                  type="text"
                  value={formData.bankInfo.accountHolderName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo, accountHolderName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankInfo.bankName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo, bankName: e.target.value },
                    })
                  }
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Account Number</label>
                <input
                  type="text"
                  value={formData.bankInfo.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo, accountNumber: e.target.value },
                    })
                  }
                  placeholder="50100428991204"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankInfo.ifscCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo, ifscCode: e.target.value.toUpperCase() },
                    })
                  }
                  placeholder="HDFC0000142"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono uppercase"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">UPI ID for Instant Tips & Daily Payouts</label>
                <input
                  type="text"
                  value={formData.bankInfo.upiId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo, upiId: e.target.value },
                    })
                  }
                  placeholder="username@okaxis or mobile@upi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSavingOnboarding || isSubmittingOnboarding}
            className="px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSavingOnboarding || isSubmittingOnboarding}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:opacity-95 transition-opacity flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmittingOnboarding ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                <span>Submitting KYC Application...</span>
              </>
            ) : currentStep === 4 ? (
              <>
                <span>Submit Valet Onboarding</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Continue to Step 0{currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
