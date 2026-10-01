"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressSchemaFormData } from "@/features/customer/schemas/profileSchemas";
import { AddressLabel, CustomerAddress } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Briefcase,
  MapPin,
  CheckCircle2,
  Trash2,
  User,
  Phone,
  Building,
  Navigation,
} from "lucide-react";

interface AddressFormProps {
  initialData?: CustomerAddress | null;
  onSubmit: (data: AddressSchemaFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  isDeleting?: boolean;
  title: string;
  subtitle: string;
}

export function AddressForm({
  initialData,
  onSubmit,
  onDelete,
  isLoading = false,
  isDeleting = false,
  title,
  subtitle,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressSchemaFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialData?.label || "Home",
      recipientName: initialData?.recipientName || "Arjun Verma",
      phoneNumber: initialData?.phoneNumber?.replace(/\D/g, "").slice(-10) || "9876543210",
      apartmentSuite: initialData?.apartmentSuite || "",
      streetAddress: initialData?.streetAddress || "",
      landmark: initialData?.landmark || "",
      postalCode: initialData?.postalCode || "560038",
      city: initialData?.city || "Bengaluru",
      state: initialData?.state || "Karnataka",
      isDefault: initialData?.isDefault || false,
    },
  });

  const selectedLabel = watch("label");

  const labelOptions: { label: AddressLabel; icon: React.ReactNode }[] = [
    { label: "Home", icon: <Home className="h-4 w-4" /> },
    { label: "Work", icon: <Briefcase className="h-4 w-4" /> },
    { label: "Other", icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">{subtitle}</p>
        </div>

        {/* Serviceability Check Banner matching Stitch */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-green-400 font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="uppercase tracking-wider font-bold text-[11px]">
            Services available at this address
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Address Label Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface">Address Label</label>
            <div className="flex gap-3 flex-wrap">
              {labelOptions.map((opt) => {
                const isSelected = selectedLabel === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setValue("label", opt.label)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-white/10 bg-surface-container-low text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.label && <p className="text-xs text-error">{errors.label.message}</p>}
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
            <h2 className="text-sm font-bold text-on-surface">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface" htmlFor="recipientName">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                  <Input
                    id="recipientName"
                    type="text"
                    placeholder="e.g. Arjun Verma"
                    className="pl-10"
                    error={errors.recipientName?.message}
                    {...register("recipientName")}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="9876543210"
                    className="pl-10"
                    error={errors.phoneNumber?.message}
                    {...register("phoneNumber")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
            <h2 className="text-sm font-bold text-on-surface">Address Details</h2>

            {/* Apartment / Suite */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface" htmlFor="apartmentSuite">
                House / Flat No., Building Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="apartmentSuite"
                  type="text"
                  placeholder="e.g. Flat 402, Skyline Apartments"
                  className="pl-10"
                  error={errors.apartmentSuite?.message}
                  {...register("apartmentSuite")}
                />
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface" htmlFor="streetAddress">
                Street, Area, Sector
              </label>
              <div className="relative">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="streetAddress"
                  type="text"
                  placeholder="e.g. 12th Main Road, Indiranagar"
                  className="pl-10"
                  error={errors.streetAddress?.message}
                  {...register("streetAddress")}
                />
              </div>
            </div>

            {/* Landmark */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface" htmlFor="landmark">
                Landmark (Optional)
              </label>
              <Input
                id="landmark"
                type="text"
                placeholder="e.g. Opposite Metro Station"
                error={errors.landmark?.message}
                {...register("landmark")}
              />
            </div>

            {/* Pincode & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface" htmlFor="postalCode">
                  Pincode
                </label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="e.g. 560038"
                  error={errors.postalCode?.message}
                  {...register("postalCode")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface" htmlFor="city">
                  City
                </label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g. Bengaluru"
                  error={errors.city?.message}
                  {...register("city")}
                />
              </div>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface" htmlFor="state">
                State
              </label>
              <Input
                id="state"
                type="text"
                placeholder="e.g. Karnataka"
                error={errors.state?.message}
                {...register("state")}
              />
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              className="h-4 w-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary"
              {...register("isDefault")}
            />
            <label htmlFor="isDefault" className="text-xs text-on-surface cursor-pointer select-none font-medium">
              Set as default address for future pickups &amp; deliveries
            </label>
          </div>

          {/* Form Actions matching Stitch */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-6 border-t border-white/5">
            {onDelete ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-error/30 text-error hover:bg-error-container/10 gap-1.5 text-xs"
                onClick={onDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Address</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-3 w-full sm:w-auto">
              <Link href="/customer/addresses" className="flex-1 sm:flex-initial">
                <Button type="button" variant="ghost" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 sm:flex-initial font-semibold shadow-lg shadow-primary/10"
                isLoading={isLoading}
              >
                Save Address
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
