"use client";

import React, { useState } from "react";
import { ProviderServiceAreaConfig } from "@/types/provider/profile";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ServiceAreaSectionProps {
  initialData?: ProviderServiceAreaConfig;
  onSave: (data: Partial<ProviderServiceAreaConfig>) => Promise<any>;
  isSaving: boolean;
}

export function ServiceAreaSection({
  initialData,
  onSave,
  isSaving,
}: ServiceAreaSectionProps) {
  const [successMsg, setSuccessMsg] = useState(false);
  const [radius, setRadius] = useState(initialData?.coverageRadiusKm || 8);
  const [expressPickup, setExpressPickup] = useState(initialData?.expressPickupAvailable ?? true);
  const [localities, setLocalities] = useState<string[]>(
    initialData?.servicedLocalities || ["Indiranagar", "Domlur", "Koramangala", "Ulsoor", "HAL Layout"]
  );
  const [newLocality, setNewLocality] = useState("");

  const addLocality = () => {
    if (!newLocality.trim()) return;
    if (!localities.includes(newLocality.trim())) {
      setLocalities([...localities, newLocality.trim()]);
    }
    setNewLocality("");
  };

  const removeLocality = (loc: string) => {
    setLocalities(localities.filter((l) => l !== loc));
  };

  const handleSave = async () => {
    await onSave({
      coverageRadiusKm: radius,
      expressPickupAvailable: expressPickup,
      servicedLocalities: localities,
      servicedPostalCodes: ["560038", "560008", "560075", "560001", "560025"],
    });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <ProviderCard variant="container" className="p-6">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Service Radius & Delivery Coverage</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure geographic bounds for doorstep valet pickups and customer marketplace visibility.
          </p>
        </div>
        {successMsg && (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Saved
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Coverage Slider */}
        <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface">Radial Coverage Zone</span>
            <span className="text-sm font-bold text-primary">{radius} km Radius</span>
          </div>
          <input
            type="range"
            min={1}
            max={25}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[10px] text-on-surface-variant">
            <span>1 km (Neighborhood)</span>
            <span>12 km (Sub-District)</span>
            <span>25 km (Metro Hub)</span>
          </div>
        </div>

        {/* Localities Tags */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant block">Covered Key Neighborhoods</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {localities.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-surface-variant text-on-surface border border-white/5"
              >
                <span>{loc}</span>
                <button
                  type="button"
                  onClick={() => removeLocality(loc)}
                  className="hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add locality (e.g. Whitefield)"
              value={newLocality}
              onChange={(e) => setNewLocality(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLocality();
                }
              }}
              className="flex-1 bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2 border border-transparent focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={addLocality}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/10"
            >
              Add Zone
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Service Area</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ProviderCard>
  );
}
