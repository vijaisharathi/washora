"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminServiceCatalogService } from "@/services/admin/adminServiceCatalogService";
import { EditServiceFormValues, Service } from "@/types/admin/serviceCatalog";
import { EditServiceForm } from "./EditServiceForm";

interface EditServiceMasterViewProps {
  serviceId: string;
}

export function EditServiceMasterView({
  serviceId,
}: EditServiceMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadService = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetched = await adminServiceCatalogService.getServiceById(
        organizationId,
        serviceId
      );
      setService(fetched);
    } catch {
      setService(null);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, serviceId]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const handleUpdate = async (
    id: string,
    payload: EditServiceFormValues
  ): Promise<Service> => {
    const updated = await adminServiceCatalogService.updateService(
      organizationId,
      id,
      payload,
      actorName
    );
    setService(updated);
    return updated;
  };

  return (
    <EditServiceForm
      service={service}
      isLoading={isLoading}
      onSubmit={handleUpdate}
    />
  );
}
