"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAddresses } from "@/features/customer/hooks/useAddresses";
import { AddressForm } from "@/features/customer/components/AddressForm";
import { AddressSchemaFormData } from "@/features/customer/schemas/profileSchemas";

export default function AddNewAddressPage() {
  const router = useRouter();
  const { createAddress, isCreating } = useAddresses();

  const handleSubmit = async (data: AddressSchemaFormData) => {
    await createAddress({
      label: data.label,
      recipientName: data.recipientName,
      phoneNumber: data.phoneNumber,
      apartmentSuite: data.apartmentSuite,
      streetAddress: data.streetAddress,
      landmark: data.landmark || undefined,
      postalCode: data.postalCode,
      city: data.city,
      state: data.state,
      isDefault: data.isDefault,
    });
    router.push("/customer/addresses");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/customer/profile" className="hover:text-primary transition-colors">
          Account
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/customer/addresses" className="hover:text-primary transition-colors">
          Saved Addresses
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-semibold">Add New Address</span>
      </nav>

      {/* Address Form */}
      <AddressForm
        title="Add New Address"
        subtitle="Save a new pickup and delivery location for instant booking."
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
    </div>
  );
}
