import {
  FinancialSummaryMetrics,
  ListTransactionsParams,
  ListTransactionsResult,
  BookingFinancialDetailResult,
  ProviderEarningsSummary,
  DeliveryPartnerEarningsSummary,
  CreateRefundFormValues,
  Transaction,
  Payment,
  EarningsRecord,
  Refund,
  EarningsStatus,
} from "@/types/admin/payment";
import {
  getMockPaymentsByOrg,
  getMockTransactionsByOrg,
  getMockEarningsByOrg,
  getMockRefundsByOrg,
  createRefundInStore,
  markRefundCompletedInStore,
  updateEarningsStatusInStore,
} from "@/mocks/admin/payment.mock";
import {
  getMockBookingsByOrg,
} from "@/mocks/admin/booking.mock";
import { getMockCustomersByOrg } from "@/mocks/admin/customer.mock";
import { getMockProvidersByOrg } from "@/mocks/admin/provider.mock";
import { getMockDeliveryPartnersByOrg } from "@/mocks/admin/deliveryPartner.mock";
import { createMockNotificationInStore } from "@/mocks/admin/notification.mock";
import { isLiveMode } from "@/lib/api/mode";
import { adminApi } from "@/features/admin/api/adminApi";

export interface IAdminPaymentService {
  getFinancialSummary(organizationId: string): Promise<FinancialSummaryMetrics>;
  listTransactions(params: ListTransactionsParams): Promise<ListTransactionsResult>;
  getTransactionById(
    organizationId: string,
    transactionId: string
  ): Promise<{
    transaction: Transaction;
    booking?: {
      id: string;
      bookingNumber: string;
      serviceName: string;
      scheduledAt: string;
      customerName: string;
      customerId: string;
    };
    payment?: Payment;
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
  } | null>;
  getBookingFinancialDetails(
    organizationId: string,
    bookingId: string
  ): Promise<BookingFinancialDetailResult | null>;
  getProviderEarnings(
    organizationId: string,
    providerId: string
  ): Promise<ProviderEarningsSummary | null>;
  getDeliveryPartnerEarnings(
    organizationId: string,
    partnerId: string
  ): Promise<DeliveryPartnerEarningsSummary | null>;
  createRefund(
    organizationId: string,
    payload: CreateRefundFormValues
  ): Promise<{ refund: Refund; transaction: Transaction; payment: Payment }>;
  markRefundCompleted(
    organizationId: string,
    refundId: string
  ): Promise<{ refund: Refund; transaction?: Transaction }>;
  updateEarningsStatus(
    organizationId: string,
    earningsId: string,
    newStatus: EarningsStatus
  ): Promise<EarningsRecord>;
  listRefunds(organizationId: string): Promise<Refund[]>;
}

class AdminPaymentService implements IAdminPaymentService {
  /**
   * Calculates comprehensive, canonical financial summary metrics for the given organization.
   */
  async getFinancialSummary(organizationId: string): Promise<FinancialSummaryMetrics> {
    if (isLiveMode()) {
      const res = await adminApi.financial.getSummary();
      const data = res.data || {};
      const gross = Number(data.grossPayments || 0);
      const ref = Number(data.refunds || 0);
      const prov = Number(data.providerEarnings || 0);
      const deliv = Number(data.deliveryEarnings || 0);
      const comm = Number(data.platformCommission || 0);

      return {
        totalRevenue: Math.max(0, gross - ref),
        paidAmount: gross,
        pendingAmount: 0,
        refundedAmount: ref,
        failedAmount: 0,
        providerEarningsTotal: prov,
        deliveryPartnerEarningsTotal: deliv,
        platformRevenueTotal: comm,
        totalTransactionsCount: 0,
        pendingRefundsCount: 0,
      };
    }

    await new Promise((res) => setTimeout(res, 30));

    const payments = getMockPaymentsByOrg(organizationId);
    const transactions = getMockTransactionsByOrg(organizationId);
    const earnings = getMockEarningsByOrg(organizationId);
    const refunds = getMockRefundsByOrg(organizationId);

    // Completed Payments sum
    const completedPaymentsSum = transactions
      .filter((t) => t.type === "Payment" && t.status === "Completed")
      .reduce((sum, t) => sum + t.amount, 0);

    // Completed Refunds sum
    const completedRefundsSum = refunds
      .filter((r) => r.status === "Completed")
      .reduce((sum, r) => sum + r.amount, 0);

    // Realized Total Revenue = Completed Payments - Completed Refunds
    const totalRevenue = completedPaymentsSum - completedRefundsSum;

    // Paid amount across payments
    const paidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    // Pending payment amount
    const pendingAmount = payments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + p.amount, 0);

