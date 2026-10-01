"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  CommunicationMessage,
  CommunicationChannel,
  CommunicationStatus,
  RecipientType,
  ListCommunicationsParams,
  ListCommunicationsResult,
  CommunicationDetailResult,
} from "@/types/admin/notification";
import {
  listCommunications,
  getCommunicationById,
  listDrafts as apiListDrafts,
  saveDraft as apiSaveDraft,
  sendMessage as apiSendMessage,
  archiveMessage as apiArchiveMessage,
  deleteDraft as apiDeleteDraft,
  getRecipientOptions as apiGetRecipientOptions,
} from "@/services/admin/adminNotificationService";

export function useAdminCommunications(initialParams?: Partial<ListCommunicationsParams>) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ListCommunicationsResult>({
    messages: [],
    total: 0,
    draftCount: 0,
    sentCount: 0,
    archivedCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  // Search and filter states
  const [search, setSearch] = useState(initialParams?.search || "");
  const [status, setStatus] = useState<CommunicationStatus | "all">(
    initialParams?.status || "all"
  );
  const [recipientType, setRecipientType] = useState<RecipientType | "all">(
    initialParams?.recipientType || "all"
  );
  const [channel, setChannel] = useState<CommunicationChannel | "all">(
    initialParams?.channel || "all"
  );
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  >(initialParams?.datePreset || "all");
  const [sort, setSort] = useState<"newest" | "oldest" | "subject" | "status">(
    initialParams?.sort || "newest"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialParams?.sortDirection || "desc"
  );
  const [page, setPage] = useState(initialParams?.page || 1);
  const [pageSize, setPageSize] = useState(initialParams?.pageSize || 10);

  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await listCommunications({
        organizationId,
        userId,
        search,
        status,
        recipientType,
        channel,
        datePreset,
        sort,
        sortDirection,
        page,
        pageSize,
      });

      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load communications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    userId,
    search,
    status,
    recipientType,
    channel,
    datePreset,
    sort,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setRecipientType("all");
    setChannel("all");
    setDatePreset("all");
    setSort("newest");
    setSortDirection("desc");
    setPage(1);
  }, []);

  const archiveMessage = async (msgId: string): Promise<CommunicationMessage> => {
    const updated = await apiArchiveMessage(organizationId, msgId, userId);
    await fetchCommunications();
    return updated;
  };

  return {
    organizationId,
    userId,
    loading,
    error,
    result,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    status,
    setStatus: (val: CommunicationStatus | "all") => {
      setStatus(val);
      setPage(1);
    },
    recipientType,
    setRecipientType: (val: RecipientType | "all") => {
      setRecipientType(val);
      setPage(1);
    },
    channel,
    setChannel: (val: CommunicationChannel | "all") => {
      setChannel(val);
      setPage(1);
    },
    datePreset,
    setDatePreset: (
      val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
    ) => {
      setDatePreset(val);
      setPage(1);
    },
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    page,
    setPage,
    pageSize,
    setPageSize: (val: number) => {
      setPageSize(val);
      setPage(1);
    },
    resetFilters,
    refetch: fetchCommunications,
    archiveMessage,
  };
}

export function useAdminCommunicationDetails(communicationId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommunicationDetailResult | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!communicationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getCommunicationById(organizationId, communicationId, userId);
      if (!res) {
        setError(`Message ${communicationId} not found in this organization.`);
      } else {
        setData(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load message details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organizationId, communicationId, userId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const archive = async () => {
    await apiArchiveMessage(organizationId, communicationId, userId);
    await fetchDetails();
  };

  return {
    loading,
    error,
    data,
    refetch: fetchDetails,
    archive,
  };
}

export function useAdminDrafts() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<CommunicationMessage[]>([]);

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiListDrafts(organizationId, userId);
      setDrafts(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load drafts";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organizationId, userId]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const deleteDraft = async (msgId: string) => {
    await apiDeleteDraft(organizationId, msgId, userId);
    await fetchDrafts();
  };

  return {
    loading,
    error,
    drafts,
    deleteDraft,
    refetch: fetchDrafts,
  };
}

export function useAdminComposeMessage(draftId?: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(Boolean(draftId));
  const [error, setError] = useState<string | null>(null);
  const [recipientOptions, setRecipientOptions] = useState<
    Array<{ id: string; name: string; info: string }>
  >([]);

  const [recipientType, setRecipientType] = useState<RecipientType>("Provider");

  const fetchRecipientOptions = useCallback(
    async (type: RecipientType) => {
      const opts = await apiGetRecipientOptions(organizationId, type);
      setRecipientOptions(opts);
    },
    [organizationId]
  );

  useEffect(() => {
    fetchRecipientOptions(recipientType);
  }, [fetchRecipientOptions, recipientType]);

  const saveDraft = async (data: {
    id?: string;
    channel?: CommunicationChannel;
    subject: string;
    body: string;
    recipientType: RecipientType;
    recipientIds: string[];
    relatedBookingId?: string;
    relatedProviderId?: string;
    relatedDeliveryPartnerId?: string;
  }): Promise<CommunicationMessage> => {
    return apiSaveDraft(organizationId, userId, {
      ...data,
      id: draftId || data.id,
    });
  };

  const sendMessage = async (data: {
    id?: string;
    channel?: CommunicationChannel;
    subject: string;
    body: string;
    recipientType: RecipientType;
    recipientIds: string[];
    relatedBookingId?: string;
    relatedProviderId?: string;
    relatedDeliveryPartnerId?: string;
  }): Promise<CommunicationMessage> => {
    return apiSendMessage(organizationId, userId, {
      ...data,
      id: draftId || data.id,
    });
  };

  return {
    organizationId,
    userId,
    loading,
    error,
    recipientType,
    setRecipientType,
    recipientOptions,
    saveDraft,
    sendMessage,
  };
}
