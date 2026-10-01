"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  OperationalBookingView,
  OperationsSummaryMetrics,
  OperationalQueueTab,
  OperationsSortField,
  OperationsSortDirection,
  AssignmentStatus,
  ListOperationsResult,
  BookingAssignment,
} from "@/types/admin/operations";
import { BookingStatus } from "@/types/admin/booking";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import { getMockProvidersByOrg } from "@/mocks/admin/provider.mock";
import { getMockDeliveryPartnersByOrg } from "@/mocks/admin/deliveryPartner.mock";
import { useAdminSession } from "./useAdminSession";

export interface UseAdminOperationsReturn {
  // Data
  data: ListOperationsResult | null;
  metrics: OperationsSummaryMetrics | null;
  items: OperationalBookingView[];

  // Filter options
  availableCategories: string[];
  availableCities: string[];
  availableProviders: { id: string; name: string }[];
  availableDeliveryPartners: { id: string; name: string }[];

  // States
  isLoading: boolean;
  error: string | null;

  // Active query parameters
  queueTab: OperationalQueueTab;
  search: string;
  assignmentStatus: AssignmentStatus | "all" | "Delivery Pending";
  bookingStatus: BookingStatus | "all";
  category: string;
  city: string;
  providerId: string;
  deliveryPartnerId: string;
  date: "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days";
  sort: OperationsSortField;
  sortDirection: OperationsSortDirection;
  page: number;
  pageSize: number;

  // Query mutators
  setQueueTab: (tab: OperationalQueueTab) => void;
  setSearch: (value: string) => void;
  setAssignmentStatus: (status: AssignmentStatus | "all" | "Delivery Pending") => void;
  setBookingStatus: (status: BookingStatus | "all") => void;
  setCategory: (category: string) => void;
  setCity: (city: string) => void;
  setProviderId: (providerId: string) => void;
  setDeliveryPartnerId: (partnerId: string) => void;
  setDate: (date: "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days") => void;
  setSort: (field: OperationsSortField, dir?: OperationsSortDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;

  // Actions
  assignProvider: (bookingId: string, providerId: string, notes?: string) => Promise<BookingAssignment>;
  reassignProvider: (bookingId: string, newProviderId: string, notes?: string) => Promise<BookingAssignment>;
  unassignProvider: (bookingId: string, notes?: string) => Promise<BookingAssignment>;
  assignDeliveryPartner: (bookingId: string, partnerId: string, notes?: string) => Promise<BookingAssignment>;
  reassignDeliveryPartner: (bookingId: string, newPartnerId: string, notes?: string) => Promise<BookingAssignment>;
  unassignDeliveryPartner: (bookingId: string, notes?: string) => Promise<BookingAssignment>;
}

export function useAdminOperations(): UseAdminOperationsReturn {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial query values
  const initialQueueTab = (searchParams?.get("tab") as OperationalQueueTab) || "all";
  const initialSearch = searchParams?.get("search") || "";
  const initialAsnStatus =
    (searchParams?.get("asnStatus") as AssignmentStatus | "all" | "Delivery Pending") || "all";
  const initialBkgStatus =
    (searchParams?.get("bkgStatus") as BookingStatus | "all") || "all";
  const initialCategory = searchParams?.get("category") || "all";
  const initialCity = searchParams?.get("city") || "all";
  const initialProviderId = searchParams?.get("providerId") || "all";
  const initialDeliveryPartnerId = searchParams?.get("deliveryPartnerId") || "all";
  const initialDate =
    (searchParams?.get("date") as "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days") ||
    "all";
  const initialSort =
    (searchParams?.get("sort") as OperationsSortField) || "scheduledAt";
  const initialSortDir =
    (searchParams?.get("sortDirection") as OperationsSortDirection) || "asc";
  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialPageSize = Number(searchParams?.get("pageSize")) || 10;

  // Local query state
  const [queueTab, setQueueTabState] = useState<OperationalQueueTab>(initialQueueTab);
  const [search, setSearchState] = useState<string>(initialSearch);
  const [assignmentStatus, setAssignmentStatusState] = useState<
    AssignmentStatus | "all" | "Delivery Pending"
  >(initialAsnStatus);
  const [bookingStatus, setBookingStatusState] = useState<BookingStatus | "all">(
    initialBkgStatus
  );
  const [category, setCategoryState] = useState<string>(initialCategory);
  const [city, setCityState] = useState<string>(initialCity);
  const [providerId, setProviderIdState] = useState<string>(initialProviderId);
  const [deliveryPartnerId, setDeliveryPartnerIdState] = useState<string>(
    initialDeliveryPartnerId
  );
  const [date, setDateState] = useState<
    "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days"
  >(initialDate);
  const [sort, setSortState] = useState<OperationsSortField>(initialSort);
  const [sortDirection, setSortDirectionState] =
    useState<OperationsSortDirection>(initialSortDir);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  // Async data state
  const [data, setData] = useState<ListOperationsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize URL query params
  const syncUrl = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const current = new URLSearchParams(searchParams ? searchParams.toString() : "");

      Object.entries(newParams).forEach(([key, val]) => {
        if (
          val === undefined ||
          val === "" ||
          val === "all" ||
          (key === "page" && val === 1) ||
          (key === "pageSize" && val === 10) ||
          (key === "tab" && val === "all") ||
          (key === "sort" && val === "scheduledAt") ||
          (key === "sortDirection" && val === "asc")
        ) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });

      const queryString = current.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  // Fetch operations items
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminOperationsService.listOperationalBookings({
        organizationId,
        queueTab,
        search,
        assignmentStatus,
        bookingStatus,
        category,
        city,
        providerId,
        deliveryPartnerId,
        date,
        sort,
        sortDirection,
        page,
        pageSize,
      });

      setData(result);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load operational queue";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    organizationId,
    queueTab,
    search,
    assignmentStatus,
    bookingStatus,
    category,
    city,
    providerId,
    deliveryPartnerId,
    date,
    sort,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutators
  const setQueueTab = (newTab: OperationalQueueTab) => {
    setQueueTabState(newTab);
    setPageState(1);
    syncUrl({ tab: newTab, page: 1 });
  };

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(1);
    syncUrl({ search: newSearch, page: 1 });
  };

