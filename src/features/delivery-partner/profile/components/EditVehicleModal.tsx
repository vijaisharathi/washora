"use client";

import React, { useState } from "react";
import { X, Bike, AlertCircle, Save } from "lucide-react";
import { DeliveryPartnerFullProfile, UpdateVehicleInfoPayload, VehicleType } from "@/types/delivery-partner";

interface EditVehicleModalProps {
  profile: DeliveryPartnerFullProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: UpdateVehicleInfoPayload) => Promise<unknown>;
  isSaving: boolean;
}

export function EditVehicleModal({
  profile,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditVehicleModalProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType>(profile.vehicleType);
  const [vehicleModel, setVehicleModel] = useState(profile.vehicleModel);
  const [vehiclePlate, setVehiclePlate] = useState(profile.vehiclePlate);
  const [dlNumber, setDlNumber] = useState(profile.drivingLicenseNumber);
  const [dlExpiry, setDlExpiry] = useState(profile.dlExpiryDate);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!vehicleModel.trim() || !vehiclePlate.trim() || !dlNumber.trim()) {
      setErrorMsg("Please fill in all vehicle and license details.");
      return;
    }

    try {
      await onSave({
        vehicleType,
        vehicleModel,
        vehiclePlate: vehiclePlate.toUpperCase(),
        drivingLicenseNumber: dlNumber.toUpperCase(),
        dlExpiryDate: dlExpiry,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update vehicle details. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Edit Vehicle & License Details</h2>
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
              <label className="text-xs font-semibold text-on-surface-variant">Vehicle Classification</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="ELECTRIC_BIKE">Electric Bike (EV)</option>
                <option value="SCOOTER">Scooter / Moped</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="VAN">Light Cargo Van</option>
                <option value="BICYCLE">Bicycle</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Make & Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Ather 450X Pro"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">License Plate Number</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="KA-01-EV-4289"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Driving License Number</label>
                <input
                  type="text"
                  value={dlNumber}
                  onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                  placeholder="KA-01-2018-0094821"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">DL Expiry Date</label>
                <input
                  type="date"
                  value={dlExpiry}
                  onChange={(e) => setDlExpiry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  required
                />
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
                  <span>Save Vehicle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
