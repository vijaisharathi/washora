"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Service,
  ServiceStatus,
  ServiceCategory,
  PriceRangePreset,
  DurationPreset,
  ServiceSortField,
  ServiceSortDirection,
  ServiceSummaryMetrics,
  ListServicesResult,
  CreateServiceFormValues,
  EditServiceFormValues,
} from "@/types/admin";
import { adminServiceCatalogService } from "@/services/admin/adminServiceCatalogService";
import { useAdminSession } from "./useAdminSession";

export interface UseAdminServicesReturn {
  // Data
  data: ListServicesResult | null;
  metrics: ServiceSummaryMetrics | null;

  // State flags
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Active Query State
  search: string;
  status: ServiceStatus | "all";
  category: ServiceCategory | "all";
  priceRange: PriceRangePreset;
  duration: DurationPreset;
  sort: ServiceSortField;
  sortDirection: ServiceSortDirection;
  page: number;
  pageSize: number;

  // Mutators
  setSearch: (value: string) => void;
  setStatus: (value: ServiceStatus | "all") => void;
  setCategory: (value: ServiceCategory | "all") => void;
  setPriceRange: (value: PriceRangePreset) => void;
  setDuration: (value: DurationPreset) => void;
  setSort: (field: ServiceSortField, direction?: ServiceSortDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;

  // Actions
  createService: (payload: CreateServiceFormValues) => Promise<Service>;
  updateService: (
    serviceId: string,
    payload: EditServiceFormValues
  ) => Promise<Service>;
  updateServiceStatus: (
    serviceId: string,
    newStatus: ServiceStatus,
    reason?: string
  ) => Promise<Service>;
}

export function useAdminServices(): UseAdminServicesReturn {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial query values from URL
  const initialSearch = searchParams?.get("search") || "";
  const initialStatus =
    (searchParams?.get("status") as ServiceStatus | "all") || "all";
  const initialCategory =
    (searchParams?.get("category") as ServiceCategory | "all") || "all";
  const initialPriceRange =
    (searchParams?.get("priceRange") as PriceRangePreset) || "all";
  const initialDuration =
    (searchParams?.get("duration") as DurationPreset) || "all";
  const initialSort =
    (searchParams?.get("sort") as ServiceSortField) || "updatedAt";
  const initialSortDir =
    (searchParams?.get("sortDirection") as ServiceSortDirection) || "desc";
  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialPageSize = Number(searchParams?.get("pageSize")) || 10;

  // Local state
  const [search, setSearchState] = useState<string>(initialSearch);
  const [status, setStatusState] =
    useState<ServiceStatus | "all">(initialStatus);
  const [category, setCategoryState] = useState<ServiceCategory | "all">(
    initialCategory
  );
  const [priceRange, setPriceRangeState] =
    useState<PriceRangePreset>(initialPriceRange);
  const [duration, setDurationState] =
    useState<DurationPreset>(initialDuration);
  const [sort, setSortFieldState] = useState<ServiceSortField>(initialSort);
  const [sortDirection, setSortDirectionState] =
    useState<ServiceSortDirection>(initialSortDir);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const [data, setData] = useState<ListServicesResult | null>(null);
  const [metrics, setMetrics] = useState<ServiceSummaryMetrics | null>(null);
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

      // Avoid default parameters in URL
      if (params.get("page") === "1") params.delete("page");
      if (params.get("pageSize") === "10") params.delete("pageSize");
      if (
        params.get("sort") === "updatedAt" &&
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
        const result = await adminServiceCatalogService.listServices({
          organizationId,
          search,
          status,
          category,
          priceRange,
          duration,
          sort,
          sortDirection,
          page,
          pageSize,
        });

        setData(result);
        setMetrics(result.metrics);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load services catalog.";
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
      category,
      priceRange,
      duration,
      sort,
      sortDirection,
      page,
      pageSize,
    ]
  );

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
    (value: ServiceStatus | "all") => {
      setStatusState(value);
      setPageState(1);
      updateUrlParams({ status: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setCategory = useCallback(
    (value: ServiceCategory | "all") => {
      setCategoryState(value);
      setPageState(1);
      updateUrlParams({ category: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setPriceRange = useCallback(
    (value: PriceRangePreset) => {
      setPriceRangeState(value);
      setPageState(1);
      updateUrlParams({ priceRange: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setDuration = useCallback(
    (value: DurationPreset) => {
      setDurationState(value);
      setPageState(1);
      updateUrlParams({ duration: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setSort = useCallback(
    (field: ServiceSortField, direction?: ServiceSortDirection) => {
      let newDir: ServiceSortDirection = direction || "asc";
      if (!direction) {
        if (sort === field) {
          newDir = sortDirection === "asc" ? "desc" : "asc";
        } else {
          newDir =
            field === "updatedAt" || field === "createdAt" ? "desc" : "asc";
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
    setCategoryState("all");
    setPriceRangeState("all");
    setDurationState("all");
    setSortFieldState("updatedAt");
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
  const createService = useCallback(
    async (payload: CreateServiceFormValues): Promise<Service> => {
      const created = await adminServiceCatalogService.createService(
        organizationId,
        payload,
        actorName
      );
      await refresh();
      return created;
    },
    [organizationId, actorName, refresh]
  );

  const updateService = useCallback(
    async (
      serviceId: string,
      payload: EditServiceFormValues
    ): Promise<Service> => {
      const updated = await adminServiceCatalogService.updateService(
        organizationId,
        serviceId,
        payload,
        actorName
      );
      await refresh();
      return updated;
    },
    [organizationId, actorName, refresh]
  );

  const updateServiceStatus = useCallback(
    async (
      serviceId: string,
      newStatus: ServiceStatus,
      reason?: string
    ): Promise<Service> => {
      const updated = await adminServiceCatalogService.updateServiceStatus(
        organizationId,
        serviceId,
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
    isLoading,
    isRefreshing,
    error,
    search,
    status,
    category,
    priceRange,
    duration,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setCategory,
    setPriceRange,
    setDuration,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh,
    createService,
    updateService,
    updateServiceStatus,
  };
}
