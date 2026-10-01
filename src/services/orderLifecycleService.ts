import {
  OrderTrackingDetails,
  OrderTimelineStep,
  OrderLifecycleStatus,
} from "@/types/customer/orderLifecycle";
import { orderConfirmationService } from "@/services/orderConfirmationService";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const MOCK_TIMELINE_STEPS: OrderTimelineStep[] = [
  {
    id: "step-1",
    title: "Order Confirmed",
    timestamp: "Aug 30, 2:15 PM",
    state: "COMPLETED",
    iconName: "check",
    description: "Care order details verified by system",
  },
  {
    id: "step-2",
    title: "Payment Confirmed",
    timestamp: "Aug 30, 2:16 PM",
    state: "COMPLETED",
    iconName: "check",
    description: "Encrypted transaction settled via UPI",
  },
  {
    id: "step-3",
    title: "Pickup Scheduled",
    timestamp: "Sep 1, 10:00 AM – 12:00 PM",
    state: "ACTIVE",
    iconName: "schedule",
    description: "Doorstep valet driver assigned for collection",
  },
  {
    id: "step-4",
    title: "Pickup in Progress",
    state: "UPCOMING",
    iconName: "directions_car",
    description: "Valet driver en route to your address",
  },
  {
    id: "step-5",
    title: "Provider Received",
    state: "UPCOMING",
    iconName: "storefront",
    description: "Items received and tagged at partner care studio",
  },
  {
    id: "step-6",
    title: "Cleaning in Progress",
    state: "UPCOMING",
    iconName: "laundry",
    description: "Specialty fabric treatment & quality washing underway",
  },
  {
    id: "step-7",
    title: "Ready for Delivery",
    state: "UPCOMING",
    iconName: "inventory_2",
    description: "Quality inspection complete, packaged in luxury garment bag",
  },
  {
    id: "step-8",
    title: "Delivered",
    state: "UPCOMING",
    iconName: "done_all",
    description: "Returned safely to your doorstep",
  },
];

function mapStatusToLifecycle(s: string): OrderLifecycleStatus {
  switch (s) {
    case "CANCELLED": return "CANCELLED";
    case "DELIVERED":
    case "COMPLETED": return "DELIVERED";
    case "OUT_FOR_DELIVERY": return "OUT_FOR_DELIVERY";
    case "READY_FOR_DELIVERY": return "READY_FOR_DELIVERY";
    case "PROCESSING":
    case "CLEANING":
    case "QUALITY_CHECK": return "IN_PROGRESS";
    case "HUB_RECEIVED": return "PROVIDER_RECEIVED";
    case "PICKUP_IN_PROGRESS": return "PICKUP_IN_PROGRESS";
    case "SCHEDULED":
    case "PICKED_UP":
    case "IN_TRANSIT_TO_HUB": return "PICKUP_SCHEDULED";
    case "PAID": return "PAYMENT_CONFIRMED";
    default: return "CONFIRMED";
  }
}

