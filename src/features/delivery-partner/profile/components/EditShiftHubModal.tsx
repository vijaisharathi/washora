"use client";

import React, { useState } from "react";
import { X, Clock, MapPin, AlertCircle, Save } from "lucide-react";
import { DeliveryPartnerFullProfile, UpdateShiftHubPayload } from "@/types/delivery-partner";

interface EditShiftHubModalProps {
  profile: DeliveryPartnerFullProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: UpdateShiftHubPayload) => Promise<unknown>;
  isSaving: boolean;
}

export function EditShiftHubModal({
  profile,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditShiftHubModalProps) {
  const [preferredShift, setPreferredShift] = useState(profile.preferredShift);
  const [hubName, setHubName] = useState(profile.hubName);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(profile.serviceRadiusKm);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hubName.trim()) {
      setErrorMsg("Please provide your assigned logistics hub name.");
      return;
    }

    try {
      await onSave({
        preferredShift,
        hubName,
        serviceRadiusKm: Number(serviceRadiusKm),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update shift and hub settings.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Edit Shift & Dispatch Zone</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Preferred Dispatch Shift</label>
              <select
                value={preferredShift}
                onChange={(e) =>
                  setPreferredShift(e.target.value as "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE_FULL_DAY")
                }
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="FLEXIBLE_FULL_DAY">Flexible Full Day (08:00 - 20:00)</option>
                <option value="MORNING">Morning Peak Shift (07:00 - 14:00)</option>
                <option value="EVENING">Evening Express Shift (14:00 - 21:00)</option>
                <option value="NIGHT">Late Night Rush (20:00 - 02:00)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Assigned Fulfillment Hub</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-on-surface-variant/60 absolute left-3 top-3" />
                <input
                  type="text"
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  placeholder="e.g. Indiranagar Hub #04"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-on-surface-variant">Max Service Radius</label>
                <span className="font-mono font-bold text-primary">{serviceRadiusKm} km</span>
              </div>
              <input
                type="range"
                min={3}
                max={20}
                step={0.5}
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>3 km (Hyperlocal)</span>
                <span>20 km (City Express)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Shift & Zone</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
