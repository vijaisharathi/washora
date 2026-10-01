"use client";

import React, { useState } from "react";
import {
  DisputeReasonOption,
  DisputeClaimPayload,
  DisputeReasonType,
  ResolutionType,
} from "@/types/customer/disputesRefunds";
import {
  ShieldAlert,
  DollarSign,
  Sparkles,
  Camera,
  Check,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisputeClaimFormProps {
  orderId: string;
  reasons: DisputeReasonOption[];
  totalAmount: number;
  initialReason?: DisputeReasonType;
  onSubmitDispute: (payload: DisputeClaimPayload) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function DisputeClaimForm({
  orderId,
  reasons,
  totalAmount,
  initialReason = "damaged_garment",
  onSubmitDispute,
  isSubmitting,
  onCancel,
}: DisputeClaimFormProps) {
  const [selectedReason, setSelectedReason] = useState<DisputeReasonType>(initialReason);
  const [resolution, setResolution] = useState<ResolutionType>("FULL_REFUND");
  const [description, setDescription] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please provide an explanation of the dispute to proceed.");
      return;
    }

    setErrorMsg("");
    await onSubmitDispute({
      orderId,
      reason: selectedReason,
      desiredResolution: resolution,
      description: description.trim(),
      refundAmount: resolution === "FULL_REFUND" ? totalAmount : Math.round(totalAmount / 2),
      hasPhotoEvidence: hasPhoto,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="space-y-1 border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-on-surface font-headline flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <span>Dispute Claim &amp; Refund Request</span>
        </h2>
        <p className="text-xs text-on-surface-variant">
          Submit an official review request for order #{orderId}. Our mediation team will audit studio logs.
        </p>
      </div>

      {/* Select Dispute Reason */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface block">
          Dispute Reason <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reasons.map((r) => {
            const isSelected = selectedReason === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReason(r.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-white/10 bg-surface-container-low text-on-surface hover:text-primary hover:border-primary/40"
                }`}
              >
                <span className="font-bold text-xs block">{r.label}</span>
                <span className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                  {r.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desired Resolution */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface block">
          Requested Resolution
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "FULL_REFUND",
              label: `Full Refund (₹${totalAmount})`,
              icon: <DollarSign className="h-4 w-4" />,
            },
            {
              id: "PARTIAL_REFUND",
              label: `50% Credit (₹${Math.round(totalAmount / 2)})`,
              icon: <DollarSign className="h-4 w-4" />,
            },
            {
              id: "COMPLIMENTARY_RECLEAN",
              label: "Free Re-clean & Treatment",
              icon: <Sparkles className="h-4 w-4" />,
            },
          ].map((res) => {
            const isSelected = resolution === res.id;
            return (
              <button
                key={res.id}
                type="button"
                onClick={() => setResolution(res.id as ResolutionType)}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/15 text-primary font-bold shadow-sm"
                    : "border-white/10 bg-surface-container-low text-on-surface hover:text-primary"
                }`}
              >
                {res.icon}
                <span>{res.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="dispute-desc" className="text-xs font-semibold text-on-surface block">
          Detailed Explanation <span className="text-red-400">*</span>
        </label>
        <textarea
          id="dispute-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Please describe the damage or service failure with specific details..."
          className="w-full bg-surface-container-low border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none shadow-inner"
        />
        {errorMsg && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>

      {/* Photo Attachment */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface block">
          Photo Evidence (Highly Recommended)
        </label>
        <button
          type="button"
          onClick={() => setHasPhoto(!hasPhoto)}
          className={`w-full border-2 border-dashed rounded-xl p-5 flex items-center justify-center gap-3 transition-all cursor-pointer ${
            hasPhoto
              ? "border-green-500/40 bg-green-500/5 text-green-400"
              : "border-white/15 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-primary/50"
          }`}
        >
          {hasPhoto ? <Check className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
          <span className="text-xs font-bold">
            {hasPhoto ? "Photo Attached (damage_proof.jpg)" : "Attach Photo of Garment or Receipt"}
          </span>
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-xs font-semibold"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white gap-2 text-xs font-bold shadow-lg shadow-red-600/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Dispute...</span>
            </>
          ) : (
            <>
              <span>Submit Dispute Claim</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
