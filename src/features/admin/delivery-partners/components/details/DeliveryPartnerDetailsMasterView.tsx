"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminDeliveryPartnerService } from "@/services/admin/adminDeliveryPartnerService";
import {
  DeliveryPartner,
  DeliveryPartnerActivity,
  UpdateDeliveryPartnerApprovalPayload,
  UpdateDeliveryPartnerPayload,
  UpdateDeliveryPartnerStatusPayload,
} from "@/types/admin";
import { DeliveryPartnerDetailsView } from "./DeliveryPartnerDetailsView";

interface DeliveryPartnerDetailsMasterViewProps {
  partnerId: string;
}

export function DeliveryPartnerDetailsMasterView({
  partnerId,
}: DeliveryPartnerDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [activities, setActivities] = useState<DeliveryPartnerActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPartnerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedPartner, fetchedActivities] = await Promise.all([
        adminDeliveryPartnerService.getDeliveryPartnerById(organizationId, partnerId),
        adminDeliveryPartnerService.getDeliveryPartnerActivity(organizationId, partnerId),
      ]);

      setDeliveryPartner(fetchedPartner);
      setActivities(fetchedActivities);
    } catch {
      setDeliveryPartner(null);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, partnerId]);

  useEffect(() => {
    loadPartnerData();
  }, [loadPartnerData]);

  const handleUpdateDeliveryPartner = async (
    id: string,
    payload: UpdateDeliveryPartnerPayload
  ): Promise<DeliveryPartner> => {
    const updated = await adminDeliveryPartnerService.updateDeliveryPartner(
      organizationId,
      id,
      payload
    );
    setDeliveryPartner(updated);
    // Reload activities to reflect the update event
    const freshActivities = await adminDeliveryPartnerService.getDeliveryPartnerActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  const handleUpdateApproval = async (
    id: string,
    payload: UpdateDeliveryPartnerApprovalPayload
  ): Promise<DeliveryPartner> => {
    const updated = await adminDeliveryPartnerService.updateDeliveryPartnerApproval(
      organizationId,
      id,
      payload
    );
    setDeliveryPartner(updated);
    // Reload activities to reflect the approval decision event
    const freshActivities = await adminDeliveryPartnerService.getDeliveryPartnerActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  const handleUpdateStatus = async (
    id: string,
    payload: UpdateDeliveryPartnerStatusPayload
  ): Promise<DeliveryPartner> => {
    const updated = await adminDeliveryPartnerService.updateDeliveryPartnerStatus(
      organizationId,
      id,
      payload
    );
    setDeliveryPartner(updated);
    // Reload activities to reflect the status change event
    const freshActivities = await adminDeliveryPartnerService.getDeliveryPartnerActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  return (
    <DeliveryPartnerDetailsView
      deliveryPartner={deliveryPartner}
      activities={activities}
      isLoading={isLoading}
      onUpdateDeliveryPartner={handleUpdateDeliveryPartner}
      onUpdateApproval={handleUpdateApproval}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
