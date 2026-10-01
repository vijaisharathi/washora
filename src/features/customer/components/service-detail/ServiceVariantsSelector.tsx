"use client";

import React from "react";
import { ServiceVariant } from "@/types/customer";
import { CheckCircle2, Sparkles } from "lucide-react";

interface ServiceVariantsSelectorProps {
  variants: ServiceVariant[];
  selectedVariantId: string;
  onSelectVariant: (variantId: string) => void;
}

export function ServiceVariantsSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
}: ServiceVariantsSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface uppercase tracking-wider">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Finishing &amp; Treatment Options</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((v) => {
          const isSelected = selectedVariantId === v.id;
          return (
            <div
              key={v.id}
              onClick={() => onSelectVariant(v.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 shadow-md ${
                isSelected
                  ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                  : "bg-surface-container border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-on-surface block truncate">
                  {v.name}
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  Est. {v.turnaroundHours} hrs turnaround
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-sm text-primary">₹{v.price}</span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
