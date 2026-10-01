"use client";

import React from "react";
import { AvailableDateItem, BookingTimeSlot } from "@/types/customer/booking";
import { Calendar, Clock, CheckCircle2, Ban } from "lucide-react";

interface BookingScheduleStepProps {
  dates: AvailableDateItem[];
  selectedDateId: string;
  onSelectDate: (dateId: string) => void;
  slots: BookingTimeSlot[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
}

export function BookingScheduleStep({
  dates,
  selectedDateId,
  onSelectDate,
  slots,
  selectedSlotId,
  onSelectSlot,
}: BookingScheduleStepProps) {
  return (
    <div className="space-y-8">
      {/* Date Selection matching Stitch anything_clean_pickup_date_selection */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Select Pickup Date</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {dates.map((d) => {
            const isSelected = selectedDateId === d.id;
            const isFullyBooked = d.status === "FULLY_BOOKED";

            if (isFullyBooked) {
              return (
                <div
                  key={d.id}
                  className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed shadow-inner"
                >
                  <span className="text-xs text-on-surface-variant font-medium">{d.dayLabel}</span>
                  <span className="text-sm sm:text-base font-bold text-on-surface-variant line-through">
                    {d.dateFormatted}
                  </span>
                  <span className="text-[10px] text-red-400 mt-2 flex items-center gap-1 font-semibold">
                    <Ban className="h-3 w-3" />
                    <span>Fully Booked</span>
                  </span>
                </div>
              );
            }

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDate(d.id)}
                className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden group cursor-pointer border ${
                  isSelected
                    ? "bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10"
                    : "bg-surface-container border-white/10 hover:border-primary/50 hover:bg-surface-container-high"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {d.dayLabel}
                </span>
                <span className="text-sm sm:text-base font-bold text-on-surface font-headline">
                  {d.dateFormatted}
                </span>
                <span
                  className={`text-[10px] mt-2 flex items-center gap-1 font-semibold ${
                    isSelected ? "text-primary" : "text-green-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-primary" : "bg-green-400"
                    }`}
                  />
                  <span>{isSelected ? "Selected" : "Available"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection matching Stitch anything_clean_pickup_time_slot_selection */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Choose Doorstep Pickup Time Window</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map((s) => {
            const isSelected = selectedSlotId === s.id;
            const isUnavailable = s.status === "UNAVAILABLE";

            if (isUnavailable) {
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-surface/40 border border-white/5 opacity-40 cursor-not-allowed flex items-center justify-between text-xs"
                >
                  <span className="text-on-surface-variant line-through">{s.label}</span>
                  <span className="text-[10px] text-red-400">Unavailable</span>
                </div>
              );
            }

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSlot(s.id)}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-md ${
                  isSelected
                    ? "bg-primary text-on-primary border-primary shadow-primary/20"
                    : "bg-surface-container text-on-surface border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
                }`}
              >
                <span>{s.label}</span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : s.status === "FILLING_FAST" ? (
                  <span className="text-[10px] text-amber-400 font-bold">Fast Filling</span>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
