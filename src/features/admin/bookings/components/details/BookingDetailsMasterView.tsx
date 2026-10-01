"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { adminBookingService } from "@/services/admin/adminBookingService";
import { adminCustomerService } from "@/services/admin/adminCustomerService";
import { adminProviderService } from "@/services/admin/adminProviderService";
import {
  BookingOrder,
  BookingActivity,
  BookingStatus,
  BookingEditFormValues,
  Customer,
  Provider,
} from "@/types/admin";
import { BookingDetailsView } from "./BookingDetailsView";

interface BookingDetailsMasterViewProps {
  bookingId: string;
}

export function BookingDetailsMasterView({
  bookingId,
}: BookingDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const [booking, setBooking] = useState<BookingOrder | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [activities, setActivities] = useState<BookingActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadBookingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedBooking, fetchedActivities] = await Promise.all([
        adminBookingService.getBookingById(organizationId, bookingId),
        adminBookingService.getBookingActivity(organizationId, bookingId),
      ]);

      setBooking(fetchedBooking);
      setActivities(fetchedActivities);

      if (fetchedBooking) {
        // Resolve canonical customer and provider concurrently
        const [fetchedCustomer, fetchedProvider] = await Promise.all([
          adminCustomerService.getCustomerById(
            organizationId,
            fetchedBooking.customerId
          ),
          adminProviderService.getProviderById(
            organizationId,
            fetchedBooking.providerId
          ),
        ]);
        setCustomer(fetchedCustomer);
        setProvider(fetchedProvider);
      } else {
        setCustomer(null);
        setProvider(null);
      }
    } catch {
      setBooking(null);
      setCustomer(null);
      setProvider(null);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, bookingId]);

  useEffect(() => {
    loadBookingData();
  }, [loadBookingData]);

  const handleUpdateBooking = async (
    id: string,
    payload: BookingEditFormValues
  ): Promise<BookingOrder> => {
    const updated = await adminBookingService.updateBooking(
      organizationId,
      id,
      payload,
      actorName
    );
    setBooking(updated);

    // Refresh activity trail
    const freshActivities = await adminBookingService.getBookingActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: BookingStatus,
    reason?: string
  ): Promise<BookingOrder> => {
    const updated = await adminBookingService.updateBookingStatus(
      organizationId,
      id,
      newStatus,
      actorName,
      reason
    );
    setBooking(updated);

    // Refresh activity trail
    const freshActivities = await adminBookingService.getBookingActivity(
      organizationId,
      id
    );
    setActivities(freshActivities);
    return updated;
  };

  return (
    <BookingDetailsView
      booking={booking}
      customer={customer}
      provider={provider}
      activities={activities}
      isLoading={isLoading}
      onUpdateBooking={handleUpdateBooking}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
