"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminProviderService } from "@/services/admin/adminProviderService";
import {
  Provider,
  ProviderActivity,
  UpdateProviderApprovalPayload,
  UpdateProviderPayload,
  UpdateProviderStatusPayload,
} from "@/types/admin";
import { ProviderDetailsView } from "./ProviderDetailsView";

interface ProviderDetailsMasterViewProps {
  providerId: string;
}

export function ProviderDetailsMasterView({
  providerId,
}: ProviderDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [provider, setProvider] = useState<Provider | null>(null);
  const [activities, setActivities] = useState<ProviderActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProviderData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedProvider, fetchedActivities] = await Promise.all([
        adminProviderService.getProviderById(organizationId, providerId),
        adminProviderService.getProviderActivity(organizationId, providerId),
      ]);

      setProvider(fetchedProvider);
      setActivities(fetchedActivities);
    } catch {
      setProvider(null);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, providerId]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const handleUpdateProvider = async (
    id: string,
    payload: UpdateProviderPayload
  ): Promise<Provider> => {
    const updated = await adminProviderService.updateProvider(
      organizationId,
      id,
      payload
    );
    setProvider(updated);
    // Reload activities to reflect the update event
    const freshActivities = await adminProviderService.getProviderActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  const handleUpdateApproval = async (
    id: string,
    payload: UpdateProviderApprovalPayload
  ): Promise<Provider> => {
    const updated = await adminProviderService.updateProviderApproval(
      organizationId,
      id,
      payload
    );
    setProvider(updated);
    // Reload activities to reflect the approval decision event
    const freshActivities = await adminProviderService.getProviderActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  const handleUpdateStatus = async (
    id: string,
    payload: UpdateProviderStatusPayload
  ): Promise<Provider> => {
    const updated = await adminProviderService.updateProviderStatus(
      organizationId,
      id,
      payload
    );
    setProvider(updated);
    // Reload activities to reflect the status change event
    const freshActivities = await adminProviderService.getProviderActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  return (
    <ProviderDetailsView
      provider={provider}
      activities={activities}
      isLoading={isLoading}
      onUpdateProvider={handleUpdateProvider}
      onUpdateApproval={handleUpdateApproval}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