  const setAssignmentStatus = (
    newStatus: AssignmentStatus | "all" | "Delivery Pending"
  ) => {
    setAssignmentStatusState(newStatus);
    setPageState(1);
    syncUrl({ asnStatus: newStatus, page: 1 });
  };

  const setBookingStatus = (newStatus: BookingStatus | "all") => {
    setBookingStatusState(newStatus);
    setPageState(1);
    syncUrl({ bkgStatus: newStatus, page: 1 });
  };

  const setCategory = (newCat: string) => {
    setCategoryState(newCat);
    setPageState(1);
    syncUrl({ category: newCat, page: 1 });
  };

  const setCity = (newCity: string) => {
    setCityState(newCity);
    setPageState(1);
    syncUrl({ city: newCity, page: 1 });
  };

  const setProviderId = (newPid: string) => {
    setProviderIdState(newPid);
    setPageState(1);
    syncUrl({ providerId: newPid, page: 1 });
  };

  const setDeliveryPartnerId = (newDid: string) => {
    setDeliveryPartnerIdState(newDid);
    setPageState(1);
    syncUrl({ deliveryPartnerId: newDid, page: 1 });
  };

  const setDate = (
    newDate: "all" | "today" | "tomorrow" | "next_7_days" | "past_7_days" | "past_30_days"
  ) => {
    setDateState(newDate);
    setPageState(1);
    syncUrl({ date: newDate, page: 1 });
  };