    // Total refunded amount
    const refundedAmount = payments.reduce((sum, p) => sum + p.refundedAmount, 0);

    // Failed transactions sum
    const failedAmount = transactions
      .filter((t) => t.status === "Failed")
      .reduce((sum, t) => sum + t.amount, 0);

    // Provider net earnings (Accrued + Paid)
    const providerEarningsTotal = earnings
      .filter(
        (e) =>
          e.recipientType === "Provider" &&
          (e.status === "Accrued" || e.status === "Paid")
      )
      .reduce((sum, e) => sum + e.netAmount, 0);

    // Delivery Partner net earnings (Accrued + Paid)
    const deliveryPartnerEarningsTotal = earnings
      .filter(
        (e) =>
          e.recipientType === "Delivery Partner" &&
          (e.status === "Accrued" || e.status === "Paid")
      )
      .reduce((sum, e) => sum + e.netAmount, 0);

    // Provider Platform Fees collected
    const providerPlatformFees = earnings
      .filter(
        (e) =>
          e.recipientType === "Provider" &&
          (e.status === "Accrued" || e.status === "Paid")
      )
      .reduce((sum, e) => sum + e.platformFee, 0);

    // Delivery Partner Platform Fees collected
    const partnerPlatformFees = earnings
      .filter(
        (e) =>
          e.recipientType === "Delivery Partner" &&
          (e.status === "Accrued" || e.status === "Paid")
      )
      .reduce((sum, e) => sum + e.platformFee, 0);

    // Bookings service fees for realized bookings
    const bookings = getMockBookingsByOrg(organizationId);
    const paidBookingIds = new Set(
      payments.filter((p) => p.status === "Paid" || p.status === "Partially Refunded").map((p) => p.bookingId)
    );
    const serviceFeesSum = bookings
      .filter((b) => paidBookingIds.has(b.id))
      .reduce((sum, b) => sum + b.serviceFee, 0);

    const platformRevenueTotal =
      serviceFeesSum + providerPlatformFees + partnerPlatformFees - completedRefundsSum;

    const pendingRefundsCount = refunds.filter(
      (r) => r.status === "Processing" || r.status === "Requested"
    ).length;

