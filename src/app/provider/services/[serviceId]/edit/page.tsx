"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderServiceForm } from "@/features/provider/services/components/ProviderServiceForm";
import {
  useProviderServices,
  useProviderServiceItem,
} from "@/features/provider/services/hooks/useProviderServices";
import { ProviderServiceFormData } from "@/features/provider/services/schemas/providerServiceSchema";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";

export default function EditProviderServicePage() {
  const params = useParams();
  const serviceId = params?.serviceId as string;
  const router = useRouter();

  const { data: service, isLoading, isError } = useProviderServiceItem(serviceId);
  const { updateService, isUpdating } = useProviderServices();

  if (isLoading) {
    return (
      <ProviderShell headerTitle="Edit Service" headerSubtitle="Catalog Management">
        <ProviderLoadingState message="Loading service details..." />
      </ProviderShell>
    );
  }

  if (isError || !service) {
    return (
      <ProviderShell headerTitle="Edit Service" headerSubtitle="Catalog Management">
        <ProviderErrorState title="Service not found" />
      </ProviderShell>
    );
  }

  const handleUpdate = async (data: ProviderServiceFormData) => {
    await updateService({
      id: serviceId,
      payload: {
        name: data.name,
        category: data.category as any,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        turnaroundHours: data.turnaroundHours,
        status: data.status,
      },
    });
    router.push("/provider/services");
  };

  return (
    <ProviderShell headerTitle="Edit Service" headerSubtitle={service.name}>
      <ProviderServiceForm
        initialData={service}
        title={`Edit "${service.name}"`}
        subtitle="Update treatment guidelines, base charges, and operational SLAs."
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
      />
    </ProviderShell>
  );
}
