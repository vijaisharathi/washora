import React from "react";
import Link from "next/link";
import { CustomerBookingDraft } from "@/types/customer/booking";
import { MapPin } from "lucide-react";

interface CheckoutAddressCardProps {
  draft: CustomerBookingDraft;
}

export function CheckoutAddressCard({ draft }: CheckoutAddressCardProps) {
  const address = draft.selectedAddress;

  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <h3 className="font-bold text-base text-on-surface font-headline">Pickup &amp; Delivery Address</h3>
        </div>

        <Link
          href={`/customer/booking?serviceId=${draft.serviceId}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Edit
        </Link>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-white/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <span className="material-symbols-outlined text-2xl">home_pin</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-on-surface">
              {address?.label || "Home"} Address
            </span>
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>

          <p className="text-on-surface-variant leading-relaxed">
            {address?.streetAddress}
            {address?.apartmentSuite ? `, ${address.apartmentSuite}` : ""}, {address?.city} - {address?.postalCode}
          </p>

          <p className="text-[11px] text-on-surface-variant/80 font-medium">
            Recipient: {address?.recipientName} ({address?.phoneNumber})
          </p>
        </div>
      </div>
    </div>
  );
}
