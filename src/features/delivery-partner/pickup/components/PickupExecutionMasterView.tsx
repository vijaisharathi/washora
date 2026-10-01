"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Package,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  KeyRound,
  Check,
  ChevronRight,
  ShieldCheck,
  Info,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useDeliveryPartnerPickupExecution } from "../hooks/useDeliveryPartnerPickup";
import { PickupStep, PickupVerificationState } from "@/types/delivery-partner";
import { PickupWorkflowStepper } from "./PickupWorkflowStepper";
import { ReportPickupIssueModal } from "./ReportPickupIssueModal";

interface PickupExecutionMasterViewProps {
  taskId: string;
}

export function PickupExecutionMasterView({ taskId }: PickupExecutionMasterViewProps) {
  const router = useRouter();
  const {
    task,
    isLoading,
    isError,
    error,
    startPickup,
    isStartingPickup,
    verifyOtp,
    isVerifyingOtp,
    confirmPickup,
    isConfirmingPickup,
    reportIssue,
    isReportingIssue,
  } = useDeliveryPartnerPickupExecution(taskId);

  const [currentStep, setCurrentStep] = useState<PickupStep>("ARRIVE");
  const [arrivedAtLocation, setArrivedAtLocation] = useState(false);
  const [verifiedItemIndexes, setVerifiedItemIndexes] = useState<number[]>([]);
  const [securityTag, setSecurityTag] = useState("WASH-TAG-8841");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);
  const [isSuccessComplete, setIsSuccessComplete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-20 rounded-3xl bg-surface-container animate-pulse" />
        <div className="h-64 rounded-3xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-on-surface">Pickup Task Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error
              ? error.message
              : `The pickup task with ID "${taskId}" is unavailable or not assigned to your account.`}
          </p>
        </div>
        <Link
          href="/delivery-partner/pickup"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pickup Queue</span>
        </Link>
      </div>
    );
  }

  const handleCall = () => {
    setCallInitiated(true);
    setTimeout(() => setCallInitiated(false), 3000);
  };

  const toggleItemVerification = (index: number) => {
    if (verifiedItemIndexes.includes(index)) {
      setVerifiedItemIndexes(verifiedItemIndexes.filter((i) => i !== index));
    } else {
      setVerifiedItemIndexes([...verifiedItemIndexes, index]);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otpInput.length !== 4) {
      setOtpError("Please enter the 4-digit pickup verification PIN provided by the customer.");
      return;
    }

    try {
      await verifyOtp(otpInput);
      setOtpVerified(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOtpError(err.message);
      } else {
        setOtpError("Invalid verification PIN. Try demo code '1234'.");
      }
    }
  };

  const handleFinalConfirmPickup = async () => {
    const state: PickupVerificationState = {
      taskId: task.id,
      arrivedAtLocation: true,
      verifiedItemIndexes,
      securitySealTagCode: securityTag,
      pickupOtp: otpInput || "1234",
      isOtpVerified: true,
      completedAt: new Date().toISOString(),
    };

    await confirmPickup(state);
    setIsSuccessComplete(true);
  };

  if (isSuccessComplete || task.status === "PICKED_UP") {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-surface-container border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-emerald-400 font-mono tracking-wider">
            Inward Handover Completed
          </span>
          <h1 className="text-2xl font-bold text-on-surface">
            Order #{task.orderId} Picked Up Successfully!
          </h1>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            {task.itemsList.length} garment items sealed with Security Tag <span className="font-mono text-primary font-bold">{securityTag}</span>. Package is now in transit to Indiranagar Hub #04.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 max-w-md mx-auto text-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Customer Handover:</span>
            <span className="text-on-surface font-bold">{task.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Dropoff Hub:</span>
            <span className="text-on-surface font-bold">Indiranagar Hub #04</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Guaranteed Payout:</span>
            <span className="text-emerald-400 font-bold font-mono">+₹{task.payoutAmount}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/delivery-partner/pickup"
            className="px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface hover:text-primary transition-colors"
          >
            Pickup Queue
          </Link>
          <Link
            href="/delivery-partner/tasks"
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            View Task Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/delivery-partner/pickup"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pickup Queue</span>
        </Link>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Pickup Issue</span>
        </button>
      </div>

      {/* Stepper Visualizer */}
      <PickupWorkflowStepper currentStep={currentStep} />

      {/* Main Execution Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        {/* Top Order Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
              Doorstep Pickup Run
            </span>
            <h1 className="text-2xl font-extrabold text-on-surface font-mono">
              Order #{task.orderId}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Customer: <span className="text-on-surface font-bold">{task.customerName}</span> ({task.packageCount} Pack)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCall}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{callInitiated ? "Calling..." : "Call Customer"}</span>
            </button>
          </div>
        </div>

        {/* STEP 1: Arrival at Location */}
        {currentStep === "ARRIVE" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Pickup Location Address
              </span>
              <p className="text-sm font-semibold text-on-surface leading-snug">{task.pickupAddress}</p>
              <p className="text-xs text-on-surface-variant flex items-center gap-2 pt-1 font-mono">
                <Clock className="w-3 h-3 text-primary" />
                Scheduled Window: {task.scheduledTimeWindow}
              </p>
            </div>

            {task.notes && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Instructions:</span> {task.notes}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => {
                  setArrivedAtLocation(true);
                  setCurrentStep("VERIFY_ITEMS");
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>I Have Arrived at Doorstep</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Verify Items & Garment Count */}
        {currentStep === "VERIFY_ITEMS" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-on-surface">Verify Garment Checklist</h2>
              <p className="text-xs text-on-surface-variant">
                Check each item handed over by the customer to ensure accurate inward custody.
              </p>
            </div>

            <div className="space-y-2.5">
              {task.itemsList.map((item, idx) => {
                const isChecked = verifiedItemIndexes.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleItemVerification(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? "bg-primary/10 border-primary/40 text-on-surface"
                        : "bg-surface/70 border-outline-variant/20 text-on-surface-variant hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-colors ${
                          isChecked
                            ? "bg-primary text-primary-foreground"
                            : "border border-outline-variant/40 bg-surface"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold text-on-surface">{item}</span>
                    </div>

                    <span className="text-[10px] font-mono text-on-surface-variant">Item #{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep("ARRIVE")}
                className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface"
              >
                Back
              </button>

              <button
                onClick={() => setCurrentStep("SECURITY_TAGS")}
                disabled={verifiedItemIndexes.length === 0}
                className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <span>Continue to Security Tags ({verifiedItemIndexes.length}/{task.itemsList.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Security Seal Tagging */}
        {currentStep === "SECURITY_TAGS" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-on-surface">Attach Security Seal Barcode Tag</h2>
              <p className="text-xs text-on-surface-variant">
                Fasten tamper-proof RFID / QR laundry bag seal tag before handover.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">Security Seal Tag ID</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Scan Verified
                </span>
              </div>

              <div className="relative">
                <QrCode className="w-4 h-4 text-primary absolute left-3 top-3" />
                <input
                  type="text"
                  value={securityTag}
                  onChange={(e) => setSecurityTag(e.target.value.toUpperCase())}
                  placeholder="e.g. WASH-TAG-8841"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface font-mono uppercase font-bold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <p className="text-[11px] text-on-surface-variant">
                Bag Tag verified with Indiranagar Hub #04 barcode scanner pool.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep("VERIFY_ITEMS")}
                className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface"
              >
                Back
              </button>

              <button
                onClick={() => setCurrentStep("CONFIRM_OTP")}
                disabled={!securityTag.trim()}
                className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <span>Continue to OTP PIN</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Doorstep OTP Verification */}
        {currentStep === "CONFIRM_OTP" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-on-surface">Enter Customer Pickup OTP</h2>
              <p className="text-xs text-on-surface-variant">
                Ask the customer for the 4-digit pickup code displayed on their WASHORA app.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm">
              {otpError && (
                <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">4-Digit Handover PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-primary absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="1234"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-lg text-on-surface font-mono tracking-widest font-extrabold focus:outline-none focus:border-primary text-center"
                    required
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  (Demo PIN: <span className="font-mono text-primary font-bold">1234</span>)
                </p>
              </div>

              {!otpVerified ? (
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpInput.length !== 4}
                  className="w-full py-2.5 rounded-2xl bg-purple-500 text-black text-xs font-bold hover:bg-purple-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Verify Handover PIN</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PIN Verified! Ready to Confirm Inward Pickup.</span>
                </div>
              )}
            </form>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15 flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep("SECURITY_TAGS")}
                className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface"
              >
                Back
              </button>

              <button
                onClick={handleFinalConfirmPickup}
                disabled={!otpVerified || isConfirmingPickup}
                className="px-8 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-bold shadow-lg hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isConfirmingPickup ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Inward Pickup...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete & Seal Inward Pickup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident / Issue Modal */}
      <ReportPickupIssueModal
        taskId={task.id}
        orderId={task.orderId}
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onSubmit={reportIssue}
        isSubmitting={isReportingIssue}
      />
    </div>
  );
}
