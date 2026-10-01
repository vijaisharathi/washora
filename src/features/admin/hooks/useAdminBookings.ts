"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  BookingOrder,
  BookingStatus,
  BookingDatePreset,
  BookingSortField,
  BookingSortDirection,
  BookingSummaryMetrics,
  ListBookingsResult,
  BookingEditFormValues,
} from "@/types/admin";
import { adminBookingService } from "@/services/admin/adminBookingService";
import { useAdminSession } from "./useAdminSession";

export interface UseAdminBookingsReturn {
  // Data
  data: ListBookingsResult | null;
  metrics: BookingSummaryMetrics | null;
  availableCities: string[];
  availableCategories: string[];
  availableProviders: { id: string; name: string }[];
  availableCustomers: { id: string; name: string }[];

  // State flags
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Active Query State
  search: string;
  status: BookingStatus | "all";
  date: BookingDatePreset;
  serviceCategory: string;
  city: string;
  providerId: string;
  customerId: string;
  sort: BookingSortField;
  sortDirection: BookingSortDirection;
  page: number;
  pageSize: number;

  // Mutators
  setSearch: (value: string) => void;
  setStatus: (value: BookingStatus | "all") => void;
  setDate: (value: BookingDatePreset) => void;
  setServiceCategory: (value: string) => void;
  setCity: (value: string) => void;
  setProviderId: (value: string) => void;
  setCustomerId: (value: string) => void;
  setSort: (field: BookingSortField, direction?: BookingSortDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;

  // Actions
  updateBooking: (
    bookingId: string,
    payload: BookingEditFormValues
  ) => Promise<BookingOrder>;
  updateBookingStatus: (
    bookingId: string,
    newStatus: BookingStatus,
    reason?: string
  ) => Promise<BookingOrder>;
}

export function useAdminBookings(): UseAdminBookingsReturn {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial values from URL query parameters if present
  const initialSearch = searchParams?.get("search") || "";
  const initialStatus =
    (searchParams?.get("status") as BookingStatus | "all") || "all";
  const initialDate =
    (searchParams?.get("date") as BookingDatePreset) || "all";
  const initialCategory = searchParams?.get("category") || "all";
  const initialCity = searchParams?.get("city") || "all";
  const initialProvider = searchParams?.get("providerId") || "all";
  const initialCustomer = searchParams?.get("customerId") || "all";
  const initialSort =
    (searchParams?.get("sort") as BookingSortField) || "scheduledAt";
  const initialSortDir =
    (searchParams?.get("sortDirection") as BookingSortDirection) || "desc";
  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialPageSize = Number(searchParams?.get("pageSize")) || 10;

  // Local state
  const [search, setSearchState] = useState<string>(initialSearch);
  const [status, setStatusState] =
    useState<BookingStatus | "all">(initialStatus);
  const [date, setDateState] = useState<BookingDatePreset>(initialDate);
  const [serviceCategory, setServiceCategoryState] =
    useState<string>(initialCategory);
  const [city, setCityState] = useState<string>(initialCity);
  const [providerId, setProviderIdState] = useState<string>(initialProvider);
  const [customerId, setCustomerIdState] = useState<string>(initialCustomer);
  const [sort, setSortFieldState] = useState<BookingSortField>(initialSort);
  const [sortDirection, setSortDirectionState] =
    useState<BookingSortDirection>(initialSortDir);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const [data, setData] = useState<ListBookingsResult | null>(null);
  const [metrics, setMetrics] = useState<BookingSummaryMetrics | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableCustomers, setAvailableCustomers] = useState<
    { id: string; name: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to URL query parameters
  const updateUrlParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      if (!pathname) return;
      const params = new URLSearchParams(searchParams?.toString() || "");

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Remove default params to keep URL clean
      if (params.get("page") === "1") params.delete("page");
      if (params.get("pageSize") === "10") params.delete("pageSize");
      if (
        params.get("sort") === "scheduledAt" &&
        params.get("sortDirection") === "desc"
      ) {
        params.delete("sort");
        params.delete("sortDirection");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  // Fetch data
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await adminBookingService.listBookings({
          organizationId,
          search,
          status,
          date,
          serviceCategory,
          city,
          providerId,
          customerId,
          sort,
          sortDirection,
          page,
          pageSize,
        });

        setData(result);
        setMetrics(result.metrics);
        setAvailableCities(result.availableCities);
        setAvailableCategories(result.availableCategories);
        setAvailableProviders(result.availableProviders);
        setAvailableCustomers(result.availableCustomers);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load bookings dataset.";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      organizationId,
      search,
      status,
      date,
      serviceCategory,
      city,
      providerId,
      customerId,
      sort,
      sortDirection,
      page,
      pageSize,
    ]
  );

