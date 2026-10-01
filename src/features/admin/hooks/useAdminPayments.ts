"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import { adminPaymentService } from "@/services/admin/adminPaymentService";
import {
  FinancialSummaryMetrics,
  ListTransactionsParams,
  ListTransactionsResult,
  BookingFinancialDetailResult,
  ProviderEarningsSummary,
  DeliveryPartnerEarningsSummary,
  Transaction,
  Refund,
  CreateRefundFormValues,
  EarningsStatus,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from "@/types/admin";

export function useAdminPayments(initialParams?: Partial<ListTransactionsParams>) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummaryMetrics | null>(null);
  const [result, setResult] = useState<ListTransactionsResult>({
    transactions: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const [refunds, setRefunds] = useState<Refund[]>([]);

  // Search & Filter State
  const [search, setSearch] = useState(initialParams?.search || "");
  const [type, setType] = useState<TransactionType | "all">(initialParams?.type || "all");
  const [status, setStatus] = useState<TransactionStatus | "all">(
    initialParams?.status || "all"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    initialParams?.paymentMethod || "all"
  );
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  >(initialParams?.datePreset || "all");
  const [amountRange, setAmountRange] = useState<
    "all" | "under_500" | "500_999" | "1000_4999" | "5000_plus"
  >(initialParams?.amountRange || "all");
  const [sort, setSort] = useState<
    "createdAt" | "amount" | "booking" | "type" | "status"
  >(initialParams?.sort || "createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialParams?.sortDirection || "desc"
  );
  const [page, setPage] = useState(initialParams?.page || 1);
  const [pageSize, setPageSize] = useState(initialParams?.pageSize || 10);

  const fetchPaymentsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, listRes, refundsRes] = await Promise.all([
        adminPaymentService.getFinancialSummary(organizationId),
        adminPaymentService.listTransactions({
          organizationId,
          search,
          type,
          status,
          paymentMethod,
          datePreset,
          amountRange,
          sort,
          sortDirection,
          page,
          pageSize,
        }),
        adminPaymentService.listRefunds(organizationId),
      ]);

      setSummary(summaryRes);
      setResult(listRes);
      setRefunds(refundsRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payments data");
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    search,
    type,
    status,
    paymentMethod,
    datePreset,
    amountRange,
    sort,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  const handleCreateRefund = async (payload: CreateRefundFormValues) => {
    try {
      const res = await adminPaymentService.createRefund(organizationId, payload);
      await fetchPaymentsData();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const handleMarkRefundComplete = async (refundId: string) => {
    try {
      const res = await adminPaymentService.markRefundCompleted(organizationId, refundId);
      await fetchPaymentsData();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setStatus("all");
    setPaymentMethod("all");
    setDatePreset("all");
    setAmountRange("all");
    setSort("createdAt");
    setSortDirection("desc");
    setPage(1);
  };

  return {
    loading,
    error,
    summary,
    result,
    refunds,
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    datePreset,
    setDatePreset,
    amountRange,
    setAmountRange,
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch: fetchPaymentsData,
    createRefund: handleCreateRefund,
    markRefundComplete: handleMarkRefundComplete,
    resetFilters: handleResetFilters,
  };
}

export function useAdminTransactionDetails(transactionId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    transaction: Transaction;
    booking?: {
      id: string;
      bookingNumber: string;
      serviceName: string;
      scheduledAt: string;
      customerName: string;
      customerId: string;
    };
    payment?: any;
    financialBreakdown: {
      bookingTotal: number;
      serviceFee: number;
      providerGross: number;
      providerNet: number;
      deliveryPartnerGross: number;
      deliveryPartnerNet: number;
      platformFeeTotal: number;
      refundedAmount: number;
      netRevenue: number;
    };
  } | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!transactionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminPaymentService.getTransactionById(organizationId, transactionId);
      if (!res) {
        setError(`Transaction #${transactionId} not found in this organization.`);
      } else {
        setData(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  }, [organizationId, transactionId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { loading, error, data, refetch: fetchDetails };
}

export function useAdminBookingFinancialDetails(bookingId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BookingFinancialDetailResult | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminPaymentService.getBookingFinancialDetails(organizationId, bookingId);
      if (!res) {
        setError(`Booking #${bookingId} financial record not found.`);
      } else {
        setData(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load booking financial details");
    } finally {
      setLoading(false);
    }
  }, [organizationId, bookingId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { loading, error, data, refetch: fetchDetails };
}

export function useAdminProviderEarnings(providerId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProviderEarningsSummary | null>(null);

  const fetchEarnings = useCallback(async () => {
    if (!providerId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminPaymentService.getProviderEarnings(organizationId, providerId);
      if (!res) {
        setError(`Provider #${providerId} not found in this organization.`);
      } else {
        setData(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load provider earnings");
    } finally {
      setLoading(false);
    }
  }, [organizationId, providerId]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleUpdateStatus = async (earningsId: string, newStatus: EarningsStatus) => {
    const updated = await adminPaymentService.updateEarningsStatus(
      organizationId,
      earningsId,
      newStatus
    );
    await fetchEarnings();
    return updated;
  };

  return { loading, error, data, refetch: fetchEarnings, updateStatus: handleUpdateStatus };
}

export function useAdminDeliveryPartnerEarnings(partnerId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DeliveryPartnerEarningsSummary | null>(null);

  const fetchEarnings = useCallback(async () => {
    if (!partnerId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminPaymentService.getDeliveryPartnerEarnings(organizationId, partnerId);
      if (!res) {
        setError(`Delivery Partner #${partnerId} not found in this organization.`);
      } else {
        setData(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load partner earnings");
    } finally {
      setLoading(false);
    }
  }, [organizationId, partnerId]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleUpdateStatus = async (earningsId: string, newStatus: EarningsStatus) => {
    const updated = await adminPaymentService.updateEarningsStatus(
      organizationId,
      earningsId,
      newStatus
    );
    await fetchEarnings();
    return updated;
  };

  return { loading, error, data, refetch: fetchEarnings, updateStatus: handleUpdateStatus };
}
