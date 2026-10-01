"use client";

import React from "react";
import Link from "next/link";
import { CustomerAddress } from "@/types/customer";
import { MapPin, Plus, CheckCircle2, Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingAddressStepProps {
  addresses: CustomerAddress[];
  selectedAddressId?: string;
  onSelectAddress: (addressId: string) => void;
}

export function BookingAddressStep({
  addresses,
  selectedAddressId,
  onSelectAddress,
}: BookingAddressStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-base text-on-surface font-headline">
            Pickup &amp; Delivery Address
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Our doorstep valet driver will collect and return your items at this address.
          </p>
        </div>

        <Link href="/customer/addresses/new">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Add New</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-4 shadow-lg ${
                isSelected
                  ? "bg-primary/10 border-primary ring-1 ring-primary/40 shadow-primary/10"
                  : "bg-surface-container border-white/10 hover:border-primary/40 hover:bg-surface-container-high"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-low text-xs font-bold text-on-surface border border-white/10">
                    {addr.label === "Home" ? (
                      <Home className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{addr.label}</span>
                  </span>

                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-on-surface line-clamp-1">
                  {addr.recipientName} ({addr.phoneNumber})
                </p>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {addr.streetAddress}
                  {addr.apartmentSuite ? `, ${addr.apartmentSuite}` : ""}, {addr.city} - {addr.postalCode}
                </p>
              </div>

              {addr.isDefault && (
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                  Default Address
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
