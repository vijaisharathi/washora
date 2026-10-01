"use client";

import React from "react";
import { HandoverChecklist } from "@/types/provider/pickups";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface HandoverChecklistSectionProps {
  checklist: HandoverChecklist;
  itemDescription: string;
  onToggle: (key: keyof HandoverChecklist) => Promise<any>;
  isToggling: boolean;
}

export function HandoverChecklistSection({
  checklist,
  itemDescription,
  onToggle,
  isToggling,
}: HandoverChecklistSectionProps) {
  const items = [
    {
      key: "itemCountVerified" as const,
      label: "Item Count & Packaging Verified",
      subtext: itemDescription,
      checked: checklist.itemCountVerified,
    },
    {
      key: "packageSealed" as const,
      label: "Package Sealed & Tamper-Evident Tagged",
      subtext: "Tamper-evident seal and luxury dust bag intact",
      checked: checklist.packageSealed,
    },
    {
      key: "stagingAreaReady" as const,
      label: "Ready for Dispatch Handoff",
      subtext: "Placed in studio dispatch staging zone",
      checked: checklist.stagingAreaReady,
    },
  ];

  return (
    <ProviderCard variant="container" className="p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">checklist</span>
          <span>Handoff Preparation Checklist</span>
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Verify item condition and packaging integrity before handing over to the delivery partner.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.key}
            onClick={() => !isToggling && onToggle(item.key)}
            className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-white/5 cursor-pointer hover:border-white/20 transition-all group"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => {}} // Handled by container onClick
              disabled={isToggling}
              className="w-5 h-5 rounded border-white/20 text-primary bg-surface-dim focus:ring-primary focus:ring-offset-background"
            />
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold ${
                  item.checked ? "text-primary" : "text-on-surface"
                }`}
              >
                {item.label}
              </span>
              <span className="text-xs text-on-surface-variant">{item.subtext}</span>
            </div>
          </label>
        ))}
      </div>
    </ProviderCard>
  );
}
