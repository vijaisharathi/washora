"use client";

import React, { useState } from "react";
import { X, HelpCircle, AlertCircle, CheckCircle2, Paperclip, Send } from "lucide-react";
import {
  CreateSupportTicketPayload,
  SupportCategory,
  NotificationPriority,
} from "@/types/delivery-partner";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSupportTicketPayload) => Promise<unknown>;
  isSubmitting: boolean;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateTicketModalProps) {
  const [category, setCategory] = useState<SupportCategory>("DELIVERY_ISSUE");
  const [priority, setPriority] = useState<NotificationPriority>("NORMAL");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [relatedOrderId, setRelatedOrderId] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!subject.trim() || !description.trim()) {
      setErrorMsg("Please provide both a subject and issue description.");
      return;
    }

    try {
      await onSubmit({
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        relatedOrderId: relatedOrderId.trim() || undefined,
        attachmentName: attachmentName || undefined,
      });

      setSuccessMsg("Support ticket successfully submitted! Operations team has been notified.");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to submit support ticket.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Raise Support Ticket</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="DELIVERY_ISSUE">Delivery / Handover Problem</option>
                <option value="PICKUP_ISSUE">Pickup / Checklist Mismatch</option>
                <option value="PAYMENT_EARNINGS">Earnings / Bank Settlement</option>
                <option value="SAFETY_EMERGENCY">Safety / Vehicle Breakdown</option>
                <option value="APP_TECHNICAL">App / Technical Bug</option>
                <option value="OTHER">Other Query</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="NORMAL">Normal (Within 2 hrs)</option>
                <option value="HIGH">High Priority (Within 30 mins)</option>
                <option value="URGENT">Urgent (Immediate On-Duty Assist)</option>
              </select>
            </div>
          </div>

          {/* Related Order */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Related Order # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. WASH-9942"
              value={relatedOrderId}
              onChange={(e) => setRelatedOrderId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Subject Summary</label>
            <input
              type="text"
              placeholder="Brief summary of the issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Detailed Explanation</label>
            <textarea
              rows={3}
              placeholder="Explain the problem clearly with relevant doorstep notes or gate details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary resize-none"
              required
            />
          </div>

          {/* Mock Attachment Upload */}
          <div className="p-3 rounded-xl bg-surface border border-dashed border-outline-variant/30 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              <span className="text-on-surface-variant">
                {attachmentName ? attachmentName : "Attach photo evidence / gate slip"}
              </span>
            </div>
            {attachmentName ? (
              <button
                type="button"
                onClick={() => setAttachmentName(null)}
                className="text-error font-semibold text-[10px]"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAttachmentName("gate_photo_evidence.jpg")}
                className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-semibold text-primary"
              >
                + Add Photo
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !description.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
