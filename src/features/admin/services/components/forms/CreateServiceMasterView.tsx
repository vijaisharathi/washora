"use client";

import React from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminServiceCatalogService } from "@/services/admin/adminServiceCatalogService";
import { CreateServiceFormValues, Service } from "@/types/admin/serviceCatalog";
import { CreateServiceForm } from "./CreateServiceForm";

export function CreateServiceMasterView() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const handleCreate = async (payload: CreateServiceFormValues): Promise<Service> => {
    return adminServiceCatalogService.createService(
      organizationId,
      payload,
      actorName
    );
  };

  return (
    <CreateServiceForm
      organizationId={organizationId}
      onSubmit={handleCreate}
    />
  );
}
