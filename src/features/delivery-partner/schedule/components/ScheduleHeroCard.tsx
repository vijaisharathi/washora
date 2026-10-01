"use client";

import React from "react";
import { Clock, MapPin, CheckCircle2, Navigation, Route, Sparkles } from "lucide-react";
import { DeliveryPartnerDaySchedule } from "@/types/delivery-partner";

interface ScheduleHeroCardProps {
  schedule: DeliveryPartnerDaySchedule;
}

export function ScheduleHeroCard({ schedule }: ScheduleHeroCardProps) {
  const percentComplete =
    schedule.totalStops > 0
      ? Math.round((schedule.completedStops / schedule.totalStops) * 100)
      : 0;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface border border-outline-variant/30 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/20">
              Active Shift Schedule
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">
              {schedule.hubName}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            {schedule.shiftName}
          </h1>
          <p className="text-xs text-on-surface-variant flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Shift Window: <strong className="text-on-surface">{schedule.shiftHours}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right p-3 rounded-2xl bg-surface-container-high/80 border border-outline-variant/20">
            <span className="text-lg md:text-xl font-mono font-extrabold text-primary">
              {schedule.completedStops} / {schedule.totalStops}
            </span>
            <p className="text-[10px] text-on-surface-variant font-medium">Stops Completed</p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Key Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-on-surface">Daily Route Completion</span>
          <span className="font-mono font-bold text-primary">{percentComplete}%</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden p-0.5 border border-outline-variant/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-purple-400 to-emerald-400 transition-all duration-500 shadow-sm"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-surface/70 border border-outline-variant/15">
            <span className="text-[10px] text-on-surface-variant font-semibold">Remaining</span>
            <p className="font-mono font-bold text-amber-400 text-sm">{schedule.remainingStops} Stops</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-surface/70 border border-outline-variant/15">
            <span className="text-[10px] text-on-surface-variant font-semibold">Completed</span>
            <p className="font-mono font-bold text-emerald-400 text-sm">{schedule.completedStops} Stops</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-surface/70 border border-outline-variant/15">
            <span className="text-[10px] text-on-surface-variant font-semibold">Total Distance</span>
            <p className="font-mono font-bold text-purple-400 text-sm">{schedule.totalDistanceKm} km</p>
          </div>
        </div>
      </div>
    </div>
  );
}
