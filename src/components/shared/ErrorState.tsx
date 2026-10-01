import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-error/30 bg-error-container/20 my-6"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-error mb-3 border border-error/40">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-error mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 border-error/30 hover:bg-error-container/30">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
