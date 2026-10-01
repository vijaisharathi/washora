"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Phone,
  Package,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Check,
  ChevronRight,
  ShieldCheck,
  Info,
  Sparkles,
  QrCode,
} from "lucide-react";
import { useDeliveryPartnerDeliveryExecution } from "../hooks/useDeliveryPartnerDeliveries";
import { DeliveryStep, DeliveryHandoverState } from "@/types/delivery-partner";
import { DeliveryWorkflowStepper } from "./DeliveryWorkflowStepper";
import { ReportDeliveryIssueModal } from "./ReportDeliveryIssueModal";

interface DeliveryExecutionMasterViewProps {
  taskId: string;
}

export function DeliveryExecutionMasterView({ taskId }: DeliveryExecutionMasterViewProps) {
  const router = useRouter();
  const {
    task,
    isLoading,
    isError,
    error,
    startDelivery,
    isStartingDelivery,
    markArrived,
    isMarkingArrived,
    verifyOtp,
    isVerifyingOtp,
    completeDelivery,
    isCompletingDelivery,
    reportIssue,
    isReportingIssue,
  } = useDeliveryPartnerDeliveryExecution(taskId);

  const [currentStep, setCurrentStep] = useState<DeliveryStep>("TRANSIT");
  const [recipientConfirmed, setRecipientConfirmed] = useState(true);
  const [sealIntact, setSealIntact] = useState(true);
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
          <h2 className="text-base font-bold text-on-surface">Delivery Run Not Found</h2>
          <p className="text-xs text-on-surface-variant">
            {error instanceof Error
              ? error.message
              : `The delivery task with ID "${taskId}" is unavailable or not assigned to your account.`}
          </p>
        </div>
        <Link
          href="/delivery-partner/deliveries"
          className="px-5 py-2 rounded-xl bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Deliveries</span>
        </Link>
      </div>
    );
  }

  const handleCall = () => {
    setCallInitiated(true);
    setTimeout(() => setCallInitiated(false), 3000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otpInput.length !== 4) {
      setOtpError("Please enter the 4-digit customer delivery confirmation PIN.");
      return;
    }

    try {
      await verifyOtp(otpInput);
      setOtpVerified(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOtpError(err.message);
      } else {
        setOtpError("Invalid delivery confirmation PIN. Try demo code '5678' or '1234'.");
      }
    }
  };

  const handleFinalCompleteDelivery = async () => {
    const handoverState: DeliveryHandoverState = {
      taskId: task.id,
      arrivedAtLocation: true,
      recipientConfirmed,
      securitySealIntact: sealIntact,
      deliveryOtp: otpInput || "5678",
      isOtpVerified: true,
      completedAt: new Date().toISOString(),
    };

    await completeDelivery(handoverState);
    setIsSuccessComplete(true);
  };

  if (isSuccessComplete || task.status === "DELIVERED") {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-surface-container border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-emerald-400 font-mono tracking-wider">
            Customer Handover Complete
          </span>
          <h1 className="text-2xl font-bold text-on-surface">
            Order #{task.orderId} Delivered Successfully!
          </h1>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            Garments safely handed over to <span className="font-bold text-on-surface">{task.customerName}</span>. Payout has been credited to your daily wallet earnings.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 max-w-md mx-auto text-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Recipient Name:</span>
            <span className="text-on-surface font-bold">{task.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Delivery Handover PIN:</span>
            <span className="text-primary font-bold font-mono">{otpInput || "5678"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-semibold">Guaranteed Payout Credited:</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">+₹{task.payoutAmount}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/delivery-partner/deliveries"
            className="px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface hover:text-primary transition-colors"
          >
            Active Deliveries
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
          href="/delivery-partner/deliveries"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deliveries</span>
        </Link>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="text-xs font-semibold text-error hover:underline flex items-center gap-1"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Delivery Issue</span>
        </button>
      </div>

      {/* Stepper Visualizer */}
      <DeliveryWorkflowStepper currentStep={currentStep} />

      {/* Main Execution Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
        {/* Top Order Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
              Customer Dropoff Delivery
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

        {/* STEP 1: Live Transit */}
        {currentStep === "TRANSIT" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                Customer Destination Address
              </span>
              <p className="text-sm font-semibold text-on-surface leading-snug">{task.deliveryAddress}</p>
              <p className="text-xs text-on-surface-variant flex items-center gap-2 pt-1 font-mono">
                <Clock className="w-3 h-3 text-primary" />
                Delivery Window: {task.scheduledTimeWindow} • {task.distanceKm} km
              </p>
            </div>

            {task.notes && (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Delivery Gate Notes:</span> {task.notes}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => {
                  startDelivery();
                  setCurrentStep("ARRIVE");
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-500 text-black text-xs font-bold shadow-md hover:bg-purple-400 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Live Transit Route</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Arrival at Destination */}
        {currentStep === "ARRIVE" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-surface/80 border border-outline-variant/20 space-y-3">
              <span className="text-xs font-bold text-on-surface flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Arriving at {task.customerName}&apos;s Address
              </span>
              <p className="text-sm font-semibold text-on-surface">{task.deliveryAddress}</p>
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/15 text-xs text-on-surface-variant">
                Please ring the doorbell or phone the customer to prepare for garment handover.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep("TRANSIT")}
                className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface"
              >
                Back
              </button>

              <button
                onClick={() => {
                  markArrived();
                  setCurrentStep("VERIFY_HANDOVER");
                }}
                className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>I Have Arrived at Doorstep</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verify Garment Handover & Security Seal */}
        {currentStep === "VERIFY_HANDOVER" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-on-surface">Customer Handover Verification</h2>
              <p className="text-xs text-on-surface-variant">
                Confirm recipient identity and ensure all sealed laundry garment bags are intact.
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setRecipientConfirmed(!recipientConfirmed)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  recipientConfirmed
                    ? "bg-primary/10 border-primary/40 text-on-surface"
                    : "bg-surface/70 border-outline-variant/20 text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                      recipientConfirmed
                        ? "bg-primary text-primary-foreground"
                        : "border border-outline-variant/40 bg-surface"
                    }`}
                  >
                    {recipientConfirmed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-on-surface">Recipient Identity Confirmed</span>
                    <p className="text-[10px] text-on-surface-variant">
                      Handing over to {task.customerName} or authorized household member
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSealIntact(!sealIntact)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  sealIntact
                    ? "bg-primary/10 border-primary/40 text-on-surface"
                    : "bg-surface/70 border-outline-variant/20 text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                      sealIntact
                        ? "bg-primary text-primary-foreground"
                        : "border border-outline-variant/40 bg-surface"
                    }`}
                  >
                    {sealIntact && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-on-surface">Tamper-Proof Laundry Bag Seal Intact</span>
                    <p className="text-[10px] text-on-surface-variant">
                      All {task.packageCount} security sealed garment pack(s) verified untampered
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep("ARRIVE")}
                className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface"
              >
                Back
              </button>

              <button
                onClick={() => setCurrentStep("CONFIRM_OTP")}
                disabled={!recipientConfirmed || !sealIntact}
                className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <span>Continue to Customer Handover OTP</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Customer Delivery Confirmation OTP PIN */}
        {currentStep === "CONFIRM_OTP" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-on-surface">Enter Customer Delivery Confirmation PIN</h2>
              <p className="text-xs text-on-surface-variant">
                Request the 4-digit delivery PIN from {task.customerName} to verify successful delivery.
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
                <label className="text-xs font-semibold text-on-surface-variant">4-Digit Delivery Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-primary absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="5678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-lg text-on-surface font-mono tracking-widest font-extrabold focus:outline-none focus:border-primary text-center"
                    required
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  (Demo PIN: <span className="font-mono text-primary font-bold">5678</span> or <span className="font-mono text-primary font-bold">1234</span>)
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
                  <span>Verify Delivery PIN</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PIN Verified! Ready to Complete Handover.</span>
                </div>
              )}
            </form>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15 flex-wrap gap-3">
              <button
                onClick={() => setCurrentStep("VERIFY_HANDOVER")}
                className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface"
              >
                Back
              </button>

              <button
                onClick={handleFinalCompleteDelivery}
                disabled={!otpVerified || isCompletingDelivery}
                className="px-8 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-bold shadow-lg hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isCompletingDelivery ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Completing Handover...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Final Handover & Delivery</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident / Issue Modal */}
      <ReportDeliveryIssueModal
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
