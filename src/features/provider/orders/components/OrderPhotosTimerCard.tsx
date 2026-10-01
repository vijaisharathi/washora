"use client";

import React from "react";
import { ProviderOrderItem } from "@/types/provider/orders";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface OrderPhotosTimerCardProps {
  order: ProviderOrderItem;
}

export function OrderPhotosTimerCard({ order }: OrderPhotosTimerCardProps) {
  return (
    <div className="space-y-6">
      {/* Service Timer & Status Card */}
      <ProviderCard variant="container" className="p-6 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-on-surface">Service Status</h3>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-container/20 text-primary border border-primary/30">
            {order.status.replace("_", " ")}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-on-surface-variant">
            <span>Started At</span>
            <span className="font-semibold text-on-surface">{order.startedAt}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Expected Target</span>
            <span className="font-semibold text-primary">{order.expectedCompletion}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-1">
            <span>Treatment Completion</span>
            <span className="text-primary font-bold">{order.progressPercent}%</span>
          </div>
          <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${order.progressPercent}%` }}
            />
          </div>
        </div>
      </ProviderCard>

      {/* Item Intake Photos Card */}
      <ProviderCard variant="container" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-on-surface">Intake Documentation Photos</h3>
          <span className="text-xs text-on-surface-variant">{order.itemPhotos.length} Photos</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {order.itemPhotos.map((photo, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-xl bg-surface-container-high border border-white/10 overflow-hidden relative group"
            >
              <img
                src={photo}
                alt={`Care item photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </ProviderCard>
    </div>
  );
}
