"use client";

import React from "react";
import { CustomerBookingDraft } from "@/types/customer/booking";
import {
  Sparkles,
  Truck,
  Calendar,
  Phone,
  Edit3,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingReviewStepProps {
  draft: CustomerBookingDraft;
  onEditStep: (step: number) => void;
  specialInstructions: string;
  onSpecialInstructionsChange: (notes: string) => void;
  onProceedToCheckout: () => void;
}

export function BookingReviewStep({
  draft,
  onEditStep,
  specialInstructions,
  onSpecialInstructionsChange,
  onProceedToCheckout,
}: BookingReviewStepProps) {
  const service = draft.service;
  const address = draft.selectedAddress;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Review Details (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Service Details Card matching Stitch */}
        <section className="bg-surface-container rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-bold text-base text-primary font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">dry_cleaning</span>
              <span>Service Details</span>
            </h3>
            <span className="text-lg font-bold text-green-400 font-mono">
              ₹{draft.estimatedServiceTotal}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-on-surface-variant font-medium">Service Treatment</span>
              <p className="font-bold text-on-surface text-sm">{service?.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-on-surface-variant font-medium">Package / Variant</span>
              <p className="font-bold text-on-surface text-sm">
                {draft.variant?.name || "Standard Treatment"} (x{draft.quantity})
              </p>
            </div>
          </div>
        </section>

        {/* Fulfillment & Contact Card matching Stitch */}
        <section className="bg-surface-container rounded-2xl p-6 border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-bold text-base text-primary font-headline flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Fulfillment &amp; Contact</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Address */}
            <div className="flex items-start justify-between group">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-lg mt-0.5">
                  home_pin
                </span>
                <div className="space-y-0.5">
                  <span className="text-on-surface-variant font-medium">
                    Fulfillment &amp; Address
                  </span>
                  <p className="font-bold text-on-surface">Doorstep Pickup &amp; Return</p>
                  <p className="text-on-surface-variant leading-relaxed">
                    {address?.streetAddress}
                    {address?.apartmentSuite ? `, ${address.apartmentSuite}` : ""},{" "}
                    {address?.city} - {address?.postalCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-primary hover:underline font-semibold text-xs flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Schedule */}
            <div className="flex items-start justify-between group pt-3 border-t border-white/5">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-on-surface-variant mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-on-surface-variant font-medium">Pickup Schedule</span>
                  <p className="font-bold text-on-surface">{draft.pickupDate || "Tomorrow"}</p>
                  <p className="text-on-surface-variant">{draft.pickupTimeSlotLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="text-primary hover:underline font-semibold text-xs flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Contact */}
            <div className="flex items-start justify-between group pt-3 border-t border-white/5">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-on-surface-variant mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-on-surface-variant font-medium">Contact Recipient</span>
                  <p className="font-bold text-on-surface">
                    {address?.recipientName} ({address?.phoneNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-primary hover:underline font-semibold text-xs flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </section>

        {/* Special Instructions Card matching Stitch */}
        <section className="bg-surface-container rounded-2xl p-6 border border-white/10 space-y-3 shadow-xl">
          <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>Special Instructions / Valet Notes</span>
          </h4>
          <input
            type="text"
            value={specialInstructions}
            onChange={(e) => onSpecialInstructionsChange(e.target.value)}
            placeholder="e.g. Please ring bell twice, fragile shoe box, etc."
            className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </section>
      </div>

      {/* Right Column: Price Summary & Primary CTA (4 cols) matching Stitch */}
      <div className="lg:col-span-4 sticky top-24 space-y-6">
        <section className="bg-surface-container rounded-2xl p-6 border border-white/10 shadow-2xl space-y-5">
          <h3 className="font-bold text-base text-on-surface font-headline border-b border-white/5 pb-3">
            Price Summary
          </h3>

          <div className="space-y-3 text-xs border-b border-white/5 pb-4">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Service Treatment</span>
              <span className="font-mono text-on-surface font-semibold">
                ₹{draft.estimatedServiceTotal}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Doorstep Pickup</span>
              <span className="font-mono text-green-400 font-semibold">FREE (₹0)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Return Delivery</span>
              <span className="font-mono text-green-400 font-semibold">FREE (₹0)</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Estimated Total
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-primary font-headline">
              ₹{draft.estimatedTotal}
            </span>
          </div>

          <Button
            size="lg"
            onClick={onProceedToCheckout}
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/20"
          >
            <span>Continue to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5 pt-1">
            <Lock className="h-3 w-3 text-primary" />
            <span>Secure 256-bit Encrypted Checkout</span>
          </p>
        </section>
      </div>
    </div>
  );
}
