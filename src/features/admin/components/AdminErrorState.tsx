import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function AdminErrorState({
  title = "Operational Error",
  message = "Failed to synchronize operational state. Please try again.",
  onRetry,
}: AdminErrorStateProps) {
  return (
    <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-surface-container-low border border-critical/20 rounded-2xl text-center space-y-3">
      <div className="w-10 h-10 rounded-xl bg-critical/15 text-critical flex items-center justify-center">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      <p className="text-xs text-on-surface-variant max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-highest flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Action</span>
        </button>
      )}
    </div>
  );
}
