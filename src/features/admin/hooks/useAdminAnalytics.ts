"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  AnalyticsFilter,
  ReportDateRange,
  ReportOverviewData,
  RevenueReportData,
  BookingsReportData,
  CustomersReportData,
  ProvidersReportData,
  DeliveryPartnersReportData,
  ServicesReportData,
  OperationsReportData,
  ReviewsReportData,
} from "@/types/admin/analytics";
import { adminAnalyticsService } from "@/services/admin/adminAnalyticsService";

export interface FilterOptionsState {
  cities: string[];
  categories: string[];
  providers: { id: string; name: string }[];
  deliveryPartners: { id: string; name: string }[];
  services: { id: string; name: string; category: string }[];
}

/**
 * Shared filter state hook for analytics workspace
 */
export function useAnalyticsFilterState() {
  const { session } = useAdminSession();
  const orgId = session?.user?.organizationId || "ORG-0001";

  const [dateRange, setDateRange] = useState<ReportDateRange>("last30Days");
  const [startDate, setStartDate] = useState<string>("2026-08-11");
  const [endDate, setEndDate] = useState<string>("2026-09-10");
  const [city, setCity] = useState<string>("all");
  const [serviceCategory, setServiceCategory] = useState<string>("all");
  const [providerId, setProviderId] = useState<string>("all");
  const [deliveryPartnerId, setDeliveryPartnerId] = useState<string>("all");
  const [serviceId, setServiceId] = useState<string>("all");

  const [filterOptions, setFilterOptions] = useState<FilterOptionsState>({
    cities: [],
    categories: [],
    providers: [],
    deliveryPartners: [],
    services: [],
  });

  const loadFilterOptions = useCallback(async () => {
    try {
      const opts = await adminAnalyticsService.getFilterOptions(orgId);
      setFilterOptions(opts);
    } catch {
      // Fallback
    }
  }, [orgId]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  const activeFilterCount = [
    city !== "all" ? 1 : 0,
    serviceCategory !== "all" ? 1 : 0,
    providerId !== "all" ? 1 : 0,
    deliveryPartnerId !== "all" ? 1 : 0,
    serviceId !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const resetFilters = () => {
    setCity("all");
    setServiceCategory("all");
    setProviderId("all");
    setDeliveryPartnerId("all");
    setServiceId("all");
  };

  const getFilterPayload = useCallback((): AnalyticsFilter => ({
    organizationId: orgId,
    dateRange,
    startDate,
    endDate,
    city: city !== "all" ? city : undefined,
    serviceCategory: serviceCategory !== "all" ? serviceCategory : undefined,
    providerId: providerId !== "all" ? providerId : undefined,
    deliveryPartnerId: deliveryPartnerId !== "all" ? deliveryPartnerId : undefined,
    serviceId: serviceId !== "all" ? serviceId : undefined,
  }), [orgId, dateRange, startDate, endDate, city, serviceCategory, providerId, deliveryPartnerId, serviceId]);

  return {
    orgId,
    dateRange,
    startDate,
    endDate,
    city,
    serviceCategory,
    providerId,
    deliveryPartnerId,
    serviceId,
    filterOptions,
    activeFilterCount,
    setDateRange,
    setStartDate,
    setEndDate,
    setCity,
    setServiceCategory,
    setProviderId,
    setDeliveryPartnerId,
    setServiceId,
    resetFilters,
    getFilterPayload,
  };
}

/**
 * 1. Hook for Reports Overview (/admin/reports)
 */
export function useAdminOverviewReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportOverviewData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getOverviewReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load overview analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 2. Hook for Revenue Report (/admin/reports/revenue)
 */
export function useAdminRevenueReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RevenueReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getRevenueReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 3. Hook for Booking Report (/admin/reports/bookings)
 */
export function useAdminBookingsReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BookingsReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getBookingsReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load booking analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 4. Hook for Customer Report (/admin/reports/customers)
 */
export function useAdminCustomersReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CustomersReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getCustomersReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load customer analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 5. Hook for Provider Report (/admin/reports/providers)
 */
export function useAdminProvidersReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProvidersReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getProvidersReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load provider analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 6. Hook for Delivery Partner Report (/admin/reports/delivery-partners)
 */
export function useAdminDeliveryPartnersReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DeliveryPartnersReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getDeliveryPartnersReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load delivery partner analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 7. Hook for Service Report (/admin/reports/services)
 */
export function useAdminServicesReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ServicesReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getServicesReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load service analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 8. Hook for Operations Report (/admin/reports/operations)
 */
export function useAdminOperationsReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OperationsReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getOperationsReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load operations analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

/**
 * 9. Hook for Reviews Report (/admin/reports/reviews)
 */
export function useAdminReviewsReport() {
  const filterState = useAnalyticsFilterState();
  const { getFilterPayload } = filterState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewsReportData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAnalyticsService.getReviewsReport(getFilterPayload());
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load review analytics");
    } finally {
      setLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...filterState,
    loading,
    error,
    data,
    refetch: fetchData,
  };
}

