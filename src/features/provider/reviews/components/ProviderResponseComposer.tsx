"use client";

import React, { useState } from "react";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProviderResponseComposerProps {
  initialResponse?: string;
  customerName: string;
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ProviderResponseComposer({
  initialResponse = "",
  customerName,
  onSubmit,
  isSubmitting,
}: ProviderResponseComposerProps) {
  const [response, setResponse] = useState(initialResponse);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) {
      setErrorMsg("Response message cannot be empty.");
      return;
    }
    setErrorMsg("");
    await onSubmit(response.trim());
  };

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="material-symbols-outlined text-primary text-xl">reply</span>
        <h3 className="text-lg font-bold text-on-surface">Studio Official Response</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <textarea
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={`Draft your public reply to ${customerName}. This will be visible on your verified studio profile...`}
            required
            className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl p-4 border border-white/10 focus:border-primary outline-none resize-none leading-relaxed"
          />
          {errorMsg && <p className="text-xs text-error font-medium">{errorMsg}</p>}
        </div>

        {/* Guidelines Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="p-3 rounded-xl bg-surface-container-high/60 border border-white/5 flex-1 max-w-md">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">info</span>
              <span>Communication Guidelines</span>
            </span>
            <div className="flex flex-wrap gap-x-3 text-[11px] text-on-surface-variant">
              <span>• Professional</span>
              <span>• Respectful</span>
              <span>• Solution-focused</span>
              <span>• Concise</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{isSubmitting ? "Posting..." : "Post Response"}</span>
            </button>
          </div>
        </div>
      </form>
    </ProviderCard>
  );
}
