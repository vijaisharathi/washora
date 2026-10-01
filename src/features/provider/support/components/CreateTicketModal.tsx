import React, { useState } from "react";
import {
  CreateSupportTicketPayload,
  ProviderSupportCategory,
  ProviderSupportPriority,
} from "@/types/provider/support";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSupportTicketPayload) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProviderSupportCategory>("PAYMENTS");
  const [priority, setPriority] = useState<ProviderSupportPriority>("MEDIUM");
  const [entityId, setEntityId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    await onSubmit({
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      entityId: entityId.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 border border-primary/30">
          <span className="material-symbols-outlined text-2xl">support_agent</span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1">Create Support Request</h3>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Submit an inquiry to our dedicated partner operations &amp; finance support team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProviderSupportCategory)}
                className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
              >
                <option value="PAYMENTS">Payments &amp; Settlement</option>
                <option value="ORDERS">Orders &amp; Processing</option>
                <option value="BOOKINGS">Bookings &amp; Intake</option>
                <option value="ONBOARDING">Compliance &amp; KYC</option>
                <option value="TECH">Technical Support</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProviderSupportPriority)}
                className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Related Reference (Order / Payout ID - Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. WSH-20260902-1042 or PO-20260901-43"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Subject</label>
            <input
              type="text"
              placeholder="Brief summary of the issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Description</label>
            <textarea
              rows={4}
              placeholder="Provide full details of your request or issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-3 border border-white/10 focus:border-primary outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              {isSubmitting ? <span>Creating...</span> : <span>Submit Request</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
