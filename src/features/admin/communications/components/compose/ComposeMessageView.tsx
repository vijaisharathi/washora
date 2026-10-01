"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Save,
  FileEdit,
  Users,
  AlertCircle,
  CheckCircle2,
  Building2,
  Layers,
  Store,
  Bike,
  HelpCircle,
} from "lucide-react";
import { useAdminComposeMessage, useAdminCommunicationDetails } from "@/features/admin/hooks/useAdminCommunications";
import {
  RecipientType,
  CommunicationChannel,
  RECIPIENT_TYPES,
  COMMUNICATION_CHANNELS,
  ComposeMessageSchema,
} from "@/types/admin/notification";
import { SendMessageConfirmationModal } from "../modals/SendMessageConfirmationModal";

export function ComposeMessageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId") || undefined;

  const {
    organizationId,
    recipientType,
    setRecipientType,
    recipientOptions,
    saveDraft,
    sendMessage,
  } = useAdminComposeMessage(draftId);

  // If editing an existing draft, load its content
  const { data: draftDetails, loading: loadingDraft } = useAdminCommunicationDetails(draftId || "");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<CommunicationChannel>("Operational");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [relatedEntityType, setRelatedEntityType] = useState<"Booking" | "Provider" | "Delivery Partner" | "none">("none");
  const [relatedEntityId, setRelatedEntityId] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Sync draft data if editing
  useEffect(() => {
    if (draftDetails?.message) {
      const m = draftDetails.message;
      setSubject(m.subject);
      setBody(m.body);
      setChannel(m.channel);
      setRecipientType(m.recipientType);
      setSelectedRecipientIds(m.recipientIds);
      if (m.relatedBookingId) {
        setRelatedEntityType("Booking");
        setRelatedEntityId(m.relatedBookingId);
      } else if (m.relatedProviderId) {
        setRelatedEntityType("Provider");
        setRelatedEntityId(m.relatedProviderId);
      } else if (m.relatedDeliveryPartnerId) {
        setRelatedEntityType("Delivery Partner");
        setRelatedEntityId(m.relatedDeliveryPartnerId);
      }
    }
  }, [draftDetails, setRecipientType]);

  const handleRecipientToggle = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
    setValidationError(null);
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipientIds.length === recipientOptions.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(recipientOptions.map((o: { id: string; name: string; info: string }) => o.id));
    }
    setValidationError(null);
  };

  const validateForm = () => {
    const parseResult = ComposeMessageSchema.safeParse({
      subject: subject.trim(),
      body: body.trim(),
      channel,
      recipientType,
      recipientIds: selectedRecipientIds,
      relatedEntityType: relatedEntityType !== "none" ? relatedEntityType : undefined,
      relatedEntityId: relatedEntityId.trim() || undefined,
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Please fix form errors.";
      setValidationError(firstError);
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSaveDraft = async () => {
    if (!subject.trim() && !body.trim()) {
      setValidationError("Draft must have at least a subject or body.");
      return;
    }

    try {
      setIsSavingDraft(true);
      setValidationError(null);
      await saveDraft({
        id: draftId,
        subject: subject.trim() || "Untitled Draft",
        body: body.trim(),
        channel,
        recipientType,
        recipientIds: selectedRecipientIds,
        relatedBookingId: relatedEntityType === "Booking" ? relatedEntityId : undefined,
        relatedProviderId: relatedEntityType === "Provider" ? relatedEntityId : undefined,
        relatedDeliveryPartnerId: relatedEntityType === "Delivery Partner" ? relatedEntityId : undefined,
      });
      router.push("/admin/communications/drafts");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      setValidationError(msg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleOpenSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleSendConfirmed = async () => {
    await sendMessage({
      id: draftId,
      subject: subject.trim(),
      body: body.trim(),
      channel,
      recipientType,
      recipientIds: selectedRecipientIds,
      relatedBookingId: relatedEntityType === "Booking" ? relatedEntityId : undefined,
      relatedProviderId: relatedEntityType === "Provider" ? relatedEntityId : undefined,
      relatedDeliveryPartnerId: relatedEntityType === "Delivery Partner" ? relatedEntityId : undefined,
    });
    router.push("/admin/communications");
  };

  if (draftId && loadingDraft) {
    return (
      <div className="p-6 space-y-4 animate-pulse max-w-3xl">
        <div className="w-32 h-6 bg-surface-container-high rounded" />
        <div className="h-96 bg-surface-container-high rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/communications"
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to communications"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                {draftId ? "Edit Operational Message Draft" : "Compose Operational Message"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                {organizationId}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Broadcast announcements, dispatch instructions, and merchant advisories.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSendConfirmation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleOpenSendConfirmation} className="space-y-5">
        <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Subject <span className="text-rose-500">* (5–150 chars)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., Urgent: Rain garment protection advisory for North sector"
              className="w-full px-3.5 py-2.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
            />
            <div className="text-right text-[10px] text-on-surface-variant font-mono mt-1">
              {subject.length}/150
            </div>
          </div>

          {/* Grid: Channel & Recipient Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Communication Channel <span className="text-rose-500">*</span>
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                className="w-full px-3 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {COMMUNICATION_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch} Channel
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Target Recipient Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value as RecipientType);
                  setSelectedRecipientIds([]);
                }}
                className="w-full px-3 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {RECIPIENT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipients Multi-Select Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Select Recipients ({recipientType}) <span className="text-rose-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={handleSelectAllRecipients}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                {selectedRecipientIds.length === recipientOptions.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto p-2.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipientOptions.map((opt: { id: string; name: string; info: string }) => {
                const isSelected = selectedRecipientIds.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleRecipientToggle(opt.id)}
                    className={`p-2 rounded-lg text-left border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-on-surface"
                        : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-on-surface text-[11px]">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {opt.id} • {opt.info}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-primary border-primary text-on-primary"
                          : "border-outline-variant/60"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-on-surface-variant mt-1 font-mono">
              Selected: {selectedRecipientIds.length} recipient{selectedRecipientIds.length === 1 ? "" : "s"}
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Message Body <span className="text-rose-500">* (10–2,000 chars)</span>
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Write detailed operational communication, shift instructions, guidelines, or notice content..."
              className="w-full p-3.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-none transition-colors"
            />
            <div className="text-right text-[10px] text-on-surface-variant font-mono mt-1">
              {body.length}/2000
            </div>
          </div>

          {/* Related Entity Attachment */}
          <div className="pt-3 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Attach Related Entity (Optional)
              </label>
              <select
                value={relatedEntityType}
                onChange={(e) => {
                  setRelatedEntityType(e.target.value as any);
                  setRelatedEntityId("");
                }}
                className="w-full px-3 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="none">None (General Communication)</option>
                <option value="Booking">Booking Order</option>
                <option value="Provider">Provider Facility</option>
                <option value="Delivery Partner">Delivery Valet</option>
              </select>
            </div>

            {relatedEntityType !== "none" && (
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Related {relatedEntityType} ID
                </label>
                <input
                  type="text"
                  value={relatedEntityId}
                  onChange={(e) => setRelatedEntityId(e.target.value)}
                  placeholder={`e.g., ${
                    relatedEntityType === "Booking"
                      ? "BKG-000001"
                      : relatedEntityType === "Provider"
                      ? "PRO-0001"
                      : "DEL-0001"
                  }`}
                  className="w-full px-3 py-2 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      <SendMessageConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        data={{
          subject,
          body,
          recipientType,
          recipientCount: selectedRecipientIds.length,
          channel,
        }}
        onConfirm={handleSendConfirmed}
      />
    </div>
  );
}