function mapBookingToTracking(b: Record<string, unknown>): OrderTrackingDetails {
  const rawStatus = String(b.status || "CONFIRMED").toUpperCase();
  const isCancelled = rawStatus === "CANCELLED";
  const status = mapStatusToLifecycle(rawStatus);

  const timeline: OrderTimelineStep[] = isCancelled
    ? [
        {
          id: "step-1",
          title: "Order Confirmed",
          timestamp: b.createdAt ? new Date(String(b.createdAt)).toLocaleDateString() : "Confirmed",
          state: "COMPLETED",
          iconName: "check",
          description: "Care order details verified by system",
        },
        {
          id: "step-cancelled",
          title: "Order Cancelled",
          timestamp: b.updatedAt ? new Date(String(b.updatedAt)).toLocaleDateString() : "Just now",
          state: "COMPLETED",
          iconName: "close",
          description: String(b.cancellationReason || "Order cancelled by customer. 100% refund initiated."),
        },
      ]
    : [
        {
          id: "step-1",
          title: "Order Confirmed",
          timestamp: b.createdAt ? new Date(String(b.createdAt)).toLocaleTimeString() : "Confirmed",
          state: "COMPLETED",
          iconName: "check",
          description: "Care order details verified by system",
        },
        {
          id: "step-2",
          title: "Payment Confirmed",
          timestamp: b.paidAt ? new Date(String(b.paidAt)).toLocaleTimeString() : "Confirmed",
          state: "COMPLETED",
          iconName: "check",
          description: "Encrypted transaction settled",
        },
        {
          id: "step-3",
          title: "Pickup Scheduled",
          timestamp: b.scheduledPickupAt ? new Date(String(b.scheduledPickupAt)).toLocaleDateString() : "Scheduled",
          state: ["CONFIRMED", "PICKUP_SCHEDULED"].includes(status) ? "ACTIVE" : "COMPLETED",
          iconName: "schedule",
          description: "Doorstep valet driver assigned for collection",
        },
        {
          id: "step-4",
          title: "Pickup in Progress",
          state: status === "PICKUP_IN_PROGRESS" ? "ACTIVE" : ["PROVIDER_RECEIVED", "IN_PROGRESS", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? "COMPLETED" : "UPCOMING",
          iconName: "directions_car",
          description: "Valet driver en route to your address",
        },
        {
          id: "step-5",
          title: "Provider Received",
          state: status === "PROVIDER_RECEIVED" ? "ACTIVE" : ["IN_PROGRESS", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? "COMPLETED" : "UPCOMING",
          iconName: "storefront",
          description: "Items received and tagged at partner care studio",
        },
        {
          id: "step-6",
          title: "Cleaning in Progress",
          state: status === "IN_PROGRESS" ? "ACTIVE" : ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? "COMPLETED" : "UPCOMING",
          iconName: "laundry",
          description: "Specialty fabric treatment & quality washing underway",
        },
        {
          id: "step-7",
          title: "Ready for Delivery",
          state: ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"].includes(status) ? "ACTIVE" : status === "DELIVERED" ? "COMPLETED" : "UPCOMING",
          iconName: "inventory_2",
          description: "Quality inspection complete, packaged in luxury garment bag",
        },
        {
          id: "step-8",
          title: "Delivered",
          state: status === "DELIVERED" ? "COMPLETED" : "UPCOMING",
          iconName: "done_all",
          description: "Returned safely to your doorstep",
        },
      ];

  const addressObj = b.address as Record<string, unknown> | undefined;
  const items = Array.isArray(b.items) ? (b.items as Record<string, unknown>[]) : [];
  const firstItem = items[0] || {};
  const firstService = (firstItem.service || {}) as Record<string, unknown>;
  const firstVariant = (firstItem.serviceVariant || {}) as Record<string, unknown>;

  return {
    id: String(b.id || ""),
    orderNumber: String(b.bookingNumber || b.id || ""),
    status: isCancelled ? "CANCELLED" : status,
    statusLabel: isCancelled ? "Cancelled & Refund Initiated" : status.replace(/_/g, " "),
    serviceName: String(firstService.name || "Premium Care Service"),
    variantName: String(firstVariant.name || "Standard Care"),
    providerName: String((b.provider as Record<string, unknown>)?.name || "WASHORA Certified Studio"),
    providerRating: 4.9,
    providerReviewCount: 840,
    providerImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBySfVxFSkctcv_DqUIfXWJ_AL_hfbLLAiY7mMiMPkrJFsvFwM5AbWs9hdHKlwue-eL43ob4go3ZRLt1XJL6EEp3neBb65fWQ4SCwLsSnqGs-6auvli9soxbuUbbkHcoZ8OdSprrudUWo0ZR94pZt047HNGQ0wsR6py-Dt9B9HF0ldYPMaSb27nWC1quhd-Je0ARGzOZE4hD_15okcqsFvrdxfOmJoE5r7FNEnlco4A_NakbZDtwRMguw",
    pickupWindow: b.scheduledPickupAt ? new Date(String(b.scheduledPickupAt)).toLocaleString() : "Tomorrow, 10:00 AM – 12:00 PM",
    pickupAddressLine1: String(addressObj?.line1 || "Customer Address"),
    pickupAddressLine2: String(addressObj?.city ? `${addressObj.city}, ${addressObj.postalCode || ""}` : "WASHORA Service Area"),
    totalAmount: Number(b.totalAmount || b.estimatedAmount || 502),
    paymentMethodLabel: "Online Payment",
    turnaroundEstimate: "24–48 hrs",
    timeline,
    canReschedule: !isCancelled && ["DRAFT", "SUBMITTED", "CONFIRMED", "SCHEDULED"].includes(status),
    canCancel: !isCancelled && ["DRAFT", "SUBMITTED", "CONFIRMED", "SCHEDULED"].includes(status),
  };
}

export interface IOrderLifecycleService {
  getOrderTracking(orderId: string): Promise<OrderTrackingDetails>;
  getAllCustomerOrders(): Promise<OrderTrackingDetails[]>;
}

class OrderLifecycleService implements IOrderLifecycleService {
  async getOrderTracking(orderId: string): Promise<OrderTrackingDetails> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.bookings.getById(orderId);
        if (res.data) {
          return mapBookingToTracking(res.data as Record<string, unknown>);
        }
      } catch (err) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 100));

    const confirmation = await orderConfirmationService.getOrderConfirmation(orderId);

    let isCancelled = false;
    let rescheduledWindow: string | null = null;

    if (typeof window !== "undefined") {
      try {
        isCancelled = localStorage.getItem(`washora_order_cancelled_${orderId}`) === "true";
        rescheduledWindow = localStorage.getItem(`washora_order_rescheduled_${orderId}`);
      } catch {
        // ignore
      }
    }

    const pickupWindow =
      rescheduledWindow || `${confirmation.pickupDateFormatted}, ${confirmation.pickupTimeSlot}`;

    const timeline = isCancelled
      ? [
          MOCK_TIMELINE_STEPS[0],
          {
            id: "step-cancelled",
            title: "Order Cancelled",
            timestamp: "Just now",
            state: "COMPLETED" as const,
            iconName: "close",
            description: "Order cancelled by customer. 100% refund initiated.",
          },
        ]
      : MOCK_TIMELINE_STEPS.map((s) => {
          if (s.id === "step-3" && rescheduledWindow) {
            return {
              ...s,
              timestamp: rescheduledWindow,
              description: `Rescheduled pickup: ${rescheduledWindow}`,
            };
          }
          return s;
        });

    return {
      id: orderId || confirmation.orderId,
      orderNumber: confirmation.orderId,
      status: isCancelled ? "CANCELLED" : "PICKUP_SCHEDULED",
      statusLabel: isCancelled ? "Cancelled & Refund Initiated" : "Pickup Scheduled",
      serviceName: confirmation.serviceName,
      variantName: confirmation.variantName,
      providerName: confirmation.providerName,
      providerRating: 4.9,
      providerReviewCount: 1200,
      providerImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBySfVxFSkctcv_DqUIfXWJ_AL_hfbLLAiY7mMiMPkrJFsvFwM5AbWs9hdHKlwue-eL43ob4go3ZRLt1XJL6EEp3neBb65fWQ4SCwLsSnqGs-6auvli9soxbuUbbkHcoZ8OdSprrudUWo0ZR94pZt047HNGQ0wsR6py-Dt9B9HF0ldYPMaSb27nWC1quhd-Je0ARGzOZE4hD_15okcqsFvrdxfOmJoE5r7FNEnlco4A_NakbZDtwRMguw",
      pickupWindow,
      pickupAddressLine1: "Anna Nagar, Chennai",
      pickupAddressLine2: confirmation.addressFormatted,
      totalAmount: confirmation.amountPaid,
      paymentMethodLabel: confirmation.paymentMethodLabel,
      turnaroundEstimate: confirmation.turnaroundEstimate,
      timeline,
      canReschedule: !isCancelled,
      canCancel: !isCancelled,
    };
  }

  async getAllCustomerOrders(): Promise<OrderTrackingDetails[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.bookings.list();
        const items = Array.isArray(res.data) ? res.data : [];
        return (items as Record<string, unknown>[]).map(mapBookingToTracking);
      } catch (err) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 100));
    const current = await this.getOrderTracking("WSH-20260901-1024");

    const pastOrder: OrderTrackingDetails = {
      id: "WSH-20260815-0812",
      orderNumber: "WSH-20260815-0812",
      status: "DELIVERED",
      statusLabel: "Delivered",
      serviceName: "Formal Silk & Suit Dry Clean",
      variantName: "Standard Luxury Clean",
      providerName: "LuxeCare Master Studio",
      providerRating: 4.9,
      providerReviewCount: 840,
      pickupWindow: "Aug 15, 10:00 AM – 12:00 PM",
      pickupAddressLine1: "Anna Nagar, Chennai",
      pickupAddressLine2: "12, Example Street, Anna Nagar, Chennai - 600040",
      totalAmount: 649,
      paymentMethodLabel: "Paid via Card",
      turnaroundEstimate: "Completed in 24 hrs",
      timeline: MOCK_TIMELINE_STEPS.map((s) => ({ ...s, state: "COMPLETED" })),
      canReschedule: false,
      canCancel: false,
    };

    return [current, pastOrder];
  }
}

export const orderLifecycleService = new OrderLifecycleService();
