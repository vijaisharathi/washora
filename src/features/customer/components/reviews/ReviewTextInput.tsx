"use client";

import React from "react";

interface ReviewTextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function ReviewTextInput({
  value,
  onChange,
  maxLength = 500,
}: ReviewTextInputProps) {
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={5}
        placeholder="Share details of your experience, care quality, or turnaround time..."
        className="w-full bg-surface-container-low border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none leading-relaxed shadow-inner"
      />

      <div className="flex justify-end">
        <span className="text-[11px] text-on-surface-variant font-mono">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
