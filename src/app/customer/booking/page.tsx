"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useBookingDates,
  useBookingSlots,
  useInitialBookingDraft,
  useSaveBookingDraft,
} from "@/features/customer/hooks/useBooking";
import { useCustomerAddresses } from "@/features/customer/hooks/useCustomerProfile";
import { CustomerAddress } from "@/types/customer";
import { CustomerBookingDraft } from "@/types/customer/booking";
import { BookingProgressIndicator } from "@/features/customer/components/booking/BookingProgressIndicator";
import { BookingServiceStep } from "@/features/customer/components/booking/BookingServiceStep";
import { BookingAddressStep } from "@/features/customer/components/booking/BookingAddressStep";
import { BookingScheduleStep } from "@/features/customer/components/booking/BookingScheduleStep";
import { BookingReviewStep } from "@/features/customer/components/booking/BookingReviewStep";
import { BookingSkeleton } from "@/features/customer/components/booking/BookingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

function BookingWorkflowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceId = searchParams.get("serviceId") || "srv-1";
  const providerId = searchParams.get("providerId") || undefined;
  const variantId = searchParams.get("variantId") || undefined;

  const [step, setStep] = useState<number>(1);
  const [draft, setDraft] = useState<CustomerBookingDraft | null>(null);

  const { data: initialDraft, isLoading: isInitLoading, isError, refetch } = useInitialBookingDraft({
    serviceId,
    providerId,
    variantId,
  });

  const { addresses = [] } = useCustomerAddresses();
  const { data: dates = [] } = useBookingDates();
  const selectedDate = dates.find((d) => d.id === draft?.pickupDate) || dates[0];
  const { data: slots = [] } = useBookingSlots(selectedDate?.dateIso || "2026-09-02");

  const saveDraftMutation = useSaveBookingDraft();

  useEffect(() => {
    if (initialDraft && !draft) {
      setDraft(initialDraft);
    }
  }, [initialDraft, draft]);

  // Sync selected address
  useEffect(() => {
    if (addresses.length > 0 && draft && !draft.selectedAddressId) {
      const def = addresses.find((a: CustomerAddress) => a.isDefault) || addresses[0];
      setDraft((prev) => (prev ? { ...prev, selectedAddressId: def.id, selectedAddress: def } : null));
    }
  }, [addresses, draft]);

  if (isInitLoading || !draft) {
    return <BookingSkeleton />;
  }

  if (isError || !draft.service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Could Not Initialize Booking"
          message="We were unable to load service or provider details for this booking."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // State handlers
  const handleSelectVariant = (vId: string) => {
    const v = draft.service?.variants?.find((item) => item.id === vId);
    const unitPrice = v ? v.price : draft.service?.basePrice || 299;
    const estTotal = unitPrice * draft.quantity;
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            variantId: vId,
            variant: v,
            estimatedServiceTotal: estTotal,
            estimatedTotal: estTotal,
          }
        : null
    );
  };

  const handleQuantityChange = (qty: number) => {
    const unitPrice = draft.variant ? draft.variant.price : draft.service?.basePrice || 299;
    const estTotal = unitPrice * qty;
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            quantity: qty,
            estimatedServiceTotal: estTotal,
            estimatedTotal: estTotal,
          }
        : null
    );
  };

  const handleSelectAddress = (addrId: string) => {
    const addr = addresses.find((a: CustomerAddress) => a.id === addrId);
    setDraft((prev) => (prev ? { ...prev, selectedAddressId: addrId, selectedAddress: addr } : null));
  };

  const handleSelectDate = (dateId: string) => {
    const d = dates.find((item) => item.id === dateId);
    setDraft((prev) =>
      prev ? { ...prev, pickupDate: d?.dayLabel || "Tomorrow" } : null
    );
  };

  const handleSelectSlot = (slotId: string) => {
    const s = slots.find((item) => item.id === slotId);
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            pickupTimeSlotId: slotId,
            pickupTimeSlotLabel: s?.label || "10:00 AM – 12:00 PM",
          }
        : null
    );
  };

  const handleProceedToCheckout = async () => {
    if (draft) {
      await saveDraftMutation.mutateAsync(draft);
      router.push("/customer/checkout");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-28">
      {/* Top Header & Contextual Nav */}
      <div className="space-y-4 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/customer/services"
                className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface font-headline">
                Schedule Doorstep Care
              </h1>
              <p className="text-xs text-on-surface-variant">
                Configure your bespoke pickup, address, and care options.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 hidden sm:inline-block">
            {draft.service.name}
          </span>
        </div>

        {/* 4-Step Progress Indicator */}
        <BookingProgressIndicator currentStep={step} totalSteps={4} />
      </div>

      {/* Step Content Switcher */}
      {step === 1 && (
        <BookingServiceStep
          service={draft.service}
          provider={draft.provider}
          selectedVariantId={draft.variantId}
          onSelectVariant={handleSelectVariant}
          quantity={draft.quantity}
          onQuantityChange={handleQuantityChange}
        />
      )}

      {step === 2 && (
        <BookingAddressStep
          addresses={addresses}
          selectedAddressId={draft.selectedAddressId}
          onSelectAddress={handleSelectAddress}
        />
      )}

      {step === 3 && (
        <BookingScheduleStep
          dates={dates}
          selectedDateId={dates.find((d) => d.dayLabel === draft.pickupDate)?.id || dates[0]?.id || "date-0"}
          onSelectDate={handleSelectDate}
          slots={slots}
          selectedSlotId={draft.pickupTimeSlotId || "slot-2"}
          onSelectSlot={handleSelectSlot}
        />
      )}

      {step === 4 && (
        <BookingReviewStep
          draft={draft}
          onEditStep={(targetStep) => setStep(targetStep)}
          specialInstructions={draft.specialInstructions || ""}
          onSpecialInstructionsChange={(notes) =>
            setDraft((prev) => (prev ? { ...prev, specialInstructions: notes } : null))
          }
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {/* Sticky Bottom Navigation Actions (For Steps 1 to 3) */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 w-full bg-surface-container/95 backdrop-blur-md border-t border-white/10 p-4 z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <div>
              <p className="text-[11px] text-on-surface-variant font-medium">Estimated Total</p>
              <p className="text-base sm:text-xl font-bold text-on-surface font-mono">
                ₹{draft.estimatedTotal}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button
                size="default"
                onClick={() => setStep(step + 1)}
                className="gap-2 font-semibold shadow-lg shadow-primary/20"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="h-8 w-48 bg-surface-container rounded animate-pulse" />
          <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      }
    >
      <BookingWorkflowContent />
    </Suspense>
  );
}
