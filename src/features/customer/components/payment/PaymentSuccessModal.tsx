"use client";

import React from "react";
import Link from "next/link";
import { PaymentTransactionResult } from "@/types/customer/payment";
import { CustomerBookingDraft } from "@/types/customer/booking";
import { CheckCircle2, Calendar, MapPin, Truck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentSuccessModalProps {
  result: PaymentTransactionResult;
  draft?: CustomerBookingDraft;
}

export function PaymentSuccessModal({ result, draft }: PaymentSuccessModalProps) {
  const address = draft?.selectedAddress;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface-container rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Success Header with Glowing Green Badge matching Stitch anything_clean_payment_success */}
        <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center bg-gradient-to-b from-green-500/10 to-transparent border-b border-white/5 space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/20 animate-pulse">
              <CheckCircle2 className="h-9 w-9 text-green-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
              Payment Successful
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Your bespoke garment care booking with WASHORA is confirmed.
            </p>
          </div>
        </div>

        {/* Details Grid matching Stitch */}
        <div className="p-6 space-y-4">
          <div className="bg-surface-container-low rounded-xl border border-white/5 p-4 flex justify-between items-center">
            <span className="text-xs font-semibold text-on-surface-variant">Amount Paid</span>
            <span className="text-xl sm:text-2xl font-bold text-primary font-mono">
              ₹{result.amount}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* IDs */}
            <div className="bg-surface-container-low rounded-xl border border-white/5 p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                  Booking ID
                </span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  {result.bookingId}
                </span>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                  Transaction Reference
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {result.transactionId}
                </span>
              </div>
            </div>

            {/* Logistics */}
            <div className="bg-surface-container-low rounded-xl border border-white/5 p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                    Pickup Schedule
                  </span>
                  <p className="font-bold text-on-surface">
                    {draft?.pickupDate || "Tomorrow"}, {draft?.pickupTimeSlotLabel || "10:00 AM – 12:00 PM"}
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-white/5" />

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                    Doorstep Address
                  </span>
                  <p className="font-bold text-on-surface truncate max-w-[200px]">
                    {address?.city || "Anna Nagar, Chennai"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-surface-container-highest/30 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href={`/customer/order-confirmation?orderId=${result.bookingId}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full gap-2">
              <Eye className="h-4 w-4" />
              <span>View Confirmation</span>
            </Button>
          </Link>

          <Link href="/customer/orders" className="w-full sm:w-auto">
            <Button className="w-full gap-2 font-semibold shadow-lg shadow-primary/20">
              <span>Track Order</span>
              <Truck className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
