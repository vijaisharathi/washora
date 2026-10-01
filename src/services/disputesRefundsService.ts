import {
  DisputeReasonOption,
  DisputeClaimPayload,
  DisputeClaimData,
  OrderReceiptData,
} from "@/types/customer/disputesRefunds";
import { orderLifecycleService } from "@/services/orderLifecycleService";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const STORAGE_DISPUTES_KEY = "washora_customer_disputes";
const inMemoryDisputes: Record<string, DisputeClaimData> = {};

export const DISPUTE_REASONS: DisputeReasonOption[] = [
  {
    id: "damaged_garment",
    label: "Damaged Fabric or Tear",
    description: "Garment returned with structural damage, torn seam, or missing buttons.",
  },
  {
    id: "service_mismatch",
    label: "Inadequate Cleaning Quality",
    description: "Stains remained untreated or wrong treatment process applied.",
  },
  {
    id: "billing_discrepancy",
    label: "Incorrect Billing / Overcharge",
    description: "Paid add-ons or promotional discounts were incorrectly calculated.",
  },
  {
    id: "sla_delay",
    label: "Critical Turnaround SLA Delay",
    description: "Delivery exceeded estimated SLA window by more than 48 hours.",
  },
  {
    id: "other",
    label: "Other Special Dispute",
    description: "Any other issue requiring marketplace team mediation.",
  },
];

function mapDispute(d: Record<string, unknown>): DisputeClaimData {
  const idStr = String(d.id || "");
  return {
    id: idStr,
    disputeNumber: String(d.disputeNumber || `DSP-${idStr.slice(0, 8).toUpperCase()}`),
    orderId: String(d.bookingId || d.orderId || ""),
    reasonLabel: String(d.reason || "Service Dispute"),
    desiredResolution: (String(d.requestedResolution || d.desiredResolution || "FULL_REFUND")) as DisputeClaimData["desiredResolution"],
    refundAmount: Number(d.refundAmountRequested || d.refundAmount) || 502,
    description: String(d.description || ""),
    status: (String(d.status || "UNDER_REVIEW")) as DisputeClaimData["status"],
    createdAt: String(d.createdAt || new Date().toISOString()),
    estimatedResolutionDate: "Within 24 business hours",
  };
}

export interface IDisputesRefundsService {
  getOrderReceipt(orderId: string): Promise<OrderReceiptData>;
  getDisputeReasons(): Promise<DisputeReasonOption[]>;
  createDisputeClaim(payload: DisputeClaimPayload): Promise<DisputeClaimData>;
  getDisputeStatus(orderId: string): Promise<DisputeClaimData | null>;
}

class DisputesRefundsService implements IDisputesRefundsService {
  async getOrderReceipt(orderId: string): Promise<OrderReceiptData> {
    await new Promise((res) => setTimeout(res, 50));
    const order = await orderLifecycleService.getOrderTracking(orderId);

    return {
      orderNumber: order.orderNumber,
      transactionId: "TXN-20260901-1024",
      paymentMethod: order.paymentMethodLabel || "UPI",
      paymentDate: "Sep 1, 2026",
      status: "PAID",
      serviceAmount: 449,
      addOnsAmount: 178,
      discountAmount: 125,
      totalAmount: order.totalAmount || 502,
      serviceName: order.serviceName,
      providerName: order.providerName,
    };
  }

  async getDisputeReasons(): Promise<DisputeReasonOption[]> {
    await new Promise((res) => setTimeout(res, 50));
    return DISPUTE_REASONS;
  }

  async createDisputeClaim(payload: DisputeClaimPayload): Promise<DisputeClaimData> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.disputes.create({
          bookingId: payload.orderId,
          reason: payload.reason,
          description: payload.description,
          requestedResolution: payload.desiredResolution,
          refundAmountRequested: payload.refundAmount,
        });

        const created = mapDispute(res.data as Record<string, unknown>);
        inMemoryDisputes[payload.orderId] = created;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`${STORAGE_DISPUTES_KEY}_${payload.orderId}`, JSON.stringify(created));
          } catch {
            // ignore
          }
        }
        return created;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.createDisputeClaimMock(payload);
  }

  private async createDisputeClaimMock(payload: DisputeClaimPayload): Promise<DisputeClaimData> {
    await new Promise((res) => setTimeout(res, 500));

    const reasonObj = DISPUTE_REASONS.find((r) => r.id === payload.reason);

    const dispute: DisputeClaimData = {
      id: `dsp-${Date.now()}`,
      disputeNumber: `DSP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: payload.orderId,
      reasonLabel: reasonObj?.label || "Service Dispute",
      desiredResolution: payload.desiredResolution,
      refundAmount: payload.refundAmount || 502,
      description: payload.description,
      status: "UNDER_REVIEW",
      createdAt: new Date().toISOString(),
      estimatedResolutionDate: "Within 24 business hours",
    };

    inMemoryDisputes[payload.orderId] = dispute;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${STORAGE_DISPUTES_KEY}_${payload.orderId}`, JSON.stringify(dispute));
      } catch {
        // ignore
      }
    }

    return dispute;
  }

  async getDisputeStatus(orderId: string): Promise<DisputeClaimData | null> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.disputes.list();
        if (Array.isArray(res.data)) {
          const match = (res.data as Record<string, unknown>[]).find(
            (d) => d.bookingId === orderId || d.orderId === orderId
          );
          if (match) {
            return mapDispute(match);
          }
        }
        return null;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.getDisputeStatusMock(orderId);
  }

  private async getDisputeStatusMock(orderId: string): Promise<DisputeClaimData | null> {
    await new Promise((res) => setTimeout(res, 50));

    if (inMemoryDisputes[orderId]) {
      return inMemoryDisputes[orderId];
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_DISPUTES_KEY}_${orderId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          inMemoryDisputes[orderId] = parsed;
          return parsed;
        }
      } catch {
        // ignore
      }
    }

    return {
      id: "dsp-default-1",
      disputeNumber: "DSP-20260901-502",
      orderId,
      reasonLabel: "Damaged Fabric or Tear",
      desiredResolution: "FULL_REFUND",
      refundAmount: 502,
      description: "Minor stitching fray observed upon delivery unboxing.",
      status: "UNDER_REVIEW",
      createdAt: "2026-09-01T14:30:00Z",
      estimatedResolutionDate: "Within 24 business hours",
    };
  }
}

export const disputesRefundsService = new DisputesRefundsService();
