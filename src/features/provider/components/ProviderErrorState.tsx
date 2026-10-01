import React from "react";
import { cn } from "@/lib/utils";

interface ProviderErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ProviderErrorState({
  title = "Failed to load studio data",
  message = "An unexpected error occurred while communicating with the partner gateway. Please check your connection and try again.",
  onRetry,
  className,
}: ProviderErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center rounded-xl bg-error-container/10 border border-error/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center mb-3 text-error border border-error/30">
        <span className="material-symbols-outlined text-2xl">error_outline</span>
      </div>
      <h3 className="text-base font-semibold text-error mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-md mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface text-sm font-medium border border-white/10 transition-colors"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}
