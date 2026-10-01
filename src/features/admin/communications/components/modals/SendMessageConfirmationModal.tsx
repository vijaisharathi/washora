"use client";

import React, { useState } from "react";
import {
  Send,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import { RecipientType, CommunicationChannel } from "@/types/admin/notification";

interface SendMessageConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    subject: string;
    body: string;
    recipientType: RecipientType;
    recipientCount: number;
    channel: CommunicationChannel;
  };
  onConfirm: () => Promise<any>;
}

export function SendMessageConfirmationModal({
  isOpen,
  onClose,
  data,
  onConfirm,
}: SendMessageConfirmationModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    try {
      setIsSending(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Confirm Message Broadcast</h2>
              <p className="text-[11px] text-on-surface-variant font-mono">{data.channel} Channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/30 mb-4 text-xs space-y-2">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Subject</span>
            <p className="font-semibold text-on-surface text-xs mt-0.5">{data.subject}</p>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-on-surface-variant">
            <span>Target Group: <strong className="text-on-surface">{data.recipientType}</strong></span>
            <span className="font-mono bg-surface-container-high px-2 py-0.5 rounded text-primary font-bold">
              {data.recipientCount} Recipient{data.recipientCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="pt-2 border-t border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Message Preview</span>
            <p className="text-on-surface-variant italic line-clamp-3 mt-0.5">&ldquo;{data.body}&rdquo;</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Review & Edit
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Broadcasting..." : "Confirm & Send"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