  const setSort = (
    field: OperationsSortField,
    direction?: OperationsSortDirection
  ) => {
    let nextDir: OperationsSortDirection = "asc";
    if (direction) {
      nextDir = direction;
    } else if (sort === field) {
      nextDir = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortState(field);
    setSortDirectionState(nextDir);
    setPageState(1);
    syncUrl({ sort: field, sortDirection: nextDir, page: 1 });
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
    syncUrl({ page: newPage });
  };

  const setPageSize = (newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPageState(1);
    syncUrl({ pageSize: newPageSize, page: 1 });
  };

  const clearFilters = () => {
    setQueueTabState("all");
    setSearchState("");
    setAssignmentStatusState("all");
    setBookingStatusState("all");
    setCategoryState("all");
    setCityState("all");
    setProviderIdState("all");
    setDeliveryPartnerIdState("all");
    setDateState("all");
    setSortState("scheduledAt");
    setSortDirectionState("asc");
    setPageState(1);

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  // Actions
  const assignProvider = async (
    bookingId: string,
    pId: string,
    notes?: string
  ) => {
    const res = await adminOperationsService.assignProvider(
      organizationId,
      bookingId,
      pId,
      actorName,
      notes
    );
    await fetchData();
    return res;
  };

  const reassignProvider = async (
    bookingId: string,
    newPId: string,
    notes?: string
  ) => {
    const res = await adminOperationsService.reassignProvider(
      organizationId,
      bookingId,
      newPId,
      actorName,
      notes
    );
    await fetchData();
    return res;
  };

  const unassignProvider = async (bookingId: string, notes?: string) => {
    const res = await adminOperationsService.unassignProvider(
      organizationId,
      bookingId,
      actorName,
      notes
    );
    await fetchData();
    return res;
  };

  const assignDeliveryPartner = async (
    bookingId: string,
    dpId: string,
    notes?: string
  ) => {
    const res = await adminOperationsService.assignDeliveryPartner(
      organizationId,
      bookingId,
      dpId,
      actorName,
      notes
    );
    await fetchData();
    return res;
  };

  const reassignDeliveryPartner = async (
    bookingId: string,
    newDpId: string,
    notes?: string
  ) => {
    const res = await adminOperationsService.reassignDeliveryPartner(
      organizationId,
      bookingId,
      newDpId,
      actorName,
      notes
    );
    await fetchData();
    return res;
  };

  const unassignDeliveryPartner = async (bookingId: string, notes?: string) => {
    const res = await adminOperationsService.unassignDeliveryPartner(
      organizationId,
      bookingId,
      actorName,
      notes
    );
    await fetchData();
    return res;
  };

  // Static options
  const availableCategories = [
    "Home Cleaning",
    "Deep Cleaning",
    "Kitchen Cleaning",
    "Bathroom Cleaning",
    "Sofa Cleaning",
    "Carpet Cleaning",
    "Laundry",
    "Appliance Cleaning",
  ];

  const availableCities = [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Trichy",
    "Salem",
    "Tirunelveli",
  ];

  const availableProviders = getMockProvidersByOrg(organizationId).map((p) => ({
    id: p.id,
    name: p.fullName,
  }));

  const availableDeliveryPartners = getMockDeliveryPartnersByOrg(organizationId).map(
    (d) => ({
      id: d.id,
      name: d.fullName,
    })
  );

  return {
    data,
    metrics: data?.metrics || null,
    items: data?.items || [],
    availableCategories,
    availableCities,
    availableProviders,
    availableDeliveryPartners,
    isLoading,
    error,
    queueTab,
    search,
    assignmentStatus,
    bookingStatus,
    category,
    city,
    providerId,
    deliveryPartnerId,
    date,
    sort,
    sortDirection,
    page,
    pageSize,
    setQueueTab,
    setSearch,
    setAssignmentStatus,
    setBookingStatus,
    setCategory,
    setCity,
    setProviderId,
    setDeliveryPartnerId,
    setDate,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    refresh: fetchData,
    assignProvider,
    reassignProvider,
    unassignProvider,
    assignDeliveryPartner,
    reassignDeliveryPartner,
    unassignDeliveryPartner,
  };
}
