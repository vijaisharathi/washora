"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, UserCheck, ExternalLink, Bike, MapPin } from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";

export function AccountIdentityCard() {
  const { partner } = useDeliveryPartnerSession();

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-primary/20 shrink-0 border border-primary/30">
            {partner?.avatarUrl ? (
              <Image
                src={partner.avatarUrl}
                alt={partner.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-base text-primary">
                {partner?.name?.charAt(0) || "V"}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base md:text-lg font-bold text-on-surface">
                {partner?.name || "Vikram Singh"}
              </h1>
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                <ShieldCheck className="w-3 h-3" /> KYC Verified
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Partner ID: {partner?.id || "dp-1"} • {partner?.phone || "+91 98765 43210"}
            </p>
          </div>
        </div>

        <Link
          href="/delivery-partner/profile"
          className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Edit Profile & Vehicle (D2)</span>
          <ExternalLink className="w-3 h-3 text-on-surface-variant" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-0.5">
          <span className="text-[10px] uppercase font-semibold text-on-surface-variant">Vehicle Plate</span>
          <p className="font-mono font-bold text-on-surface flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-primary" /> {partner?.vehiclePlate || "KA-01-EV-4289"}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-0.5">
          <span className="text-[10px] uppercase font-semibold text-on-surface-variant">Assigned Hub</span>
          <p className="font-bold text-on-surface truncate flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" /> {partner?.hubName || "Bengaluru Central Hub"}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-surface border border-outline-variant/15 space-y-0.5">
          <span className="text-[10px] uppercase font-semibold text-on-surface-variant">Joined Platform</span>
          <p className="font-mono text-on-surface-variant">{partner?.joinedDate || "15 Jan 2025"}</p>
        </div>
      </div>
    </div>
  );
}
