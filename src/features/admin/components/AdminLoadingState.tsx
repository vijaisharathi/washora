import React from "react";

interface AdminLoadingStateProps {
  message?: string;
}

export function AdminLoadingState({
  message = "Loading administrative data...",
}: AdminLoadingStateProps) {
  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center p-8 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
      <div className="w-9 h-9 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-on-surface-variant animate-pulse font-mono tracking-wide">
        {message}
      </p>
    </div>
  );
}
