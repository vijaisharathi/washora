"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = value.split("").slice(0, length);
    while (arr.length < length) arr.push("");
    return arr;
  });

  useEffect(() => {
    const arr = value.split("").slice(0, length);
    while (arr.length < length) arr.push("");
    setDigits(arr);
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    const combined = nextDigits.join("");
    onChange(combined);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < length; i++) {
      nextDigits[i] = pastedData[i] || "";
    }
    setDigits(nextDigits);
    onChange(nextDigits.join(""));

    const nextFocusIndex = Math.min(pastedData.length, length - 1);
    inputsRef.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex justify-between gap-2 sm:gap-3 w-full max-w-[360px]" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={cn(
              "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border bg-surface text-on-surface transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50",
              error
                ? "border-error focus:ring-error"
                : digits[i]
                ? "border-primary/60 bg-surface-container"
                : "border-white/10"
            )}
            placeholder="·"
          />
        ))}
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
