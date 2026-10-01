"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  DeliveryPartner,
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerRatingFilter,
  DeliveryPartnerSortDirection,
  DeliveryPartnerSortField,
  DeliveryPartnerStatus,
  DeliveryPartnerSummaryMetrics,
  PaginatedResult,
  UpdateDeliveryPartnerPayload,
  UpdateDeliveryPartnerStatusPayload,
  UpdateDeliveryPartnerApprovalPayload,
  VehicleType,
} from "@/types/admin";
import { adminDeliveryPartnerService } from "@/services/admin/adminDeliveryPartnerService";
import { useAdminSession } from "./useAdminSession";

export interface UseAdminDeliveryPartnersReturn {
  // Data
  data: PaginatedResult<DeliveryPartner> | null;
  metrics: DeliveryPartnerSummaryMetrics | null;
  cities: string[];
  vehicleTypes: VehicleType[];

  // State flags
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Active Filter / Query Values
  search: string;
  status: DeliveryPartnerStatus | "all";
  approvalStatus: DeliveryPartnerApprovalStatus | "all";
  vehicleType: VehicleType | "all";
  city: string | "all";
  rating: DeliveryPartnerRatingFilter;
  sort: DeliveryPartnerSortField;
  sortDirection: DeliveryPartnerSortDirection;
  page: number;
  pageSize: number;

  // State Mutators
  setSearch: (value: string) => void;
  setStatus: (value: DeliveryPartnerStatus | "all") => void;
  setApprovalStatus: (value: DeliveryPartnerApprovalStatus | "all") => void;
  setVehicleType: (value: VehicleType | "all") => void;
  setCity: (value: string | "all") => void;
  setRating: (value: DeliveryPartnerRatingFilter) => void;
  setSort: (
    field: DeliveryPartnerSortField,
    direction?: DeliveryPartnerSortDirection
  ) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;

  // Actions
  updateDeliveryPartner: (
    partnerId: string,
    payload: UpdateDeliveryPartnerPayload
  ) => Promise<DeliveryPartner>;
  updateDeliveryPartnerApproval: (
    partnerId: string,
    payload: UpdateDeliveryPartnerApprovalPayload
  ) => Promise<DeliveryPartner>;
  updateDeliveryPartnerStatus: (
    partnerId: string,
    payload: UpdateDeliveryPartnerStatusPayload
  ) => Promise<DeliveryPartner>;
}

