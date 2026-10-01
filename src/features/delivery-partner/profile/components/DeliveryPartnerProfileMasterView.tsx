"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Bike,
  Clock,
  CreditCard,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Calendar,
  FileCheck2,
  FileBadge,
} from "lucide-react";
import { useDeliveryPartnerProfile } from "../hooks/useDeliveryPartnerProfile";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";
import { EditPersonalModal } from "./EditPersonalModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { EditShiftHubModal } from "./EditShiftHubModal";
import { EditBankModal } from "./EditBankModal";

export function DeliveryPartnerProfileMasterView() {
  const {
    profile,
    isLoading,
    updatePersonalInfo,
    isUpdatingPersonalInfo,
    updateVehicleInfo,
    isUpdatingVehicleInfo,
    updateShiftHub,
    isUpdatingShiftHub,
    updateBankInfo,
    isUpdatingBankInfo,
  } = useDeliveryPartnerProfile();

  const { partner, updateStatus } = useDeliveryPartnerSession();

  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editVehicleOpen, setEditVehicleOpen] = useState(false);
  const [editShiftHubOpen, setEditShiftHubOpen] = useState(false);
  const [editBankOpen, setEditBankOpen] = useState(false);

  if (isLoading || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-on-surface-variant">Loading valet partner profile...</p>
      </div>
    );
  }

  const isOnline = partner?.status === "ONLINE";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Hero Bento */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-primary/20 shrink-0 border-2 border-primary/30 shadow-md">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <ShieldCheck className="w-3 h-3" /> KYC Verified
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-2 flex-wrap">
                <span>Valet ID: <span className="text-on-surface font-mono font-semibold">{profile.id}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {profile.city}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-on-surface-variant" /> Joined Nov 2025</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Duty Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/20">
            <div className="text-center px-4 py-2 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
              <p className="text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
                {profile.rating} ★
              </p>
              <p className="text-[10px] text-on-surface-variant font-medium">CSAT Rating</p>
            </div>

            <div className="text-center px-4 py-2 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
              <p className="text-xs font-mono font-bold text-primary">
                {profile.totalDeliveries}
              </p>
              <p className="text-[10px] text-on-surface-variant font-medium">Trips Fulfilled</p>
            </div>

            <button
              onClick={() => updateStatus(isOnline ? "OFFLINE" : "ONLINE")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm ${
                isOnline
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:text-on-surface"
              }`}
            >
              {isOnline ? "Duty: Online" : "Duty: Offline"}
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: Personal & Contact Information */}
        <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Personal & Contact Info</h2>
                <p className="text-[11px] text-on-surface-variant">Legal identity and emergency contact</p>
              </div>
            </div>
            <button
              onClick={() => setEditPersonalOpen(true)}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
              title="Edit Personal Information"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Mobile Phone</span>
              <p className="font-mono text-on-surface font-semibold flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-primary/70" /> {profile.phone}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Valet Email</span>
              <p className="text-on-surface font-semibold flex items-center gap-1 mt-0.5 truncate">
                <Mail className="w-3 h-3 text-primary/70" /> {profile.email}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Aadhaar / National ID</span>
              <p className="font-mono text-on-surface font-semibold mt-0.5">
                {profile.aadhaarOrDlNumber}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Date of Birth</span>
              <p className="font-mono text-on-surface font-semibold mt-0.5">{profile.dob}</p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Residential Address</span>
              <p className="text-on-surface font-medium mt-0.5">{profile.address}</p>
            </div>

            <div className="sm:col-span-2 p-3 rounded-2xl bg-surface-container-high/60 border border-outline-variant/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Emergency Contact</span>
                <p className="text-on-surface font-semibold">{profile.emergencyContactName}</p>
              </div>
              <span className="font-mono text-xs text-primary font-bold">{profile.emergencyContactPhone}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Vehicle & Transit Setup */}
        <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Vehicle & License Setup</h2>
                <p className="text-[11px] text-on-surface-variant">Assigned transit asset and driving permit</p>
              </div>
            </div>
            <button
              onClick={() => setEditVehicleOpen(true)}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
              title="Edit Vehicle Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Vehicle Model</span>
              <p className="text-on-surface font-bold mt-0.5">{profile.vehicleModel}</p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">License Plate Number</span>
              <p className="font-mono font-bold text-primary mt-0.5">{profile.vehiclePlate}</p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Vehicle Classification</span>
              <p className="text-on-surface font-medium mt-0.5">{profile.vehicleType.replace("_", " ")}</p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Driving License No.</span>
              <p className="font-mono text-on-surface font-semibold mt-0.5">{profile.drivingLicenseNumber}</p>
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-on-surface truncate">RC Registration</p>
                  <p className="text-[10px] text-emerald-400">Verified Asset</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-on-surface truncate">Driving License</p>
                  <p className="text-[10px] text-emerald-400">Expires {profile.dlExpiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Shift & Service Hub */}
        <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Shift & Service Hub</h2>
                <p className="text-[11px] text-on-surface-variant">Operational zone and dispatch availability</p>
              </div>
            </div>
            <button
              onClick={() => setEditShiftHubOpen(true)}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
              title="Edit Shift & Hub Settings"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Assigned Hub</span>
              <p className="text-on-surface font-bold flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.hubName}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Preferred Shift</span>
              <p className="text-on-surface font-semibold mt-0.5">{profile.preferredShift.replace(/_/g, " ")}</p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Operational Service Radius</span>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-bold font-mono text-primary">{profile.serviceRadiusKm} km coverage</p>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Dispatch Zone
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Bank Settlement Account */}
        <div className="p-6 rounded-3xl bg-surface-container/70 border border-outline-variant/25 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Payout Settlement Escrow</h2>
                <p className="text-[11px] text-on-surface-variant">Direct bank transfer and instant UPI payouts</p>
              </div>
            </div>
            <button
              onClick={() => setEditBankOpen(true)}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
              title="Edit Bank Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Beneficiary Name</span>
              <p className="text-on-surface font-bold mt-0.5">{profile.accountHolderName}</p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Bank Name</span>
              <p className="text-on-surface font-semibold mt-0.5">{profile.bankName}</p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Account Number</span>
              <p className="font-mono text-on-surface font-semibold mt-0.5">
                •••• •••• {profile.accountNumber.slice(-4)}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">IFSC Code</span>
              <p className="font-mono text-on-surface font-semibold mt-0.5">{profile.ifscCode}</p>
            </div>

            <div className="sm:col-span-2 p-3 rounded-2xl bg-surface-container-high/60 border border-outline-variant/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Instant UPI ID</span>
                <p className="font-mono text-xs text-primary font-bold mt-0.5">{profile.upiId}</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">✓ Verified Payout Node</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditPersonalModal
        profile={profile}
        isOpen={editPersonalOpen}
        onClose={() => setEditPersonalOpen(false)}
        onSave={updatePersonalInfo}
        isSaving={isUpdatingPersonalInfo}
      />

      <EditVehicleModal
        profile={profile}
        isOpen={editVehicleOpen}
        onClose={() => setEditVehicleOpen(false)}
        onSave={updateVehicleInfo}
        isSaving={isUpdatingVehicleInfo}
      />

      <EditShiftHubModal
        profile={profile}
        isOpen={editShiftHubOpen}
        onClose={() => setEditShiftHubOpen(false)}
        onSave={updateShiftHub}
        isSaving={isUpdatingShiftHub}
      />

      <EditBankModal
        profile={profile}
        isOpen={editBankOpen}
        onClose={() => setEditBankOpen(false)}
        onSave={updateBankInfo}
        isSaving={isUpdatingBankInfo}
      />
    </div>
  );
}
