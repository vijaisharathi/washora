"use client";

import React from "react";
import { ServiceItem, ProviderSummary, ServiceVariant } from "@/types/customer";
import { Plus, Minus, CheckCircle2, Sparkles } from "lucide-react";

interface BookingServiceStepProps {
  service: ServiceItem;
  provider?: ProviderSummary;
  selectedVariantId?: string;
  onSelectVariant: (variantId: string) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export function BookingServiceStep({
  service,
  provider,
  selectedVariantId,
  onSelectVariant,
  quantity,
  onQuantityChange,
}: BookingServiceStepProps) {
  return (
    <div className="space-y-6">
      {/* Service Header Banner */}
      <div className="bg-surface-container border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-3xl">dry_cleaning</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface font-headline">
              {service.name}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Studio: {provider?.businessName || "Certified Studio Partner"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-medium text-on-surface-variant block">Starting at</span>
          <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
            ₹{service.basePrice}
          </span>
        </div>
      </div>

      {/* Finishing Variants Selector */}
      {service.variants && service.variants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Select Care Package / Treatment Level</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.variants.map((v) => {
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
                      Turnaround: {v.turnaroundHours} hrs
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
      )}

      {/* Quantity Selector */}
      <div className="bg-surface-container border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div>
          <h4 className="font-bold text-sm text-on-surface">Total Item Count / Pairs</h4>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Specify how many pieces/garments for this order.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low border border-white/10 rounded-xl p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="font-bold text-sm text-on-surface w-6 text-center font-mono">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(20, quantity + 1))}
            disabled={quantity >= 20}
            className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
