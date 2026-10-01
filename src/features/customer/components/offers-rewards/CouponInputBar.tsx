"use client";

import React, { useState } from "react";
import { Tag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CouponInputBarProps {
  onApply: (code: string) => Promise<void>;
  isApplying: boolean;
  errorMessage?: string;
}

export function CouponInputBar({
  onApply,
  isApplying,
  errorMessage,
}: CouponInputBarProps) {
  const [inputCode, setInputCode] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setLocalError("Please enter a valid coupon code.");
      return;
    }

    setLocalError("");
    try {
      await onApply(inputCode.trim().toUpperCase());
      setInputCode("");
    } catch (err: any) {
      setLocalError(err?.message || "Invalid coupon code");
    }
  };

  return (
    <div className="space-y-2 max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              setLocalError("");
            }}
            placeholder="ENTER COUPON CODE"
            className="w-full bg-surface-container-low border border-white/10 rounded-xl py-2.5 pl-10 pr-3 font-mono text-xs sm:text-sm text-on-surface uppercase placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
          />
        </div>

        <Button
          type="submit"
          disabled={isApplying || !inputCode.trim()}
          className="text-xs font-bold px-5 shrink-0 shadow-lg shadow-primary/20"
        >
          {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </form>

      {(localError || errorMessage) && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{localError || errorMessage}</span>
        </p>
      )}
    </div>
  );
}
