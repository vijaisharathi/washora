"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Provider,
  ProviderApprovalStatus,
  ProviderRatingFilter,
  ProviderSortDirection,
  ProviderSortField,
  ProviderStatus,
  ProviderSummaryMetrics,
  PaginatedResult,
  UpdateProviderPayload,
  UpdateProviderStatusPayload,
  UpdateProviderApprovalPayload,
} from "@/types/admin";
import { adminProviderService } from "@/services/admin/adminProviderService";
import { useAdminSession } from "./useAdminSession";

export interface UseAdminProvidersReturn {
  // Data
  data: PaginatedResult<Provider> | null;
  metrics: ProviderSummaryMetrics | null;
  cities: string[];
  categories: string[];

  // State flags
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Active Filter / Query Values
  search: string;
  status: ProviderStatus | "all";
  approvalStatus: ProviderApprovalStatus | "all";
  serviceCategory: string | "all";
  city: string | "all";
  rating: ProviderRatingFilter;
  sort: ProviderSortField;
  sortDirection: ProviderSortDirection;
  page: number;
  pageSize: number;

  // State Mutators
  setSearch: (value: string) => void;
  setStatus: (value: ProviderStatus | "all") => void;
  setApprovalStatus: (value: ProviderApprovalStatus | "all") => void;
  setServiceCategory: (value: string | "all") => void;
  setCity: (value: string | "all") => void;
  setRating: (value: ProviderRatingFilter) => void;
  setSort: (field: ProviderSortField, direction?: ProviderSortDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;

  // Actions
  updateProvider: (
    providerId: string,
    payload: UpdateProviderPayload
  ) => Promise<Provider>;
  updateProviderApproval: (
    providerId: string,
    payload: UpdateProviderApprovalPayload
  ) => Promise<Provider>;
  updateProviderStatus: (
    providerId: string,
    payload: UpdateProviderStatusPayload
  ) => Promise<Provider>;
}

export function useAdminProviders(): UseAdminProvidersReturn {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial values from URL query parameters if present
  const initialSearch = searchParams?.get("search") || "";
  const initialStatus = (searchParams?.get("status") as ProviderStatus | "all") || "all";
  const initialApprovalStatus =
    (searchParams?.get("approvalStatus") as ProviderApprovalStatus | "all") || "all";
  const initialCategory = searchParams?.get("serviceCategory") || "all";
  const initialCity = searchParams?.get("city") || "all";
  const initialRating =
    (searchParams?.get("rating") as ProviderRatingFilter) || "all";
  const initialSort = (searchParams?.get("sort") as ProviderSortField) || "joinedAt";
  const initialSortDir =
    (searchParams?.get("sortDirection") as ProviderSortDirection) || "desc";
  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialPageSize = Number(searchParams?.get("pageSize")) || 10;

  // Local state
  const [search, setSearchState] = useState<string>(initialSearch);
  const [status, setStatusState] = useState<ProviderStatus | "all">(initialStatus);
  const [approvalStatus, setApprovalStatusState] = useState<
    ProviderApprovalStatus | "all"
  >(initialApprovalStatus);
  const [serviceCategory, setServiceCategoryState] =
    useState<string | "all">(initialCategory);
  const [city, setCityState] = useState<string | "all">(initialCity);
  const [rating, setRatingState] = useState<ProviderRatingFilter>(initialRating);
  const [sort, setSortFieldState] = useState<ProviderSortField>(initialSort);
  const [sortDirection, setSortDirectionState] =
    useState<ProviderSortDirection>(initialSortDir);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const [data, setData] = useState<PaginatedResult<Provider> | null>(null);
  const [metrics, setMetrics] = useState<ProviderSummaryMetrics | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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

      // Avoid redundant default params
      if (params.get("page") === "1") params.delete("page");
      if (params.get("pageSize") === "10") params.delete("pageSize");
      if (
        params.get("sort") === "joinedAt" &&
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
        const [result, summaryMetrics, distinctCities, availableCategories] =
          await Promise.all([
            adminProviderService.listProviders({
              organizationId,
              search,
              status,
              approvalStatus,
              serviceCategory,
              city,
              rating,
              sort,
              sortDirection,
              page,
              pageSize,
            }),
            adminProviderService.getProviderMetrics(organizationId),
            adminProviderService.getDistinctCities(organizationId),
            adminProviderService.getAvailableServiceCategories(organizationId),
          ]);

        setData(result);
        setMetrics(summaryMetrics);
        setCities(distinctCities);
        setCategories(availableCategories);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading providers.";
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
      approvalStatus,
      serviceCategory,
      city,
      rating,
      sort,
      sortDirection,
      page,
      pageSize,
    ]
  );

  // Trigger fetch on query dependency change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutator functions
  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setPageState(1);
      updateUrlParams({ search: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setStatus = useCallback(
    (value: ProviderStatus | "all") => {
      setStatusState(value);
      setPageState(1);
      updateUrlParams({ status: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setApprovalStatus = useCallback(
    (value: ProviderApprovalStatus | "all") => {
      setApprovalStatusState(value);
      setPageState(1);
      updateUrlParams({ approvalStatus: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setServiceCategory = useCallback(
    (value: string | "all") => {
      setServiceCategoryState(value);
      setPageState(1);
      updateUrlParams({ serviceCategory: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setCity = useCallback(
    (value: string | "all") => {
      setCityState(value);
      setPageState(1);
      updateUrlParams({ city: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setRating = useCallback(
    (value: ProviderRatingFilter) => {
      setRatingState(value);
      setPageState(1);
      updateUrlParams({ rating: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setSort = useCallback(
    (newSort: ProviderSortField, newDir?: ProviderSortDirection) => {
      let resolvedDir = newDir;
      if (!resolvedDir) {
        if (newSort === sort) {
          resolvedDir = sortDirection === "asc" ? "desc" : "asc";
        } else {
          resolvedDir = "desc";
        }
      }
      setSortFieldState(newSort);
      setSortDirectionState(resolvedDir);
      setPageState(1);
      updateUrlParams({ sort: newSort, sortDirection: resolvedDir, page: 1 });
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
    setApprovalStatusState("all");
    setServiceCategoryState("all");
    setCityState("all");
    setRatingState("all");
    setSortFieldState("joinedAt");
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

  const updateProvider = useCallback(
    async (
      providerId: string,
      payload: UpdateProviderPayload
    ): Promise<Provider> => {
      const updated = await adminProviderService.updateProvider(
        organizationId,
        providerId,
        payload
      );
      await refresh();
      return updated;
    },
    [organizationId, refresh]
  );

  const updateProviderApproval = useCallback(
    async (
      providerId: string,
      payload: UpdateProviderApprovalPayload
    ): Promise<Provider> => {
      const updated = await adminProviderService.updateProviderApproval(
        organizationId,
        providerId,
        payload
      );
      await refresh();
      return updated;
    },
    [organizationId, refresh]
  );

  const updateProviderStatus = useCallback(
    async (
      providerId: string,
      payload: UpdateProviderStatusPayload
    ): Promise<Provider> => {
      const updated = await adminProviderService.updateProviderStatus(
        organizationId,
        providerId,
        payload
      );
      await refresh();
      return updated;
    },
    [organizationId, refresh]
  );

  return {
    data,
    metrics,
    cities,
    categories,
    isLoading,
    isRefreshing,
    error,
    search,
    status,
    approvalStatus,
    serviceCategory,
    city,
    rating,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setApprovalStatus,
    setServiceCategory,
    setCity,
    setRating,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh,
    updateProvider,
    updateProviderApproval,
    updateProviderStatus,
  };
}
