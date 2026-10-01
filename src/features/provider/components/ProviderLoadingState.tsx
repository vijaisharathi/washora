import React from "react";
import { cn } from "@/lib/utils";

interface ProviderLoadingStateProps {
  message?: string;
  className?: string;
}

export function ProviderLoadingState({
  message = "Loading Studio Workspace...",
  className,
}: ProviderLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[300px] p-8 text-center",
        className
      )}
    >
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-on-surface">{message}</p>
      <p className="text-xs text-on-surface-variant mt-1">Connecting to partner services</p>
    </div>
  );
}
