import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  SupportTicket,
  SupportStatus,
  SupportPriority,
  SupportCategory,
  SupportRequesterType,
  SupportSummaryMetrics,
  SupportTicketDetailResult,
  AssigneeOption,
  CreateSupportTicketFormValues,
} from "@/types/admin/support";
import { adminSupportService } from "@/services/admin/adminSupportService";

export function useAdminSupportList() {
  const { session } = useAdminSession();
  const orgId = session?.user?.organizationId || "ORG-0001";
  const userId = session?.user?.id || "ADM-0001";
  const userName = session?.user?.name || "Operations Lead";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SupportSummaryMetrics | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupportStatus | "all">("all");
  const [priority, setPriority] = useState<SupportPriority | "all">("all");
  const [category, setCategory] = useState<SupportCategory | "all">("all");
  const [requesterType, setRequesterType] = useState<SupportRequesterType | "all">("all");
  const [assignedState, setAssignedState] = useState<"all" | "assigned" | "unassigned">("all");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "yesterday" | "last_7_days" | "last_30_days">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "priority" | "status" | "requester" | "category" | "updated_at">("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, listRes] = await Promise.all([
        adminSupportService.getSupportSummary(orgId),
        adminSupportService.listSupportTickets({
          organizationId: orgId,
          search,
          status,
          priority,
          category,
          requesterType,
          assignedState,
          datePreset,
          sort,
          sortDirection,
          page,
          pageSize,
        }),
      ]);

      setSummary(summaryRes);
      setTickets(listRes.tickets);
      setTotal(listRes.total);
      setTotalPages(listRes.totalPages);
    } catch (err: any) {
      setError(err?.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [
    orgId,
    search,
    status,
    priority,
    category,
    requesterType,
    assignedState,
    datePreset,
    sort,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (ticketId: string, newStatus: SupportStatus, resolution?: string) => {
    try {
      await adminSupportService.updateSupportTicketStatus(orgId, ticketId, newStatus, resolution, userId, userName);
      await fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  const assignTicket = async (ticketId: string, assigneeId: string) => {
    try {
      await adminSupportService.assignSupportTicket(orgId, ticketId, assigneeId, userId, userName);
      await fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    loading,
    error,
    summary,
    tickets,
    total,
    totalPages,
    page,
    pageSize,
    search,
    status,
    priority,
    category,
    requesterType,
    assignedState,
    datePreset,
    sort,
    sortDirection,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setPriority,
    setCategory,
    setRequesterType,
    setAssignedState,
    setDatePreset,
    setSort,
    setSortDirection,
    refetch: fetchData,
    updateStatus,
    assignTicket,
  };
}

export function useAdminSupportDetail(ticketId: string) {
  const { session } = useAdminSession();
  const orgId = session?.user?.organizationId || "ORG-0001";
  const userId = session?.user?.id || "ADM-0001";
  const userName = session?.user?.name || "Operations Lead";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicketDetailResult | null>(null);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);

  const fetchDetail = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const [ticketRes, assigneesRes] = await Promise.all([
        adminSupportService.getSupportTicketById(orgId, ticketId),
        adminSupportService.getEligibleAssignees(orgId),
      ]);

      if (!ticketRes) {
        setError("Support ticket not found in active organization.");
      } else {
        setDetail(ticketRes);
      }
      setAssignees(assigneesRes);
    } catch (err: any) {
      setError(err?.message || "Failed to load support ticket details");
    } finally {
      setLoading(false);
    }
  }, [orgId, ticketId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = async (newStatus: SupportStatus, resolution?: string) => {
    if (!ticketId) return;
    try {
      await adminSupportService.updateSupportTicketStatus(orgId, ticketId, newStatus, resolution, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const updatePriority = async (newPriority: SupportPriority) => {
    if (!ticketId) return;
    try {
      await adminSupportService.updateSupportTicketPriority(orgId, ticketId, newPriority, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const assignTicket = async (assigneeId: string) => {
    if (!ticketId) return;
    try {
      await adminSupportService.assignSupportTicket(orgId, ticketId, assigneeId, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const unassignTicket = async () => {
    if (!ticketId) return;
    try {
      await adminSupportService.unassignSupportTicket(orgId, ticketId, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const addNote = async (noteText: string) => {
    if (!ticketId) return;
    try {
      await adminSupportService.addSupportNote(orgId, ticketId, noteText, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    loading,
    error,
    detail,
    assignees,
    refetch: fetchDetail,
    updateStatus,
    updatePriority,
    assignTicket,
    unassignTicket,
    addNote,
  };
}

export function useAdminCreateSupportTicket() {
  const { session } = useAdminSession();
  const orgId = session?.user?.organizationId || "ORG-0001";
  const userId = session?.user?.id || "ADM-0001";
  const userName = session?.user?.name || "Operations Lead";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = async (data: CreateSupportTicketFormValues): Promise<SupportTicket> => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await adminSupportService.createSupportTicket(orgId, data, userId, userName);
      return ticket;
    } catch (err: any) {
      setError(err?.message || "Failed to create support ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRequesters = async (requesterType: SupportRequesterType) => {
    return adminSupportService.getRequesterOptions(orgId, requesterType);
  };

  return {
    loading,
    error,
    createTicket,
    getRequesters,
  };
}