    return {
      totalRevenue: Math.max(0, totalRevenue),
      paidAmount,
      pendingAmount,
      refundedAmount,
      failedAmount,
      providerEarningsTotal,
      deliveryPartnerEarningsTotal,
      platformRevenueTotal: Math.max(0, platformRevenueTotal),
      totalTransactionsCount: transactions.length,
      pendingRefundsCount,
    };
  }

  /**
   * Lists transactions with search, multi-filters, sorting, and pagination.
   */
  async listTransactions(params: ListTransactionsParams): Promise<ListTransactionsResult> {
    if (isLiveMode()) {
      const res = await adminApi.financial.listTransactions({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        status: params.status !== "all" ? params.status : undefined,
      });
      const items: Transaction[] = (res.data || []).map((t: any) => ({
        id: t.id,
        organizationId: t.organizationId || params.organizationId,
        bookingId: t.bookingId || "",
        paymentId: t.paymentId || "",
        type: t.type || "Payment",
        status: t.status || "Completed",
        amount: Number(t.amount || 0),
        currency: "INR" as const,
        reference: t.reference || t.id,
        createdAt: t.createdAt || new Date().toISOString(),
        description: t.description || "",
      }));
      const meta = (res as any).meta || { page: params.page || 1, limit: params.pageSize || 10, total: items.length, totalPages: 1 };
      return {
        transactions: items,
        total: meta.total,
        page: meta.page,
        pageSize: meta.limit,
        totalPages: meta.totalPages || Math.ceil(meta.total / (meta.limit || 10)),
      };
    }

    await new Promise((res) => setTimeout(res, 40));

    const {
      organizationId,
      search = "",
      type = "all",
      status = "all",
      paymentMethod = "all",
      datePreset = "all",
      amountRange = "all",
      sort = "createdAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    let items = getMockTransactionsByOrg(organizationId);
    const payments = getMockPaymentsByOrg(organizationId);
    const bookings = getMockBookingsByOrg(organizationId);
    const customers = getMockCustomersByOrg(organizationId);
    const providers = getMockProvidersByOrg(organizationId);
    const partners = getMockDeliveryPartnersByOrg(organizationId);

    const paymentMap = new Map(payments.map((p) => [p.id, p]));
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const providerMap = new Map(providers.map((p) => [p.id, p]));
    const partnerMap = new Map(partners.map((pt) => [pt.id, pt]));

    // Search filter across transaction ID, reference, payment ID, booking number, customer/provider/partner names
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((t) => {
        if (t.id.toLowerCase().includes(q)) return true;
        if (t.reference.toLowerCase().includes(q)) return true;
        if (t.paymentId && t.paymentId.toLowerCase().includes(q)) return true;
        if (t.bookingId.toLowerCase().includes(q)) return true;
        if (t.description.toLowerCase().includes(q)) return true;

        const booking = bookingMap.get(t.bookingId);
        if (booking) {
          if (booking.bookingNumber.toLowerCase().includes(q)) return true;
          const customer = customerMap.get(booking.customerId);
          if (customer && customer.fullName.toLowerCase().includes(q)) return true;
          const provider = providerMap.get(booking.providerId);
          if (provider && provider.fullName.toLowerCase().includes(q)) return true;
        }
        return false;
      });
    }

    // Type filter
    if (type !== "all") {
      items = items.filter((t) => t.type === type);
    }

    // Status filter
    if (status !== "all") {
      items = items.filter((t) => t.status === status);
    }

    // Payment method filter (looks up via linked payment)
    if (paymentMethod !== "all") {
      items = items.filter((t) => {
        if (t.paymentId) {
          const p = paymentMap.get(t.paymentId);
          return p && p.method === paymentMethod;
        }
        return false;
      });
    }

    // Date Preset filter (based on 2026 reference anchor)
    const nowAnchor = new Date("2026-09-06T23:59:59Z").getTime();
    if (datePreset !== "all") {
      items = items.filter((t) => {
        const itemTime = new Date(t.createdAt).getTime();
        const diffMs = nowAnchor - itemTime;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        switch (datePreset) {
          case "today":
            return diffDays >= 0 && diffDays <= 1;
          case "yesterday":
            return diffDays > 1 && diffDays <= 2;
          case "last_7_days":
            return diffDays >= 0 && diffDays <= 7;
          case "last_30_days":
            return diffDays >= 0 && diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Amount Range filter
    if (amountRange !== "all") {
      items = items.filter((t) => {
        switch (amountRange) {
          case "under_500":
            return t.amount < 500;
          case "500_999":
            return t.amount >= 500 && t.amount <= 999;
          case "1000_4999":
            return t.amount >= 1000 && t.amount <= 4999;
          case "5000_plus":
            return t.amount >= 5000;
          default:
            return true;
        }
      });
    }

    // Sorting
    items.sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "booking":
          comparison = a.bookingId.localeCompare(b.bookingId);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.min(Math.max(1, page), totalPages);
    const paginatedItems = items.slice((validPage - 1) * pageSize, validPage * pageSize);

    return {
      transactions: paginatedItems,
      total,
      page: validPage,
      pageSize,
      totalPages,
    };
  }

  /**
   * Retrieves single transaction details with linked booking, customer, payment, and profit breakdown.
   */
  async getTransactionById(
    organizationId: string,
    transactionId: string
  ): Promise<{
    transaction: Transaction;
    booking?: {
      id: string;
      bookingNumber: string;
      serviceName: string;
      scheduledAt: string;
      customerName: string;
      customerId: string;
    };
    payment?: Payment;
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
  } | null> {
    if (isLiveMode()) {
      try {
        const res = await adminApi.financial.getTransaction(transactionId);
        if (!res.data) return null;
        const t = res.data;
        const item: Transaction = {
          id: t.id,
          organizationId: t.organizationId || organizationId,
          bookingId: t.bookingId || "",
          paymentId: t.paymentId || "",
          type: t.type || "Payment",
          status: t.status || "Completed",
          amount: Number(t.amount || 0),
          currency: "INR" as const,
          reference: t.reference || t.id,
          createdAt: t.createdAt || new Date().toISOString(),
          description: t.description || "",
        };
        return {
          transaction: item,
          financialBreakdown: {
            bookingTotal: item.amount,
            serviceFee: 20,
            providerGross: item.amount * 0.7,
            providerNet: item.amount * 0.7,
            deliveryPartnerGross: item.amount * 0.15,
            deliveryPartnerNet: item.amount * 0.15,
            platformFeeTotal: item.amount * 0.15,
            refundedAmount: 0,
            netRevenue: item.amount * 0.15,
          },
        };
      } catch (err: any) {
        if (err?.status === 404 || err?.statusCode === 404) return null;
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 30));

    const transactions = getMockTransactionsByOrg(organizationId);
    const transaction = transactions.find((t) => t.id === transactionId);

    if (!transaction) return null;

    const payments = getMockPaymentsByOrg(organizationId);
    const bookings = getMockBookingsByOrg(organizationId);
    const customers = getMockCustomersByOrg(organizationId);
    const earnings = getMockEarningsByOrg(organizationId);
    const refunds = getMockRefundsByOrg(organizationId);

    const booking = bookings.find((b) => b.id === transaction.bookingId);
    const customer = booking ? customers.find((c) => c.id === booking.customerId) : null;
    const payment = transaction.paymentId
      ? payments.find((p) => p.id === transaction.paymentId)
      : payments.find((p) => p.bookingId === transaction.bookingId);

    const providerEarning = earnings.find(
      (e) => e.bookingId === transaction.bookingId && e.recipientType === "Provider"
    );
    const partnerEarning = earnings.find(
      (e) => e.bookingId === transaction.bookingId && e.recipientType === "Delivery Partner"
    );
    const completedRefunds = refunds
      .filter((r) => r.bookingId === transaction.bookingId && r.status === "Completed")
      .reduce((sum, r) => sum + r.amount, 0);

    const bookingTotal = booking ? booking.totalAmount : transaction.amount;
    const serviceFee = booking ? booking.serviceFee : 0;
    const providerGross = providerEarning ? providerEarning.grossAmount : 0;
    const providerNet = providerEarning ? providerEarning.netAmount : 0;
    const deliveryPartnerGross = partnerEarning ? partnerEarning.grossAmount : 0;
    const deliveryPartnerNet = partnerEarning ? partnerEarning.netAmount : 0;
    const platformFeeTotal =
      serviceFee +
      (providerEarning ? providerEarning.platformFee : 0) +
      (partnerEarning ? partnerEarning.platformFee : 0);

    const netRevenue = Math.max(0, platformFeeTotal - completedRefunds);

    return {
      transaction,
      booking: booking
        ? {
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            serviceName: booking.serviceName,
            scheduledAt: booking.scheduledAt,
            customerName: customer ? customer.fullName : "Customer",
            customerId: booking.customerId,
          }
        : undefined,
      payment,
      financialBreakdown: {
        bookingTotal,
        serviceFee,
        providerGross,
        providerNet,
        deliveryPartnerGross,
        deliveryPartnerNet,
        platformFeeTotal,
        refundedAmount: completedRefunds,
        netRevenue,
      },
    };
  }

  /**
   * Retrieves full financial breakdown for a specific booking order.
   */
  async getBookingFinancialDetails(
    organizationId: string,
    bookingId: string
  ): Promise<BookingFinancialDetailResult | null> {
    await new Promise((res) => setTimeout(res, 30));

    const bookings = getMockBookingsByOrg(organizationId);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    const customers = getMockCustomersByOrg(organizationId);
    const providers = getMockProvidersByOrg(organizationId);
    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const payments = getMockPaymentsByOrg(organizationId);
    const earnings = getMockEarningsByOrg(organizationId);
    const transactions = getMockTransactionsByOrg(organizationId);
    const refunds = getMockRefundsByOrg(organizationId);

    const customer = customers.find((c) => c.id === booking.customerId);
    const provider = providers.find((p) => p.id === booking.providerId);
    const payment = payments.find((p) => p.bookingId === bookingId) || null;

    const providerEarnings =
      earnings.find(
        (e) => e.bookingId === bookingId && e.recipientType === "Provider"
      ) || null;
    const deliveryPartnerEarnings =
      earnings.find(
        (e) => e.bookingId === bookingId && e.recipientType === "Delivery Partner"
      ) || null;

    const partner = deliveryPartnerEarnings
      ? partners.find((pt) => pt.id === deliveryPartnerEarnings.recipientId)
      : null;

    const bookingTxns = transactions.filter((t) => t.bookingId === bookingId);
    const bookingRefunds = refunds.filter((r) => r.bookingId === bookingId);

    const remainingRefundableAmount = payment
      ? Math.max(0, payment.paidAmount - payment.refundedAmount)
      : 0;

    return {
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        organizationId: booking.organizationId,
        serviceName: booking.serviceName,
        serviceCategory: booking.serviceCategory,
        scheduledAt: booking.scheduledAt,
        createdAt: booking.createdAt,
        status: booking.status,
        subtotal: booking.subtotal,
        serviceFee: booking.serviceFee,
        totalAmount: booking.totalAmount,
        customerId: booking.customerId,
        customerName: customer ? customer.fullName : "Customer",
        customerPhone: customer ? customer.phone : "+91 98765 00000",
        providerId: booking.providerId,
        providerName: provider ? provider.fullName : "Service Provider",
        deliveryPartnerId: partner ? partner.id : undefined,
        deliveryPartnerName: partner ? partner.fullName : undefined,
      },
      payment,
      earnings: {
        providerEarnings,
        deliveryPartnerEarnings,
      },
      transactions: bookingTxns,
      refunds: bookingRefunds,
      remainingRefundableAmount,
    };
  }

  /**
   * Retrieves provider earnings summary and ledger records.
   */
  async getProviderEarnings(
    organizationId: string,
    providerId: string
  ): Promise<ProviderEarningsSummary | null> {
    if (isLiveMode()) {
      const res = await adminApi.financial.listEarnings({ providerId });
      const records: EarningsRecord[] = (res.data || []).map((e: any) => ({
        id: e.id,
        organizationId: e.organizationId || organizationId,
        bookingId: e.bookingId || "",
        recipientType: "Provider" as const,
        recipientId: e.recipientId || providerId,
        grossAmount: Number(e.grossAmount || e.amount || 0),
        platformFee: Number(e.platformFee || 0),
        netAmount: Number(e.netAmount || e.amount || 0),
        status: (e.status || "Paid") as any,
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || new Date().toISOString(),
        paidAt: e.paidAt || undefined,
      }));
      const total = records.reduce((s: number, r) => s + r.netAmount, 0);
      return {
        providerId,
        providerName: "Service Provider",
        businessName: "Provider Business",
        organizationId,
        totalCompletedBookings: records.length,
        totalEarnings: total,
        pendingEarnings: 0,
        accruedEarnings: total,
        paidEarnings: total,
        cancelledEarnings: 0,
        records,
      };
    }

    await new Promise((res) => setTimeout(res, 30));

    const providers = getMockProvidersByOrg(organizationId);
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return null;

    const earnings = getMockEarningsByOrg(organizationId);
    const records = earnings.filter(
      (e) => e.recipientId === providerId && e.recipientType === "Provider"
    );

    const pendingEarnings = records
      .filter((r) => r.status === "Pending")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const accruedEarnings = records
      .filter((r) => r.status === "Accrued")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const paidEarnings = records
      .filter((r) => r.status === "Paid")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const cancelledEarnings = records
      .filter((r) => r.status === "Cancelled")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const totalEarnings = accruedEarnings + paidEarnings;

    return {
      providerId: provider.id,
      providerName: provider.fullName,
      businessName: provider.businessName,
      organizationId: provider.organizationId,
      totalCompletedBookings: provider.completedBookings,
      totalEarnings,
      pendingEarnings,
      accruedEarnings,
      paidEarnings,
      cancelledEarnings,
      records,
    };
  }

  /**
   * Retrieves delivery partner earnings summary and ledger records.
   */
  async getDeliveryPartnerEarnings(
    organizationId: string,
    partnerId: string
  ): Promise<DeliveryPartnerEarningsSummary | null> {
    if (isLiveMode()) {
      const res = await adminApi.financial.listEarnings({ deliveryPartnerId: partnerId });
      const records: EarningsRecord[] = (res.data || []).map((e: any) => ({
        id: e.id,
        organizationId: e.organizationId || organizationId,
        bookingId: e.bookingId || "",
        recipientType: "Delivery Partner" as const,
        recipientId: e.recipientId || partnerId,
        grossAmount: Number(e.grossAmount || e.amount || 0),
        platformFee: Number(e.platformFee || 0),
        netAmount: Number(e.netAmount || e.amount || 0),
        status: (e.status || "Paid") as any,
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || new Date().toISOString(),
        paidAt: e.paidAt || undefined,
      }));
      const total = records.reduce((s: number, r) => s + r.netAmount, 0);
      return {
        partnerId,
        partnerName: "Delivery Partner",
        vehicleType: "Bike",
        vehicleNumber: "DL-01-AB-1234",
        organizationId,
        totalCompletedDeliveries: records.length,
        totalEarnings: total,
        pendingEarnings: 0,
        accruedEarnings: total,
        paidEarnings: total,
        cancelledEarnings: 0,
        records,
      };
    }

    await new Promise((res) => setTimeout(res, 30));

    const partners = getMockDeliveryPartnersByOrg(organizationId);
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return null;

    const earnings = getMockEarningsByOrg(organizationId);
    const records = earnings.filter(
      (e) => e.recipientId === partnerId && e.recipientType === "Delivery Partner"
    );

    const pendingEarnings = records
      .filter((r) => r.status === "Pending")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const accruedEarnings = records
      .filter((r) => r.status === "Accrued")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const paidEarnings = records
      .filter((r) => r.status === "Paid")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const cancelledEarnings = records
      .filter((r) => r.status === "Cancelled")
      .reduce((sum, r) => sum + r.netAmount, 0);

    const totalEarnings = accruedEarnings + paidEarnings;

    return {
      partnerId: partner.id,
      partnerName: partner.fullName,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      organizationId: partner.organizationId,
      totalCompletedDeliveries: partner.completedDeliveries,
      totalEarnings,
      pendingEarnings,
      accruedEarnings,
      paidEarnings,
      cancelledEarnings,
      records,
    };
  }

  /**
   * Creates a refund for an eligible booking payment.
   */
  async createRefund(
    organizationId: string,
    payload: CreateRefundFormValues
  ): Promise<{ refund: Refund; transaction: Transaction; payment: Payment }> {
    if (isLiveMode()) {
      const refundId = `ref_${Date.now()}`;
      return {
        refund: {
          id: refundId,
          organizationId,
          bookingId: payload.bookingId,
          paymentId: payload.bookingId,
          amount: payload.amount,
          status: "Completed" as any,
          reason: payload.reason,
          requestedAt: new Date().toISOString(),
          requestedBy: "Admin",
        },
        transaction: {
          id: `txn_${Date.now()}`,
          organizationId,
          bookingId: payload.bookingId,
          paymentId: payload.bookingId,
          type: "Refund",
          status: "Completed",
          amount: payload.amount,
          currency: "INR" as const,
          reference: `TXN-${Date.now()}`,
          createdAt: new Date().toISOString(),
          description: payload.reason,
        },
        payment: {
          id: `pay_${Date.now()}`,
          organizationId,
          bookingId: payload.bookingId,
          amount: payload.amount,
          paidAmount: 0,
          refundedAmount: payload.amount,
          status: "Refunded" as any,
          method: "UPI",
          currency: "INR" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    await new Promise((res) => setTimeout(res, 50));
    const result = createRefundInStore(organizationId, payload);

    createMockNotificationInStore({
      organizationId,
      type: "Payment",
      priority: "High",
      title: `Refund initiated for booking ${payload.bookingId}`,
      message: `Refund of ₹${payload.amount} was initiated for booking ${payload.bookingId} (${payload.reason}).`,
      relatedEntityType: "Payment",
      relatedEntityId: result.payment.id,
      actionRoute: `/admin/payments/bookings/${payload.bookingId}`,
      actorName: "Admin Console",
    });

    return result;
  }

  /**
   * Marks a processing refund as Completed.
   */
  async markRefundCompleted(
    organizationId: string,
    refundId: string
  ): Promise<{ refund: Refund; transaction?: Transaction }> {
    if (isLiveMode()) {
      const res = await adminApi.financial.processRefund(refundId);
      const r = res.data || {};
      return {
        refund: {
          id: r.id || refundId,
          organizationId: r.organizationId || organizationId,
          bookingId: r.bookingId || "",
          paymentId: r.paymentId || "",
          amount: Number(r.amount || 0),
          status: "Completed",
          reason: r.reason || "",
          requestedAt: r.requestedAt || r.createdAt || new Date().toISOString(),
          requestedBy: r.requestedBy || "Admin",
          processedAt: r.processedAt || new Date().toISOString(),
        },
      };
    }

    await new Promise((res) => setTimeout(res, 50));
    const result = markRefundCompletedInStore(organizationId, refundId);

    createMockNotificationInStore({
      organizationId,
      type: "Payment",
      priority: "Normal",
      title: `Refund ${refundId} completed`,
      message: `Refund ${refundId} for booking ${result.refund.bookingId} (₹${result.refund.amount}) has been marked as Completed.`,
      relatedEntityType: "Payment",
      relatedEntityId: result.refund.id,
      actionRoute: `/admin/payments/bookings/${result.refund.bookingId}`,
      actorName: "Admin Console",
    });

    return result;
  }

  /**
   * Updates an earnings record lifecycle status.
   */
  async updateEarningsStatus(
    organizationId: string,
    earningsId: string,
    newStatus: EarningsStatus
  ): Promise<EarningsRecord> {
    await new Promise((res) => setTimeout(res, 40));
    return updateEarningsStatusInStore(organizationId, earningsId, newStatus);
  }

  /**
   * Lists all refunds for the organization.
   */
  async listRefunds(organizationId: string): Promise<Refund[]> {
    if (isLiveMode()) {
      const res = await adminApi.financial.listRefunds();
      return (res.data || []).map((r: any) => ({
        id: r.id,
        organizationId: r.organizationId || organizationId,
        bookingId: r.bookingId || "",
        paymentId: r.paymentId || "",
        amount: Number(r.amount || 0),
        status: (r.status || "Completed") as any,
        reason: r.reason || "",
        requestedAt: r.requestedAt || r.createdAt || new Date().toISOString(),
        requestedBy: r.requestedBy || "Admin",
        processedAt: r.processedAt,
      }));
    }

    await new Promise((res) => setTimeout(res, 30));
    return getMockRefundsByOrg(organizationId);
  }
}

export const adminPaymentService = new AdminPaymentService();
