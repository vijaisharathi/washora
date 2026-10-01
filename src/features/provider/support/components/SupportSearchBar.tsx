"use client";

import React from "react";

interface SupportSearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export function SupportSearchBar({ value, onChange }: SupportSearchBarProps) {
  return (
    <div className="relative max-w-2xl w-full">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search FAQs, guidelines, or support articles..."
        className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant"
      />
    </div>
  );
}
