"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, Check, X } from "lucide-react";
import { ReportDateRange, REPORT_DATE_RANGES } from "@/types/admin/analytics";

interface DateRangeSelectorProps {
  dateRange: ReportDateRange;
  startDate: string;
  endDate: string;
  onSelectPreset: (preset: ReportDateRange) => void;
  onApplyCustomRange: (startDate: string, endDate: string) => void;
}

export function DateRangeSelector({
  dateRange,
  startDate,
  endDate,
  onSelectPreset,
  onApplyCustomRange,
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const [customError, setCustomError] = useState<string | null>(null);

  const activePresetLabel =
    REPORT_DATE_RANGES.find((r) => r.value === dateRange)?.label || "Select Range";

  const handleSelect = (preset: ReportDateRange) => {
    setIsOpen(false);
    if (preset === "custom") {
      setIsCustomModalOpen(true);
    } else {
      onSelectPreset(preset);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setCustomError("Both start and end dates are required.");
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setCustomError("Start date cannot be after end date.");
      return;
    }
    setCustomError(null);
    onApplyCustomRange(customStart, customEnd);
    setIsCustomModalOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Preset Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
      >
        <Calendar className="w-4 h-4 text-primary" />
        <span>{activePresetLabel}</span>
        {dateRange === "custom" && (
          <span className="text-[11px] text-on-surface-variant font-mono">
            ({startDate} to {endDate})
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
              Timeframe Presets
            </div>
            {REPORT_DATE_RANGES.map((preset) => {
              const isSelected = dateRange === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleSelect(preset.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Custom Range Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xl p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-on-surface">Select Custom Range</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {customError && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {customError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-outline-variant/30 text-xs font-medium text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-90"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
