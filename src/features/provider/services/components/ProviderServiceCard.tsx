"use client";

import React from "react";
import Link from "next/link";
import { ProviderServiceItem } from "@/types/provider/services";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface ProviderServiceCardProps {
  service: ProviderServiceItem;
  onToggleStatus: (id: string) => Promise<any>;
  onDeleteClick: (service: ProviderServiceItem) => void;
  isToggling?: boolean;
}

export function ProviderServiceCard({
  service,
  onToggleStatus,
  onDeleteClick,
  isToggling,
}: ProviderServiceCardProps) {
  const isActive = service.status === "ACTIVE";

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case "shoes":
        return "Footwear Spa";
      case "laundry":
        return "Dry Cleaning";
      case "bags":
        return "Leather Care";
      case "helmets":
        return "Helmet Sanitization";
      case "vehicles":
        return "Steam Detailing";
      default:
        return "Care Service";
    }
  };

  return (
    <ProviderCard
      variant="container"
      className={`p-5 flex flex-col justify-between transition-all duration-200 border-l-4 ${
        isActive ? "border-l-primary" : "border-l-zinc-700 opacity-75"
      }`}
    >
      <div>
        {/* Top Meta: Icon + Category + Active Toggle */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary-container shadow-md shadow-primary/10"
                  : "bg-surface-variant text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{service.iconName}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {getCategoryName(service.category)}
              </span>
              <h3 className="text-base font-bold text-on-surface leading-snug line-clamp-1">
                {service.name}
              </h3>
            </div>
          </div>

          {/* Quick Active / Inactive Switch */}
          <button
            type="button"
            onClick={() => onToggleStatus(service.id)}
            disabled={isToggling}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
              isActive
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                : "bg-zinc-900 text-zinc-400 border-zinc-700/40"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
            <span>{isActive ? "Active" : "Inactive"}</span>
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {service.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-variant/80 text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Pricing + Duration + Action Buttons */}
      <div className="pt-3.5 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-on-surface">₹{service.price}</span>
          <span className="text-[10px] text-on-surface-variant">
            {service.durationMinutes}m duration • {service.turnaroundHours}h SLA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/provider/services/${service.id}/edit`}
            className="p-2 rounded-lg bg-surface-variant hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center border border-white/5"
            title="Edit Service"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </Link>

          <button
            type="button"
            onClick={() => onDeleteClick(service)}
            className="p-2 rounded-lg bg-error-container/20 hover:bg-error-container/40 text-error transition-colors flex items-center justify-center border border-error/20"
            title="Delete / Archive"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </ProviderCard>
  );
}
