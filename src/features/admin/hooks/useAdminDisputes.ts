import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  Dispute,
  DisputeStatus,
  DisputeType,
  SupportPriority,
  DisputeOutcome,
  DisputeSummaryMetrics,
  DisputeDetailResult,
  AssigneeOption,
} from "@/types/admin/support";
import { adminSupportService } from "@/services/admin/adminSupportService";

export function useAdminDisputesList() {
  const { session } = useAdminSession();
  const orgId = session?.user?.organizationId || "ORG-0001";
  const userId = session?.user?.id || "ADM-0001";
  const userName = session?.user?.name || "Operations Lead";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DisputeSummaryMetrics | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DisputeStatus | "all">("all");
  const [type, setType] = useState<DisputeType | "all">("all");
  const [priority, setPriority] = useState<SupportPriority | "all">("all");
  const [raisedBy, setRaisedBy] = useState<"all" | "Customer" | "Provider" | "Delivery Partner">("all");
  const [assignedState, setAssignedState] = useState<"all" | "assigned" | "unassigned">("all");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "yesterday" | "last_7_days" | "last_30_days">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "highest_priority" | "amount" | "status" | "updated_at">("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, listRes] = await Promise.all([
        adminSupportService.getDisputeSummary(orgId),
        adminSupportService.listDisputes({
          organizationId: orgId,
          search,
          status,
          type,
          priority,
          raisedBy,
          assignedState,
          datePreset,
          sort,
          sortDirection,
          page,
          pageSize,
        }),
      ]);

      setSummary(summaryRes);
      setDisputes(listRes.disputes);
      setTotal(listRes.total);
      setTotalPages(listRes.totalPages);
    } catch (err: any) {
      setError(err?.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [
    orgId,
    search,
    status,
    type,
    priority,
    raisedBy,
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

  const updateStatus = async (disputeId: string, newStatus: DisputeStatus) => {
    try {
      await adminSupportService.updateDisputeStatus(orgId, disputeId, newStatus, userId, userName);
      await fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  const assignDispute = async (disputeId: string, assigneeId: string) => {
    try {
      await adminSupportService.assignDispute(orgId, disputeId, assigneeId, userId, userName);
      await fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  const recordDecision = async (disputeId: string, outcome: DisputeOutcome, resolution: string) => {
    try {
      await adminSupportService.recordDisputeDecision(orgId, disputeId, outcome, resolution, userId, userName);
      await fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    loading,
    error,
    summary,
    disputes,
    total,
    totalPages,
    page,
    pageSize,
    search,
    status,
    type,
    priority,
    raisedBy,
    assignedState,
    datePreset,
    sort,
    sortDirection,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setType,
    setPriority,
    setRaisedBy,
    setAssignedState,
    setDatePreset,
    setSort,
    setSortDirection,
    refetch: fetchData,
    updateStatus,
    assignDispute,
    recordDecision,
  };
}

export function useAdminDisputeDetail(disputeId: string) {
  const { session } = useAdminSession();
  const orgId = session?.user?.organizationId || "ORG-0001";
  const userId = session?.user?.id || "ADM-0001";
  const userName = session?.user?.name || "Operations Lead";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DisputeDetailResult | null>(null);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);

  const fetchDetail = useCallback(async () => {
    if (!disputeId) return;
    setLoading(true);
    setError(null);
    try {
      const [disputeRes, assigneesRes] = await Promise.all([
        adminSupportService.getDisputeById(orgId, disputeId),
        adminSupportService.getEligibleAssignees(orgId),
      ]);

      if (!disputeRes) {
        setError("Dispute case not found in active organization.");
      } else {
        setDetail(disputeRes);
      }
      setAssignees(assigneesRes);
    } catch (err: any) {
      setError(err?.message || "Failed to load dispute details");
    } finally {
      setLoading(false);
    }
  }, [orgId, disputeId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = async (newStatus: DisputeStatus) => {
    if (!disputeId) return;
    try {
      await adminSupportService.updateDisputeStatus(orgId, disputeId, newStatus, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const assignDispute = async (assigneeId: string) => {
    if (!disputeId) return;
    try {
      await adminSupportService.assignDispute(orgId, disputeId, assigneeId, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const unassignDispute = async () => {
    if (!disputeId) return;
    try {
      await adminSupportService.unassignDispute(orgId, disputeId, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const recordDecision = async (outcome: DisputeOutcome, resolution: string) => {
    if (!disputeId) return;
    try {
      await adminSupportService.recordDisputeDecision(orgId, disputeId, outcome, resolution, userId, userName);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    }
  };

  const addEvidence = async (title: string, description: string) => {
    if (!disputeId) return;
    try {
      await adminSupportService.addDisputeEvidence(orgId, disputeId, title, description, userId, userName);
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
    assignDispute,
    unassignDispute,
    recordDecision,
    addEvidence,
  };
}
