"use client";

import React from "react";
import { DeliveryPartnerSnapshot, ProviderPickupStatus } from "@/types/provider/pickups";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface AssignedPartnerCardProps {
  partner?: DeliveryPartnerSnapshot;
  status: ProviderPickupStatus;
  availablePartners: DeliveryPartnerSnapshot[];
  onAssignPartner: (partnerId: string) => Promise<any>;
  onConfirmHandoffClick: () => void;
  isAssigning: boolean;
}

export function AssignedPartnerCard({
  partner,
  status,
  availablePartners,
  onAssignPartner,
  onConfirmHandoffClick,
  isAssigning,
}: AssignedPartnerCardProps) {
  const isHandedOver = status === "HANDED_OVER";

  return (
    <ProviderCard
      variant="container"
      className="p-6 space-y-4 border-t-2 border-t-primary/40 relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-base font-bold text-on-surface">Assigned Valet Partner</h3>
        {partner?.arrivalEtaMinutes && !isHandedOver && (
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded border border-primary/20">
            Arriving in ~{partner.arrivalEtaMinutes}m
          </span>
        )}
      </div>

      {partner ? (
        <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-xl border border-white/5">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-white/10 text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">
              {partner.vehicleType === "Express Van"
                ? "local_shipping"
                : partner.vehicleType === "Electric Scooter"
                ? "electric_scooter"
                : "two_wheeler"}
            </span>
          </div>

          <div className="flex flex-col flex-1">
            <span className="text-base font-bold text-on-surface">{partner.name}</span>
            <span className="text-xs text-on-surface-variant font-mono">{partner.phone}</span>
            <span className="text-[11px] text-primary/80 mt-0.5">
              {partner.vehicleType} • {partner.vehicleNumber}
            </span>
          </div>

          <a
            href={`tel:${partner.phone}`}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-bright flex items-center justify-center border border-white/10 text-primary transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            No valet assigned yet. Select an active nearby dispatch partner:
          </p>
          <div className="space-y-2">
            {availablePartners.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={isAssigning}
                onClick={() => onAssignPartner(p.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                  <div>
                    <span className="text-xs font-bold text-on-surface block">{p.name}</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {p.vehicleType} • ETA ~{p.arrivalEtaMinutes}m
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">Assign</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation CTA */}
      {!isHandedOver && partner && (
        <button
          type="button"
          onClick={onConfirmHandoffClick}
          className="w-full mt-3 bg-primary text-on-primary py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>Confirm Handoff</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      )}
    </ProviderCard>
  );
}
