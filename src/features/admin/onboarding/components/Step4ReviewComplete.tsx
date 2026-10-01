"use client";

import React from "react";
import {
  User,
  Building2,
  Sliders,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import { AdminOnboardingData } from "@/types/admin";

interface Step4ReviewCompleteProps {
  data: AdminOnboardingData;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

export function Step4ReviewComplete({
  data,
  onBack,
  onComplete,
  isSubmitting,
}: Step4ReviewCompleteProps) {
  const formatOrgType = (type: string) => {
    switch (type) {
      case "washora":
        return "WASHORA Corporate";
      case "partner":
        return "Partner Organization";
      case "internal-operations":
        return "Internal Operations";
      default:
        return type;
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case "administrator":
        return "Administrator";
      case "operations-manager":
        return "Operations Manager";
      case "operations-executive":
        return "Operations Executive";
      default:
        return role;
    }
  };

  const formatArea = (area: string) => {
    switch (area) {
      case "customer-operations":
        return "Customer Operations";
      case "provider-operations":
        return "Provider Operations";
      case "delivery-operations":
        return "Delivery Operations";
      case "platform-operations":
        return "Platform Operations";
      default:
        return area;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant/20 pb-4">
        <h2 className="text-lg font-bold text-on-surface">Step 4 — Review & Complete</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Please review your administrative profile and organization configuration before activating your console access.
        </p>
      </div>

      <div className="space-y-4">
        {/* Section 1: Personal Information */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
              {data.profileImage ? (
                <img
                  src={data.profileImage}
                  alt={data.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-on-surface-variant" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 text-xs">
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                  Full Name
                </span>
                <span className="font-semibold text-on-surface">{data.fullName}</span>
              </div>

              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                  Work Email
                </span>
                <span className="font-semibold text-on-surface font-mono">{data.workEmail}</span>
              </div>

              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                  Phone Number
                </span>
                <span className="font-semibold text-on-surface font-mono">{data.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Organization Information */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Organization Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Organization Name
              </span>
              <span className="font-semibold text-on-surface">{data.organizationName}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Contact Email
              </span>
              <span className="font-semibold text-on-surface font-mono">{data.organizationEmail}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Phone
              </span>
              <span className="font-semibold text-on-surface font-mono">{data.organizationPhone}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Entity Type
              </span>
              <span className="font-semibold text-primary">{formatOrgType(data.organizationType)}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Role & Preferences */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Role & Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Assigned Role
              </span>
              <span className="font-semibold text-on-surface">{formatRole(data.role)}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Primary Domain
              </span>
              <span className="font-semibold text-on-surface">{formatArea(data.primaryWorkArea)}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Language
              </span>
              <span className="font-semibold text-on-surface uppercase font-mono">
                {data.preferredLanguage}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant block uppercase font-mono">
                Timezone
              </span>
              <span className="font-semibold text-on-surface font-mono">{data.timezone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Callout */}
      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-on-surface-variant">
          Clicking <strong className="text-on-surface">Complete Setup</strong> will activate your administrative credentials and redirect you directly to the Lumina Admin Console.
        </p>
      </div>

      {/* Actions */}
      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="py-2.5 px-5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs flex items-center gap-2 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className="py-2.5 px-6 rounded-xl bg-success text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-success/90 transition-all shadow-md shadow-success/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              <span>Activating Access...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
