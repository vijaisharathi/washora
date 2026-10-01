"use client";

import React, { useState } from "react";
import { useProviderProfile } from "@/features/provider/profile/hooks/useProviderProfile";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { ProviderStatusBadge } from "@/features/provider/components/ProviderStatusBadge";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { BusinessIdentitySection } from "./BusinessIdentitySection";
import { BusinessContactSection } from "./BusinessContactSection";
import { BusinessAddressSection } from "./BusinessAddressSection";
import { OperatingHoursSection } from "./OperatingHoursSection";
import { ServiceAreaSection } from "./ServiceAreaSection";

export function ProviderProfileOverview() {
  const {
    profile,
    isLoading,
    isError,
    updateIdentity,
    isUpdatingIdentity,
    updateContact,
    isUpdatingContact,
    updateAddress,
    isUpdatingAddress,
    updateHours,
    isUpdatingHours,
    updateServiceArea,
    isUpdatingServiceArea,
    uploadLogo,
    isUploadingLogo,
  } = useProviderProfile();

  const [activeTab, setActiveTab] = useState<"identity" | "contact" | "address" | "hours" | "area">("identity");

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Profile & Business Configuration..." />;
  }

  if (isError || !profile) {
    return <ProviderErrorState title="Unable to load provider profile" />;
  }

  const handleLogoUploadSimulated = async () => {
    const fakeFile = new File(["mock_logo"], "luxecare_logo_2026.png", { type: "image/png" });
    await uploadLogo(fakeFile);
  };

  const TABS = [
    { key: "identity", label: "Identity & Legal", icon: "domain" },
    { key: "contact", label: "Contact & Support", icon: "call" },
    { key: "address", label: "Studio Address", icon: "location_on" },
    { key: "hours", label: "Operating Shifts & SLA", icon: "schedule" },
    { key: "area", label: "Service Radius", icon: "share_location" },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header Banner Card */}
      <ProviderCard variant="high" className="p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={
                  profile.identity.logoUrl ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBsQH7VcP89Bk4dS23ANzW2pOIMnVOmSU-XEG61jIS6NVqOxRAoK_C2PkDHVLjZYbO-WcpVvtpy3BUu0SpVsqtSoU8Z5p4Nkmpi24XmqxNJNQ6FhU4A5dbPNqr9VKVThVAue9QvZK_17MThkexgZi3ur91-2-pr63F3RIjvgtU_EeYS-UAzRV9Fw_hpUXBZIE5nNvg0n-syfFT5vvHfIvKWHpGLdKHG2XTnnWeXg_j8HPWAgISRFylufQ"
                }
                alt={profile.identity.businessName}
                className="w-16 h-16 rounded-2xl object-cover border border-primary/30 shadow-lg shadow-primary/10"
              />
              <button
                type="button"
                onClick={handleLogoUploadSimulated}
                disabled={isUploadingLogo}
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold"
              >
                Change
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-on-surface">{profile.identity.businessName}</h2>
                <ProviderStatusBadge status="ACTIVE" />
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Provider ID: <span className="font-mono text-primary">{profile.providerCode}</span> • {profile.identity.legalEntityName}
              </p>
              <p className="text-xs text-on-surface-variant">
                {profile.address.locality}, {profile.address.city} • Servicing {profile.serviceArea.coverageRadiusKm} km radius
              </p>
            </div>
          </div>

          {/* Verification Status Pill */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-on-surface-variant">KYC Verification</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${profile.verification.overallProgressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">100%</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Certified Studio
            </span>
          </div>
        </div>
      </ProviderCard>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary-container shadow-md shadow-primary/20"
                  : "bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === "identity" && (
          <BusinessIdentitySection
            initialData={profile.identity}
            onSave={updateIdentity}
            isSaving={isUpdatingIdentity}
          />
        )}
        {activeTab === "contact" && (
          <BusinessContactSection
            initialData={profile.contact}
            onSave={updateContact}
            isSaving={isUpdatingContact}
          />
        )}
        {activeTab === "address" && (
          <BusinessAddressSection
            initialData={profile.address}
            onSave={updateAddress}
            isSaving={isUpdatingAddress}
          />
        )}
        {activeTab === "hours" && (
          <OperatingHoursSection
            initialData={profile.operatingHours}
            onSave={updateHours}
            isSaving={isUpdatingHours}
          />
        )}
        {activeTab === "area" && (
          <ServiceAreaSection
            initialData={profile.serviceArea}
            onSave={updateServiceArea}
            isSaving={isUpdatingServiceArea}
          />
        )}
      </div>
    </div>
  );
}
