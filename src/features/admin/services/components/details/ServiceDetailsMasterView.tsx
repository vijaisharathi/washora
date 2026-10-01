"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminServiceCatalogService } from "@/services/admin/adminServiceCatalogService";
import {
  Service,
  ServiceActivity,
  ServiceStatus,
} from "@/types/admin/serviceCatalog";
import { ServiceDetailsView } from "./ServiceDetailsView";

interface ServiceDetailsMasterViewProps {
  serviceId: string;
}

export function ServiceDetailsMasterView({
  serviceId,
}: ServiceDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const [service, setService] = useState<Service | null>(null);
  const [activities, setActivities] = useState<ServiceActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadServiceData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedService, fetchedActivities] = await Promise.all([
        adminServiceCatalogService.getServiceById(organizationId, serviceId),
        adminServiceCatalogService.getServiceActivity(organizationId, serviceId),
      ]);

      setService(fetchedService);
      setActivities(fetchedActivities);
    } catch {
      setService(null);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, serviceId]);

  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: ServiceStatus,
    reason?: string
  ): Promise<Service> => {
    const updated = await adminServiceCatalogService.updateServiceStatus(
      organizationId,
      id,
      newStatus,
      actorName,
      reason
    );
    setService(updated);

    // Refresh activity trail
    const freshActivities =
      await adminServiceCatalogService.getServiceActivity(organizationId, id);
    setActivities(freshActivities);
    return updated;
  };

  return (
    <ServiceDetailsView
      service={service}
      activities={activities}
      isLoading={isLoading}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
