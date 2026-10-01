"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminCustomerService } from "@/services/admin/adminCustomerService";
import { Customer, CustomerActivity, CustomerStatus, UpdateCustomerPayload } from "@/types/admin";
import { CustomerDetailsView } from "./CustomerDetailsView";

interface CustomerDetailsMasterViewProps {
  customerId: string;
}

export function CustomerDetailsMasterView({
  customerId,
}: CustomerDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCustomerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedCustomer, fetchedActivities] = await Promise.all([
        adminCustomerService.getCustomerById(organizationId, customerId),
        adminCustomerService.getCustomerActivity(organizationId, customerId),
      ]);

      setCustomer(fetchedCustomer);
      setActivities(fetchedActivities);
    } catch {
      setCustomer(null);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, customerId]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const handleUpdateCustomer = async (
    id: string,
    payload: UpdateCustomerPayload
  ): Promise<Customer> => {
    const updated = await adminCustomerService.updateCustomer(
      organizationId,
      id,
      payload
    );
    setCustomer(updated);
    // Reload activities to reflect the update event
    const freshActivities = await adminCustomerService.getCustomerActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: CustomerStatus,
    reason?: string
  ): Promise<Customer> => {
    const updated = await adminCustomerService.updateCustomerStatus(
      organizationId,
      id,
      newStatus,
      reason
    );
    setCustomer(updated);
    // Reload activities to reflect the status change event
    const freshActivities = await adminCustomerService.getCustomerActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  return (
    <CustomerDetailsView
      customer={customer}
      activities={activities}
      isLoading={isLoading}
      onUpdateCustomer={handleUpdateCustomer}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
