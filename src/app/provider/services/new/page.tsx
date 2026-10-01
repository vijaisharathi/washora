"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderServiceForm } from "@/features/provider/services/components/ProviderServiceForm";
import { useProviderServices } from "@/features/provider/services/hooks/useProviderServices";
import { ProviderServiceFormData } from "@/features/provider/services/schemas/providerServiceSchema";

export default function NewProviderServicePage() {
  const router = useRouter();
  const { createService, isCreating } = useProviderServices();

  const handleCreate = async (data: ProviderServiceFormData) => {
    await createService({
      name: data.name,
      category: data.category as any,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes,
      turnaroundHours: data.turnaroundHours,
      status: data.status,
    });
    router.push("/provider/services");
  };

  return (
    <ProviderShell headerTitle="Create Service" headerSubtitle="New Catalog Item">
      <ProviderServiceForm
        title="Add New Care Service"
        subtitle="Specify treatment specifications, processing cycle duration, and customer pricing."
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </ProviderShell>
  );
}
