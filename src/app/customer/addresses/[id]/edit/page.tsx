"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAddresses, useAddressById } from "@/features/customer/hooks/useAddresses";
import { AddressForm } from "@/features/customer/components/AddressForm";
import { AddressSchemaFormData } from "@/features/customer/schemas/profileSchemas";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function EditAddressPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const addressId = params.id;
  const { data: address, isLoading, isError, refetch } = useAddressById(addressId);
  const { updateAddress, isUpdating, deleteAddress, isDeleting } = useAddresses();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (data: AddressSchemaFormData) => {
    await updateAddress({
      id: addressId,
      data: {
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
      },
    });
    router.push("/customer/addresses");
  };

  const handleDelete = async () => {
    await deleteAddress(addressId);
    setShowDeleteConfirm(false);
    router.push("/customer/addresses");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <LoadingSkeleton className="h-6 w-48 rounded" />
        <LoadingSkeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !address) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Address Not Found"
          message="The address you are trying to edit could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

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
        <span className="text-primary font-semibold">Edit Address</span>
      </nav>

      {/* Address Form */}
      <AddressForm
        initialData={address}
        title="Edit Address"
        subtitle="Update your address details to ensure accurate doorstep pickup and delivery."
        onSubmit={handleSubmit}
        onDelete={async () => setShowDeleteConfirm(true)}
        isLoading={isUpdating}
        isDeleting={isDeleting}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md bg-surface-container border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-error" />
              <span>Delete Address</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Are you sure you want to delete this {address.label} address ({address.streetAddress})? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
