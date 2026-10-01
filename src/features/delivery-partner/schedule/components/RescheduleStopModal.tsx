"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { RescheduleStopPayload } from "@/types/delivery-partner";

interface RescheduleStopModalProps {
  taskId: string;
  orderId: string;
  currentTimeWindow: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RescheduleStopPayload) => Promise<unknown>;
  isRescheduling: boolean;
}

export function RescheduleStopModal({
  taskId,
  orderId,
  currentTimeWindow,
  isOpen,
  onClose,
  onSubmit,
  isRescheduling,
}: RescheduleStopModalProps) {
  const [newWindow, setNewWindow] = useState("03:30 PM - 04:30 PM");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for rescheduling this route stop.");
      return;
    }

    try {
      await onSubmit({
        taskId,
        newTimeWindow: newWindow,
        reason: reason.trim(),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to reschedule stop.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Reschedule Stop #{orderId}</h2>
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

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 text-xs">
              <span className="text-on-surface-variant font-semibold">Current Window:</span>
              <p className="font-mono font-bold text-on-surface pt-0.5">{currentTimeWindow}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Select New Delivery Window</label>
              <select
                value={newWindow}
                onChange={(e) => setNewWindow(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="01:30 PM - 02:30 PM">01:30 PM - 02:30 PM</option>
                <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM (Afternoon Shift)</option>
                <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM (Evening Window)</option>
                <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM (Late Night Express)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Reason for Rescheduling</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Customer requested afternoon delivery, road blockage..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isRescheduling}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRescheduling}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-60"
            >
              {isRescheduling ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
