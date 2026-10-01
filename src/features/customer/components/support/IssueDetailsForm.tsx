"use client";

import React, { useState } from "react";
import { IssueCategoryOption, CreateSupportTicketPayload } from "@/types/customer/support";
import {
  Check,
  Camera,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface IssueDetailsFormProps {
  selectedCategory: IssueCategoryOption;
  orderId?: string;
  onChangeCategory: () => void;
  onSubmitTicket: (payload: CreateSupportTicketPayload) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function IssueDetailsForm({
  selectedCategory,
  orderId = "WSH-20260901-1024",
  onChangeCategory,
  onSubmitTicket,
  isSubmitting,
  onCancel,
}: IssueDetailsFormProps) {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [contactPreference, setContactPreference] = useState<"email" | "chat" | "phone">("email");
  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please provide details of what happened so our care team can help.");
      return;
    }

    setErrorMsg("");
    await onSubmitTicket({
      orderId,
      issueCategory: selectedCategory.id,
      description: description.trim(),
      priority,
      contactPreference,
      hasAttachment: hasUploadedPhoto,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Issue Summary */}
      <div className="bg-surface-container-low border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">
              {selectedCategory.iconName}
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Selected Issue
            </span>
            <p className="font-bold text-sm sm:text-base text-on-surface truncate">
              {selectedCategory.label}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeCategory}
          className="text-xs font-bold text-primary hover:underline shrink-0"
        >
          Change
        </button>
      </div>

      {/* Order Information Attached Banner */}
      <div className="bg-surface-container-low border border-white/10 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
          <Check className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-on-surface">
            Order Context Automatically Attached
          </h4>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Order #{orderId} • Sneaker Deep Clean • CleanX Studio Partner
          </p>
        </div>
      </div>

      {/* Issue Description */}
      <div className="space-y-2">
        <label htmlFor="issue-desc" className="text-xs font-semibold text-on-surface block">
          Issue Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="issue-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Please describe what happened in detail. E.g., 'The valet picked up the sneakers but the custom laces were separated.'"
          className="w-full bg-surface-container-low border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none shadow-inner"
        />
        {errorMsg && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>

      {/* Photo Evidence Upload Zone */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface block">
          Photo Evidence <span className="text-on-surface-variant font-normal">(Optional)</span>
        </label>
        <button
          type="button"
          onClick={() => setHasUploadedPhoto(!hasUploadedPhoto)}
          className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            hasUploadedPhoto
              ? "border-green-500/40 bg-green-500/5 text-green-400"
              : "border-white/15 bg-surface-container-low/60 hover:border-primary/50 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mb-2 shadow-inner">
            {hasUploadedPhoto ? <Check className="h-6 w-6 text-green-400" /> : <Camera className="h-6 w-6" />}
          </div>
          <p className="text-xs font-bold text-on-surface">
            {hasUploadedPhoto ? "1 Photo Attached (photo_evidence.jpg)" : "Click to upload garment / parcel photo"}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            PNG, JPG or PDF (max. 10MB)
          </p>
        </button>
      </div>

      {/* Support Priority */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface block">
          Support Priority
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "low", title: "Standard", time: "24–48 hours" },
            { id: "medium", title: "High", time: "12–24 hours" },
            { id: "high", title: "Critical", time: "< 4 hours" },
          ].map((p) => {
            const isSelected = priority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id as "low" | "medium" | "high")}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? p.id === "high"
                      ? "border-red-500 bg-red-500/10 text-red-400 font-bold"
                      : "border-primary bg-primary/10 text-primary font-bold shadow-md"
                    : "border-white/10 bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="text-xs block">{p.title}</span>
                <span className="text-[10px] opacity-70 block mt-0.5">{p.time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Preference */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface block">
          Contact Preference
        </label>
        <div className="flex flex-wrap gap-3">
          {[
            { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
            { id: "chat", label: "Live Chat", icon: <MessageSquare className="h-4 w-4" /> },
            { id: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
          ].map((c) => {
            const isSelected = contactPreference === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setContactPreference(c.id as "email" | "chat" | "phone")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/15 text-primary font-bold shadow-sm"
                    : "border-white/10 bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-white/5">
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
          className="w-full sm:w-auto gap-2 text-xs font-bold shadow-lg shadow-primary/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <span>Submit Support Request</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