export function useAdminDeliveryPartners(): UseAdminDeliveryPartnersReturn {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial values from URL query parameters if present
  const initialSearch = searchParams?.get("search") || "";
  const initialStatus =
    (searchParams?.get("status") as DeliveryPartnerStatus | "all") || "all";
  const initialApprovalStatus =
    (searchParams?.get("approvalStatus") as
      | DeliveryPartnerApprovalStatus
      | "all") || "all";
  const initialVehicle =
    (searchParams?.get("vehicleType") as VehicleType | "all") || "all";
  const initialCity = searchParams?.get("city") || "all";
  const initialRating =
    (searchParams?.get("rating") as DeliveryPartnerRatingFilter) || "all";
  const initialSort =
    (searchParams?.get("sort") as DeliveryPartnerSortField) || "joinedAt";
  const initialSortDir =
    (searchParams?.get("sortDirection") as DeliveryPartnerSortDirection) || "desc";
  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialPageSize = Number(searchParams?.get("pageSize")) || 10;

  // Local state
  const [search, setSearchState] = useState<string>(initialSearch);
  const [status, setStatusState] =
    useState<DeliveryPartnerStatus | "all">(initialStatus);
  const [approvalStatus, setApprovalStatusState] = useState<
    DeliveryPartnerApprovalStatus | "all"
  >(initialApprovalStatus);
  const [vehicleType, setVehicleTypeState] = useState<VehicleType | "all">(
    initialVehicle
  );
  const [city, setCityState] = useState<string | "all">(initialCity);
  const [rating, setRatingState] =
    useState<DeliveryPartnerRatingFilter>(initialRating);
  const [sort, setSortFieldState] =
    useState<DeliveryPartnerSortField>(initialSort);
  const [sortDirection, setSortDirectionState] =
    useState<DeliveryPartnerSortDirection>(initialSortDir);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const [data, setData] = useState<PaginatedResult<DeliveryPartner> | null>(null);
  const [metrics, setMetrics] = useState<DeliveryPartnerSummaryMetrics | null>(
    null
  );
  const [cities, setCities] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
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
        const [result, summaryMetrics, distinctCities, availableVehicleTypes] =
          await Promise.all([
            adminDeliveryPartnerService.listDeliveryPartners({
              organizationId,
              search,
              status,
              approvalStatus,
              vehicleType,
              city,
              rating,
              sort,
              sortDirection,
              page,
              pageSize,
            }),
            adminDeliveryPartnerService.getDeliveryPartnerMetrics(organizationId),
            adminDeliveryPartnerService.getDistinctCities(organizationId),
            adminDeliveryPartnerService.getDistinctVehicleTypes(organizationId),
          ]);

        setData(result);
        setMetrics(summaryMetrics);
        setCities(distinctCities);
        setVehicleTypes(availableVehicleTypes);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading delivery partners.";
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
      vehicleType,
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

  // Mutators
  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setPageState(1);
      updateUrlParams({ search: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setStatus = useCallback(
    (value: DeliveryPartnerStatus | "all") => {
      setStatusState(value);
      setPageState(1);
      updateUrlParams({ status: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setApprovalStatus = useCallback(
    (value: DeliveryPartnerApprovalStatus | "all") => {
      setApprovalStatusState(value);
      setPageState(1);
      updateUrlParams({ approvalStatus: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setVehicleType = useCallback(
    (value: VehicleType | "all") => {
      setVehicleTypeState(value);
      setPageState(1);
      updateUrlParams({ vehicleType: value, page: 1 });
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
    (value: DeliveryPartnerRatingFilter) => {
      setRatingState(value);
      setPageState(1);
      updateUrlParams({ rating: value, page: 1 });
    },
    [updateUrlParams]
  );

  const setSort = useCallback(
    (
      newSort: DeliveryPartnerSortField,
      newDir?: DeliveryPartnerSortDirection
    ) => {
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
    setVehicleTypeState("all");
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

  const updateDeliveryPartner = useCallback(
    async (
      partnerId: string,
      payload: UpdateDeliveryPartnerPayload
    ): Promise<DeliveryPartner> => {
      const updated = await adminDeliveryPartnerService.updateDeliveryPartner(
        organizationId,
        partnerId,
        payload
      );
      await refresh();
      return updated;
    },
    [organizationId, refresh]
  );

  const updateDeliveryPartnerApproval = useCallback(
    async (
      partnerId: string,
      payload: UpdateDeliveryPartnerApprovalPayload
    ): Promise<DeliveryPartner> => {
      const updated =
        await adminDeliveryPartnerService.updateDeliveryPartnerApproval(
          organizationId,
          partnerId,
          payload
        );
      await refresh();
      return updated;
    },
    [organizationId, refresh]
  );

  const updateDeliveryPartnerStatus = useCallback(
    async (
      partnerId: string,
      payload: UpdateDeliveryPartnerStatusPayload
    ): Promise<DeliveryPartner> => {
      const updated = await adminDeliveryPartnerService.updateDeliveryPartnerStatus(
        organizationId,
        partnerId,
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
    vehicleTypes,
    isLoading,
    isRefreshing,
    error,
    search,
    status,
    approvalStatus,
    vehicleType,
    city,
    rating,
    sort,
    sortDirection,
    page,
    pageSize,
    setSearch,
    setStatus,
    setApprovalStatus,
    setVehicleType,
    setCity,
    setRating,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh,
    updateDeliveryPartner,
    updateDeliveryPartnerApproval,
    updateDeliveryPartnerStatus,
  };
}
