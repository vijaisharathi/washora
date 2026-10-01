"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OrderTrackingDetails } from "@/types/customer/orderLifecycle";
import { RescheduleDateOption, RescheduleTimeSlot } from "@/types/customer/cancellationReschedule";
import { Calendar, Clock, Info, CheckCircle2, ArrowRight, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RescheduleOrderCardProps {
  order: OrderTrackingDetails;
  dates: RescheduleDateOption[];
  slots: RescheduleTimeSlot[];
  onConfirmReschedule: (dateFormatted: string, timeSlot: string) => Promise<void>;
  isRescheduling: boolean;
}

export function RescheduleOrderCard({
  order,
  dates,
  slots,
  onConfirmReschedule,
  isRescheduling,
}: RescheduleOrderCardProps) {
  const [selectedDateId, setSelectedDateId] = useState(dates[0]?.id || "d-1");
  const [selectedSlotId, setSelectedSlotId] = useState("slot-2");

  const selectedDate = dates.find((d) => d.id === selectedDateId) || dates[0];
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[1];

  const handleConfirm = async () => {
    if (selectedDate && selectedSlot) {
      await onConfirmReschedule(selectedDate.dateFormatted, selectedSlot.timeRange);
    }
  };

  return (
    <main className="w-full max-w-[620px] mx-auto bg-surface-container rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header matching Stitch anything_clean_reschedule_order */}
      <header className="p-6 sm:p-8 border-b border-white/5 bg-surface-container-low/60 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
            Reschedule Pickup
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Choose a new pickup date and time.
          </p>
        </div>

        <Link
          href={`/customer/orders/${order.id}`}
          className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors"
        >
          <X className="h-5 w-5" />
        </Link>
      </header>

      {/* Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Date Selector Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 font-headline">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Select Date</span>
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {dates.map((d) => {
              const isSelected = selectedDateId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDateId(d.id)}
                  className={`shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-2 border-primary bg-primary/10 shadow-lg shadow-primary/15"
                      : "border-white/10 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container-high"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${
                      isSelected ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {d.monthFormatted}
                  </span>
                  <span
                    className={`text-2xl font-bold font-headline leading-none ${
                      isSelected ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {d.dateNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time Slot Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 font-headline">
            <Clock className="h-4 w-4 text-primary" />
            <span>Select Time Window</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((s) => {
              const isSelected = selectedSlotId === s.id;
              const isFullyBooked = s.status === "FULLY_BOOKED";

              if (isFullyBooked) {
                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-surface-container-low opacity-40 cursor-not-allowed flex justify-between items-center text-xs"
                  >
                    <span className="text-on-surface-variant line-through">{s.timeRange}</span>
                    <span className="text-[10px] text-red-400 font-bold">Fully Booked</span>
                  </div>
                );
              }

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSlotId(s.id)}
                  className={`p-3.5 rounded-xl border text-xs flex justify-between items-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-primary bg-primary/10 text-primary font-bold shadow-md shadow-primary/10"
                      : "border-white/10 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container-high text-on-surface"
                  }`}
                >
                  <span>{s.timeRange}</span>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <span className="text-[10px] text-green-400 font-semibold">Available</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Timeline Impact Notice & Summary */}
        <section className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl text-xs text-on-surface-variant">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              Your estimated return date may change slightly based on this new pickup schedule.
            </p>
          </div>

          <div className="bg-surface-container-low border border-white/10 rounded-xl p-4 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">
                  Current Schedule
                </span>
                <span className="text-xs text-on-surface line-through decoration-red-400">
                  {order.pickupWindow}
                </span>
              </div>

              <ArrowRight className="h-4 w-4 text-on-surface-variant hidden sm:block" />

              <div className="text-center sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                  New Schedule
                </span>
                <span className="text-xs font-bold text-primary font-headline">
                  {selectedDate.dateFormatted}, {selectedSlot.timeRange}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer CTAs matching Stitch */}
      <footer className="p-6 sm:p-8 border-t border-white/5 bg-surface-container-low/60 flex flex-col gap-2.5">
        <Button
          onClick={handleConfirm}
          disabled={isRescheduling}
          size="lg"
          className="w-full gap-2 font-semibold shadow-lg shadow-primary/20"
        >
          {isRescheduling ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Updating Pickup...</span>
            </>
          ) : (
            <>
              <span>Confirm New Pickup Time</span>
              <Check className="h-4 w-4" />
            </>
          )}
        </Button>

        <Link href={`/customer/orders/${order.id}`}>
          <Button variant="outline" className="w-full text-xs font-semibold">
            Cancel
          </Button>
        </Link>
      </footer>
    </main>
  );
}
