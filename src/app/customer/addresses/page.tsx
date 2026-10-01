"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAddresses } from "@/features/customer/hooks/useAddresses";
import { CustomerAddress } from "@/types/customer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Home,
  Briefcase,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CustomerSavedAddressesPage() {
  const {
    addresses,
    isLoading,
    isError,
    deleteAddress,
    isDeleting,
    setDefaultAddress,
    isSettingDefault,
    refetch,
  } = useAddresses();

  const [addressToDelete, setAddressToDelete] = useState<CustomerAddress | null>(null);

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete.id);
    } finally {
      setAddressToDelete(null);
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label?.toUpperCase()) {
      case "HOME":
        return <Home className="h-5 w-5 text-primary" />;
      case "WORK":
        return <Briefcase className="h-5 w-5 text-primary" />;
      default:
        return <MapPin className="h-5 w-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <LoadingSkeleton className="h-6 w-48 rounded" />
        <LoadingSkeleton className="h-10 w-72 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <LoadingSkeleton className="h-60 w-full rounded-2xl" />
          <LoadingSkeleton className="h-60 w-full rounded-2xl" />
          <LoadingSkeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Could not load addresses"
          message="We encountered an issue fetching your saved locations."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/customer/profile" className="hover:text-primary transition-colors">
          Account
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-semibold">Saved Addresses</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Manage your doorstep pickup and garment delivery locations.
          </p>
        </div>

        <Link href="/customer/addresses/new">
          <Button className="gap-2 font-semibold shadow-lg shadow-primary/10">
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </Button>
        </Link>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-surface-container border rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden shadow-lg ${
              addr.isDefault
                ? "border-primary/40 bg-surface-container-high/60"
                : "border-white/10 hover:border-primary/30"
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-white/10 flex items-center justify-center">
                    {getLabelIcon(addr.label)}
                  </div>
                  <h2 className="font-bold text-sm tracking-wider uppercase text-on-surface">
                    {addr.label}
                  </h2>
                </div>

                {addr.isDefault ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold text-[10px] uppercase tracking-wider">
                    Default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    disabled={isSettingDefault}
                    className="text-[11px] text-on-surface-variant hover:text-primary transition-colors underline underline-offset-2"
                  >
                    Set as default
                  </button>
                )}
              </div>

              {/* Contact & Address Details */}
              <div className="space-y-1 mb-6">
                <p className="text-sm font-bold text-on-surface">{addr.recipientName}</p>
                <p className="text-xs text-on-surface-variant/80 font-mono">{addr.phoneNumber}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  {addr.apartmentSuite && `${addr.apartmentSuite}, `}
                  {addr.streetAddress}
                  <br />
                  {addr.city}
                  {addr.state && `, ${addr.state}`} — {addr.postalCode}
                </p>
                {addr.landmark && (
                  <p className="text-[11px] text-on-surface-variant/70 italic pt-1">
                    Landmark: {addr.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
              <Link href={`/customer/addresses/${addr.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 border-white/10 text-xs">
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 border-error/30 text-error hover:bg-error-container/10 text-xs"
                onClick={() => setAddressToDelete(addr)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        ))}

        {/* Add New Address Card */}
        <Link href="/customer/addresses/new" className="block min-h-[220px]">
          <div className="h-full border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-low/50 hover:bg-surface-container-high/40 hover:border-primary/50 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                Add New Address
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Save a new apartment or office location
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(addressToDelete)} onOpenChange={(open) => !open && setAddressToDelete(null)}>
        <DialogContent className="max-w-md bg-surface-container border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-error" />
              <span>Delete Address</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Are you sure you want to remove{" "}
              <strong className="text-on-surface">{addressToDelete?.label}</strong> ({addressToDelete?.streetAddress})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setAddressToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
