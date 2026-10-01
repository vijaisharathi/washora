import React, { useState } from "react";
import { ProviderOrderItem } from "@/types/provider/orders";

interface ReportIssueModalProps {
  order: ProviderOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details: string) => Promise<void>;
  isReporting: boolean;
}

export function ReportIssueModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  isReporting,
}: ReportIssueModalProps) {
  const [reason, setReason] = useState("Damaged Item Pre-existing");
  const [details, setDetails] = useState("");

  if (!isOpen || !order) return null;

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    await onConfirm(reason, details.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mb-4 border border-error/30">
          <span className="material-symbols-outlined text-2xl">report_problem</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Report Processing Exception</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Report a defect, fabric tear, or colorfastness issue on order{" "}
          <span className="font-semibold text-primary">{order.orderNumber}</span>.
        </p>

        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Issue Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            >
              <option value="Damaged Item Pre-existing">Pre-existing Fabric Tear / Scuff</option>
              <option value="Permanent Stain Unremovable">Permanent Bleed / Non-liftable Stain</option>
              <option value="Hardware Missing / Broken">Zipper / Hardware Broken</option>
              <option value="Special Care Escalation">Requires Specialist Master Artisan Review</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Observation Details</label>
            <textarea
              rows={3}
              placeholder="Describe exact tear location, fabric composition, or stain origin..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-3 border border-white/10 focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isReporting}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReporting}
              className="px-5 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 text-xs font-bold transition-all shadow-md shadow-error/20 flex items-center gap-1.5"
            >
              {isReporting ? <span>Logging Issue...</span> : <span>Submit Report</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
