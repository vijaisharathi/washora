import {
  DeliveryPartnerDaySchedule,
  RouteStop,
  RescheduleStopPayload,
} from "@/types/delivery-partner";
import { deliveryPartnerTaskService } from "./deliveryPartnerTaskService";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_ROUTE_ORDER_KEY = "washora_delivery_partner_route_order";

export interface IDeliveryPartnerScheduleService {
  getSchedule(dateStr?: string): Promise<DeliveryPartnerDaySchedule>;
  reorderStops(dateStr: string, stopTaskIds: string[]): Promise<DeliveryPartnerDaySchedule>;
  rescheduleStop(payload: RescheduleStopPayload): Promise<{ success: boolean; message: string }>;
}

class DeliveryPartnerScheduleService implements IDeliveryPartnerScheduleService {
  private memoryOrder: string[] = [];

  private getSavedOrder(): string[] {
    if (this.memoryOrder.length > 0) return this.memoryOrder;
    if (typeof window === "undefined") return [];
    try {
      const val = localStorage.getItem(STORAGE_ROUTE_ORDER_KEY);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  private saveOrder(ids: string[]) {
    this.memoryOrder = ids;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_ROUTE_ORDER_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }

  async getSchedule(dateStr: string = "2026-09-03"): Promise<DeliveryPartnerDaySchedule> {
    await new Promise((res) => setTimeout(res, 50));
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    let shiftName = "Morning Peak Dispatch Shift";
    let shiftHours = "07:00 AM - 02:00 PM";

    if (isLiveMode()) {
      try {
        const availRes = await deliveryPartnerApi.availability.getAvailability();
        const avails = Array.isArray(availRes.data) ? availRes.data : [];
        if (avails.length > 0) {
          const first = avails[0];
          shiftHours = `${first.startTime} - ${first.endTime}`;
        }
      } catch {
        // use default shift hours
      }
    }

    const allTasks = await deliveryPartnerTaskService.getTasks();
    const partnerTasks = allTasks.filter((t) => t.partnerId === currentPartnerId);

    // Apply saved custom order if any
    const savedOrder = this.getSavedOrder();
    const sortedTasks = [...partnerTasks].sort((a, b) => {
      const idxA = savedOrder.indexOf(a.id);
      const idxB = savedOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    const stops: RouteStop[] = sortedTasks.map((t, idx) => {
      const isCompleted = t.status === "DELIVERED" || t.status === "PICKED_UP";
      const isPickup = t.type === "CUSTOMER_PICKUP";
      const address = isPickup ? t.pickupAddress : t.deliveryAddress;

      return {
        stopNumber: idx + 1,
        taskId: t.id,
        orderId: t.orderId,
        type: t.type,
        status: t.status,
        customerName: t.customerName,
        address,
        timeWindow: t.scheduledTimeWindow,
        distanceKm: t.distanceKm,
        payoutAmount: t.payoutAmount,
        isCompleted,
        estimatedEta: isCompleted ? "Completed" : `${15 + idx * 25} mins away`,
      };
    });

    const completedStops = stops.filter((s) => s.isCompleted).length;
    const remainingStops = stops.length - completedStops;
    const totalDistanceKm = Number(stops.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1));

    return {
      date: dateStr,
      shiftName,
      shiftHours,
      hubName: session.partner?.hubName || "Indiranagar Hub #04",
      totalStops: stops.length,
      completedStops,
      remainingStops,
      totalDistanceKm,
      stops,
    };
  }

  async reorderStops(dateStr: string, stopTaskIds: string[]): Promise<DeliveryPartnerDaySchedule> {
    await new Promise((res) => setTimeout(res, 80));
    this.saveOrder(stopTaskIds);
    return this.getSchedule(dateStr);
  }

  async rescheduleStop(payload: RescheduleStopPayload): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 100));
    return {
      success: true,
      message: `Stop for Task #${payload.taskId} rescheduled to window: ${payload.newTimeWindow}`,
    };
  }
}

export const deliveryPartnerScheduleService = new DeliveryPartnerScheduleService();
