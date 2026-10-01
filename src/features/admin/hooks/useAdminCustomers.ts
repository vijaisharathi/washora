"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Customer,
  CustomerBookingActivityFilter,
  CustomerSortDirection,
  CustomerSortField,
  CustomerStatus,
  CustomerSummaryMetrics,
  PaginatedResult,
  UpdateCustomerPayload,
} from "@/types/admin";
import { adminCustomerService } from "@/services/admin/adminCustomerService";
import { useAdminSession } from "./useAdminSession";

export interface UseAdminCustomersReturn {
  // Data
  data: PaginatedResult<Customer> | null;
  metrics: CustomerSummaryMetrics | null;
  cities: string[];
  
  // State flags
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Active Filter / Query Values
  search: string;
  status: CustomerStatus | "all";
  city: string | "all";
  bookingActivity: CustomerBookingActivityFilter;
  sort: CustomerSortField;
  sortDirection: CustomerSortDirection;
  page: number;
  pageSize: number;
  
  // State Mutators
  setSearch: (value: string) => void;
  setStatus: (value: CustomerStatus | "all") => void;
  setCity: (value: string | "all") => void;
  setBookingActivity: (value: CustomerBookingActivityFilter) => void;
  setSort: (field: CustomerSortField, direction?: CustomerSortDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  
  // Actions
  updateCustomer: (
    customerId: string,
    payload: UpdateCustomerPayload
  ) => Promise<Customer>;
  updateCustomerStatus: (
    customerId: string,
    status: CustomerStatus,
    reason?: string
  ) => Promise<Customer>;
}

export function useAdminCustomers(): UseAdminCustomersReturn {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial values from URL query parameters if present
  const initialSearch = searchParams?.get("search") || "";
  const initialStatus = (searchParams?.get("status") as CustomerStatus | "all") || "all";
  const initialCity = searchParams?.get("city") || "all";
  const initialActivity =
    (searchParams?.get("bookingActivity") as CustomerBookingActivityFilter) || "all";
  const initialSort = (searchParams?.get("sort") as CustomerSortField) || "joinedAt";
  const initialSortDir =
    (searchParams?.get("sortDirection") as CustomerSortDirection) || "desc";
  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialPageSize = Number(searchParams?.get("pageSize")) || 10;

  // Local state
  const [search, setSearchState] = useState<string>(initialSearch);
  const [status, setStatusState] = useState<CustomerStatus | "all">(initialStatus);
  const [city, setCityState] = useState<string | "all">(initialCity);
  const [bookingActivity, setBookingActivityState] =
    useState<CustomerBookingActivityFilter>(initialActivity);
  const [sort, setSortFieldState] = useState<CustomerSortField>(initialSort);
  const [sortDirection, setSortDirectionState] =
    useState<CustomerSortDirection>(initialSortDir);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const [data, setData] = useState<PaginatedResult<Customer> | null>(null);
  const [metrics, setMetrics] = useState<CustomerSummaryMetrics | null>(null);
  const [cities, setCities] = useState<string[]>([]);
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

      // Avoid redundant page=1 param
      if (params.get("page") === "1") {
        params.delete("page");
      }
      // Avoid redundant pageSize=10 param
      if (params.get("pageSize") === "10") {
        params.delete("pageSize");
      }
      // Avoid redundant default sort params
      if (params.get("sort") === "joinedAt" && params.get("sortDirection") === "desc") {
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
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const [paginatedResult, summaryMetrics, distinctCities] = await Promise.all([
          adminCustomerService.listCustomers({
            organizationId,
            search,
            status,
            city,
            bookingActivity,
            sort,
            sortDirection,
            page,
            pageSize,
          }),
          adminCustomerService.getCustomerMetrics(organizationId),
          adminCustomerService.getDistinctCities(organizationId),
        ]);

        setData(paginatedResult);
        setMetrics(summaryMetrics);
        setCities(distinctCities);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load customers data";
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
      city,
      bookingActivity,
      sort,
      sortDirection,
      page,
      pageSize,
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler functions with automatic page reset where appropriate
  const setSearch = useCallback(
    (val: string) => {
      setSearchState(val);
      setPageState(1);
      updateUrlParams({ search: val, page: 1 });
    },
    [updateUrlParams]
  );

  const setStatus = useCallback(
    (val: CustomerStatus | "all") => {
      setStatusState(val);
      setPageState(1);
      updateUrlParams({ status: val, page: 1 });
    },
    [updateUrlParams]
  );

  const setCity = useCallback(
    (val: string | "all") => {
      setCityState(val);
      setPageState(1);
      updateUrlParams({ city: val, page: 1 });
    },
    [updateUrlParams]
  );

  const setBookingActivity = useCallback(
    (val: CustomerBookingActivityFilter) => {
      setBookingActivityState(val);
      setPageState(1);
      updateUrlParams({ bookingActivity: val, page: 1 });
    },
    [updateUrlParams]
  );

  const setSort = useCallback(
    (field: CustomerSortField, direction?: CustomerSortDirection) => {
      let newDir: CustomerSortDirection = direction || "asc";
      if (!direction && field === sort) {
        newDir = sortDirection === "asc" ? "desc" : "asc";
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
    setCityState("all");
    setBookingActivityState("all");
    setPageState(1);
    setSortFieldState("joinedAt");
    setSortDirectionState("desc");
    updateUrlParams({
      search: undefined,
      status: undefined,
      city: undefined,
      bookingActivity: undefined,
      page: 1,
      sort: undefined,
      sortDirection: undefined,
    });
  }, [updateUrlParams]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const updateCustomer = useCallback(
    async (
      customerId: string,
      payload: UpdateCustomerPayload
    ): Promise<Customer> => {
      const updated = await adminCustomerService.updateCustomer(
        organizationId,
        customerId,
        payload
      );
      await fetchData(true);
      return updated;
    },
    [organizationId, fetchData]
  );

  const updateCustomerStatus = useCallback(
    async (
      customerId: string,
      newStatus: CustomerStatus,
      reason?: string
    ): Promise<Customer> => {
      const updated = await adminCustomerService.updateCustomerStatus(
        organizationId,
        customerId,
        newStatus,
        reason
      );
      await fetchData(true);
      return updated;
    },
    [organizationId, fetchData]
  );

  return {
    data,
    metrics,
    cities,
    isLoading,
    isRefreshing,
    error,
    search,
    status,
    city,
    bookingActivity,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setCity,
    setBookingActivity,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh,
    updateCustomer,
    updateCustomerStatus,
  };
}
