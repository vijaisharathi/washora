"use client";

import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleDatePickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function ScheduleDatePicker({
  selectedDate,
  onSelectDate,
}: ScheduleDatePickerProps) {
  const dates = [
    { label: "Yesterday", value: "2026-09-02", display: "Sep 02" },
    { label: "Today", value: "2026-09-03", display: "Sep 03 (Today)" },
    { label: "Tomorrow", value: "2026-09-04", display: "Sep 04" },
    { label: "Saturday", value: "2026-09-05", display: "Sep 05" },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 p-2 rounded-2xl bg-surface-container/70 border border-outline-variant/20">
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {dates.map((d) => {
          const isSelected = selectedDate === d.value;
          return (
            <button
              key={d.value}
              onClick={() => onSelectDate(d.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {d.display}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 text-xs text-on-surface-variant font-mono px-2">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span>{selectedDate}</span>
      </div>
    </div>
  );
}
