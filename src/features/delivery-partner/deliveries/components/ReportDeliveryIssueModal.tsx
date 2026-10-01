"use client";

import React, { useState } from "react";
import { X, AlertTriangle, AlertCircle, Send, Camera } from "lucide-react";
import { DeliveryIssueType, DeliveryIssueReportPayload } from "@/types/delivery-partner";

interface ReportDeliveryIssueModalProps {
  taskId: string;
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: DeliveryIssueReportPayload) => Promise<unknown>;
  isSubmitting: boolean;
}

export function ReportDeliveryIssueModal({
  taskId,
  orderId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ReportDeliveryIssueModalProps) {
  const [issueType, setIssueType] = useState<DeliveryIssueType>("CUSTOMER_UNAVAILABLE");
  const [description, setDescription] = useState("");
  const [photosCount, setPhotosCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg("Please describe the delivery issue for hub supervisor.");
      return;
    }

    try {
      await onSubmit({
        taskId,
        orderId,
        issueType,
        description: description.trim(),
        photosUploaded: photosCount,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to log delivery issue.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-error/15 text-error flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Report Delivery Issue #{orderId}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Issue Reason</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as DeliveryIssueType)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-error"
              >
                <option value="CUSTOMER_UNAVAILABLE">Customer Door Locked / Unreachable</option>
                <option value="CUSTOMER_REFUSED">Customer Refused Package Acceptance</option>
                <option value="INCORRECT_ADDRESS">Incorrect Delivery Address / Map Pin</option>
                <option value="HANDOVER_FAILED">Handover Failed / Security Denied Entry</option>
                <option value="PACKAGE_DAMAGED">Package / Seal Damaged in Transit</option>
                <option value="WEATHER_DELAY">Severe Weather / Waterlogging Block</option>
                <option value="OTHER">Other Delivery Incident</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Explanation</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened at customer doorstep..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-error resize-none"
                required
              />
            </div>

            <div className="p-3 rounded-2xl bg-surface border border-outline-variant/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <span className="font-semibold text-on-surface">Attach Doorstep Photo Proof</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotosCount(Math.max(1, photosCount - 1))}
                  className="w-6 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold text-primary">{photosCount} Photo(s)</span>
                <button
                  type="button"
                  onClick={() => setPhotosCount(photosCount + 1)}
                  className="w-6 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-error text-error-foreground text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-error-foreground/40 border-t-error-foreground rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Incident</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
