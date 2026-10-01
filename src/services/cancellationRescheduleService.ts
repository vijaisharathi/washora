import {
  CancellationReasonOption,
  RefundBreakdownData,
  RescheduleDateOption,
  RescheduleTimeSlot,
  CancelOrderPayload,
  RescheduleOrderPayload,
} from "@/types/customer/cancellationReschedule";
import { orderLifecycleService } from "@/services/orderLifecycleService";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const CANCELLATION_REASONS: CancellationReasonOption[] = [
  { id: "plans_changed", label: "Plans Changed" },
  { id: "wrong_service", label: "Wrong Service Selected" },
  { id: "too_expensive", label: "Found a Better Price" },
  { id: "other", label: "Other" },
];

const RESCHEDULE_SLOTS: RescheduleTimeSlot[] = [
  { id: "slot-1", timeRange: "10:00 AM – 12:00 PM", status: "AVAILABLE" },
  { id: "slot-2", timeRange: "12:00 PM – 2:00 PM", status: "SELECTED" },
  { id: "slot-3", timeRange: "2:00 PM – 4:00 PM", status: "AVAILABLE" },
  { id: "slot-4", timeRange: "4:00 PM – 6:00 PM", status: "FULLY_BOOKED" },
];

export interface ICancellationRescheduleService {
  getCancellationReasons(): Promise<CancellationReasonOption[]>;
  getRefundBreakdown(orderId: string): Promise<RefundBreakdownData>;
  cancelOrder(payload: CancelOrderPayload): Promise<{ success: boolean; message: string }>;
  getRescheduleDates(): Promise<RescheduleDateOption[]>;
  getRescheduleSlots(dateId: string): Promise<RescheduleTimeSlot[]>;
  rescheduleOrder(payload: RescheduleOrderPayload): Promise<{ success: boolean; newSchedule: string }>;
}

class CancellationRescheduleService implements ICancellationRescheduleService {
  async getCancellationReasons(): Promise<CancellationReasonOption[]> {
    await new Promise((res) => setTimeout(res, 50));
    return CANCELLATION_REASONS;
  }

  async getRefundBreakdown(orderId: string): Promise<RefundBreakdownData> {
    await new Promise((res) => setTimeout(res, 100));
    const order = await orderLifecycleService.getOrderTracking(orderId);

    return {
      amountPaid: order.totalAmount || 502,
      estimatedRefund: order.totalAmount || 502,
      refundMethod: "Original Payment Method",
      timeline: "3–5 business days",
      isEligible: true,
      policyNotice:
        "Cancellation is available before pickup. Orders cancelled before pickup are eligible for a full refund.",
    };
  }

  async cancelOrder(payload: CancelOrderPayload): Promise<{ success: boolean; message: string }> {
    if (isLiveMode()) {
      try {
        await customerApi.bookings.cancel(payload.orderId, {
          reason: payload.reason || "Customer requested cancellation",
        });

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`washora_order_cancelled_${payload.orderId}`, "true");
          } catch {
            // ignore
          }
        }

        return {
          success: true,
          message: `Order ${payload.orderId} has been cancelled successfully. Full refund initiated.`,
        };
      } catch (err) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 800));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`washora_order_cancelled_${payload.orderId}`, "true");
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      message: `Order ${payload.orderId} has been cancelled successfully. Full refund initiated.`,
    };
  }

  async getRescheduleDates(): Promise<RescheduleDateOption[]> {
    await new Promise((res) => setTimeout(res, 50));
    return [
      { id: "d-1", dayLabel: "Tomorrow", dateNumber: "2", monthFormatted: "Sep", dateFormatted: "Sep 2", isAvailable: true },
      { id: "d-2", dayLabel: "Wed", dateNumber: "3", monthFormatted: "Sep", dateFormatted: "Sep 3", isAvailable: true },
      { id: "d-3", dayLabel: "Thu", dateNumber: "4", monthFormatted: "Sep", dateFormatted: "Sep 4", isAvailable: true },
      { id: "d-4", dayLabel: "Fri", dateNumber: "5", monthFormatted: "Sep", dateFormatted: "Sep 5", isAvailable: true },
      { id: "d-5", dayLabel: "Sat", dateNumber: "6", monthFormatted: "Sep", dateFormatted: "Sep 6", isAvailable: true },
    ];
  }

  async getRescheduleSlots(dateId: string): Promise<RescheduleTimeSlot[]> {
    await new Promise((res) => setTimeout(res, 50));
    return RESCHEDULE_SLOTS;
  }

  async rescheduleOrder(payload: RescheduleOrderPayload): Promise<{ success: boolean; newSchedule: string }> {
    const newSchedule = `${payload.newDateFormatted}, ${payload.newTimeSlot}`;

    if (isLiveMode()) {
      try {
        await customerApi.bookings.reschedule(payload.orderId, {
          scheduledPickupAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reason: "Rescheduled by customer",
        });

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`washora_order_rescheduled_${payload.orderId}`, newSchedule);
          } catch {
            // ignore
          }
        }

        return {
          success: true,
          newSchedule,
        };
      } catch (err) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 800));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`washora_order_rescheduled_${payload.orderId}`, newSchedule);
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      newSchedule,
    };
  }
}

export const cancellationRescheduleService = new CancellationRescheduleService();
