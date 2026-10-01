"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServiceCategory } from "@/types/customer";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface AdvancedFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  onApply: () => void;
  onReset: () => void;
}

export function AdvancedFilterDialog({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onMaxPriceChange,
  onApply,
  onReset,
}: AdvancedFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-container border border-white/10 p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <span>Advanced Service Filters</span>
          </DialogTitle>
        </DialogHeader>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface block">
            Service Department
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-low text-on-surface-variant border-white/5 hover:border-primary/40"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCategory(c.slug)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all truncate ${
                  selectedCategory === c.slug
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-low text-on-surface-variant border-white/5 hover:border-primary/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-on-surface">Maximum Budget</span>
            <span className="font-bold text-primary text-sm font-mono">₹{maxPrice}</span>
          </div>
          <input
            type="range"
            min="99"
            max="1500"
            step="50"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
            <span>₹99</span>
            <span>₹1,500+</span>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-white/5">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApply();
              onOpenChange(false);
            }}
            className="text-xs font-semibold"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