  // Re-fetch on any filter/sort/pagination change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutators with URL parameter synchronization & page reset
  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setPageState(1);
      updateUrlParams({ search: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setStatus = useCallback(
    (value: BookingStatus | "all") => {
      setStatusState(value);
      setPageState(1);
      updateUrlParams({ status: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setDate = useCallback(
    (value: BookingDatePreset) => {
      setDateState(value);
      setPageState(1);
      updateUrlParams({ date: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setServiceCategory = useCallback(
    (value: string) => {
      setServiceCategoryState(value);
      setPageState(1);
      updateUrlParams({ category: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setCity = useCallback(
    (value: string) => {
      setCityState(value);
      setPageState(1);
      updateUrlParams({ city: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setProviderId = useCallback(
    (value: string) => {
      setProviderIdState(value);
      setPageState(1);
      updateUrlParams({ providerId: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setCustomerId = useCallback(
    (value: string) => {
      setCustomerIdState(value);
      setPageState(1);
      updateUrlParams({ customerId: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setSort = useCallback(
    (field: BookingSortField, direction?: BookingSortDirection) => {
      let newDir: BookingSortDirection = direction || "asc";
      if (!direction) {
        if (sort === field) {
          newDir = sortDirection === "asc" ? "desc" : "asc";
        } else {
          newDir = field === "scheduledAt" || field === "createdAt" ? "desc" : "asc";
        }
      }
      setSortFieldState(field);
      setSortDirectionState(newDir);
      updateUrlParams({ sort: field, sortDirection: newDir });
    },
    [sort, sortDirection, updateUrlParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      updateUrlParams({ page: newPage });
    },
    [updateUrlParams]
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize);
      setPageState(1);
      updateUrlParams({ pageSize: newPageSize, page: 1 });
    },
    [updateUrlParams]
  );

  const clearFilters = useCallback(() => {
    setSearchState("");
    setStatusState("all");
    setDateState("all");
    setServiceCategoryState("all");
    setCityState("all");
    setProviderIdState("all");
    setCustomerIdState("all");
    setSortFieldState("scheduledAt");
    setSortDirectionState("desc");
    setPageState(1);

    if (pathname) {
      startTransition(() => {
        router.replace(pathname, { scroll: false });
      });
    }
  }, [pathname, router]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Actions
  const updateBooking = useCallback(
    async (
      bookingId: string,
      payload: BookingEditFormValues
    ): Promise<BookingOrder> => {
      const updated = await adminBookingService.updateBooking(
        organizationId,
        bookingId,
        payload,
        actorName
      );
      await refresh();
      return updated;
    },
    [organizationId, actorName, refresh]
  );

  const updateBookingStatus = useCallback(
    async (
      bookingId: string,
      newStatus: BookingStatus,
      reason?: string
    ): Promise<BookingOrder> => {
      const updated = await adminBookingService.updateBookingStatus(
        organizationId,
        bookingId,
        newStatus,
        actorName,
        reason
      );
      await refresh();
      return updated;
    },
    [organizationId, actorName, refresh]
  );

  return {
    data,
    metrics,
    availableCities,
    availableCategories,
    availableProviders,
    availableCustomers,
    isLoading,
    isRefreshing,
    error,
    search,
    status,
    date,
    serviceCategory,
    city,
    providerId,
    customerId,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setDate,
    setServiceCategory,
    setCity,
    setProviderId,
    setCustomerId,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh,
    updateBooking,
    updateBookingStatus,
  };
}
