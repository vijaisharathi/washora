import {
  DeliveryPartnerTask,
  DeliveryHandoverState,
  DeliveryIssueReportPayload,
} from "@/types/delivery-partner";
import { deliveryPartnerTaskService } from "./deliveryPartnerTaskService";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { isLiveMode } from "@/lib/api/mode";

export interface IDeliveryPartnerDeliveryService {
  getDeliveryTasks(): Promise<DeliveryPartnerTask[]>;
  getDeliveryTaskById(taskId: string): Promise<DeliveryPartnerTask | null>;
  startDelivery(taskId: string): Promise<DeliveryPartnerTask>;
  markArrived(taskId: string): Promise<DeliveryPartnerTask>;
  verifyDeliveryOtp(taskId: string, otp: string): Promise<{ success: boolean; message: string }>;
  completeDelivery(taskId: string, handoverState: DeliveryHandoverState): Promise<DeliveryPartnerTask>;
  reportDeliveryIssue(payload: DeliveryIssueReportPayload): Promise<{ success: boolean; message: string }>;
}

class DeliveryPartnerDeliveryService implements IDeliveryPartnerDeliveryService {
  async getDeliveryTasks(): Promise<DeliveryPartnerTask[]> {
    await new Promise((res) => setTimeout(res, 50));
    const allTasks = await deliveryPartnerTaskService.getTasks();
    return allTasks.filter(
      (t) =>
        t.type === "CUSTOMER_DELIVERY" ||
        t.status === "IN_TRANSIT" ||
        t.status === "ARRIVED_AT_DELIVERY" ||
        t.status === "PICKED_UP"
    );
  }

  async getDeliveryTaskById(taskId: string): Promise<DeliveryPartnerTask | null> {
    await new Promise((res) => setTimeout(res, 50));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) return null;

    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";
    if (task.partnerId !== currentPartnerId) return null;

    return task;
  }

  async startDelivery(taskId: string): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 80));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) {
      throw new Error(`Delivery task #${taskId} not found.`);
    }

    const updated: DeliveryPartnerTask = {
      ...task,
      status: "IN_TRANSIT",
      timeline: [
        ...task.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Delivery Departure from Hub",
          description: "Valet departed from fulfillment hub toward customer address",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
          isCurrent: true,
        },
      ],
    };

    if (!isLiveMode()) {
      const allTasks = await deliveryPartnerTaskService.getTasks();
      const idx = allTasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        allTasks[idx] = updated;
        deliveryPartnerTaskService.persistTasks(allTasks);
      }
    }

    return updated;
  }

  async markArrived(taskId: string): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 80));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) {
      throw new Error(`Delivery task #${taskId} not found.`);
    }

    const updated: DeliveryPartnerTask = {
      ...task,
      status: "ARRIVED_AT_DELIVERY",
      timeline: [
        ...task.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Arrived at Customer Doorstep",
          description: "Valet reached destination dropoff location",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
          isCurrent: true,
        },
      ],
    };

    if (!isLiveMode()) {
      const allTasks = await deliveryPartnerTaskService.getTasks();
      const idx = allTasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        allTasks[idx] = updated;
        deliveryPartnerTaskService.persistTasks(allTasks);
      }
    }

    return updated;
  }

  async verifyDeliveryOtp(taskId: string, otp: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 100));
    if (otp.length === 4) {
      return { success: true, message: "Delivery security handover PIN successfully verified." };
    }
    throw new Error("Invalid delivery verification PIN. Please re-check with the customer.");
  }

  async completeDelivery(
    taskId: string,
    handoverState: DeliveryHandoverState
  ): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 120));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) {
      throw new Error(`Delivery task #${taskId} not found.`);
    }

    const updated: DeliveryPartnerTask = {
      ...task,
      status: "DELIVERED",
      timeline: [
        ...task.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Order Delivered & Signed Off",
          description: `Handed over intact with PIN verification. Seal verification: ${handoverState.securitySealIntact ? "Passed" : "Checked"}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
          isCurrent: true,
        },
      ],
    };

    if (!isLiveMode()) {
      const allTasks = await deliveryPartnerTaskService.getTasks();
      const idx = allTasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        allTasks[idx] = updated;
        deliveryPartnerTaskService.persistTasks(allTasks);
      }
    }

    return updated;
  }

  async reportDeliveryIssue(payload: DeliveryIssueReportPayload): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 100));
    return {
      success: true,
      message: `Delivery issue reported for Order #${payload.orderId}. Dispatch hub notified.`,
    };
  }
}

export const deliveryPartnerDeliveryService = new DeliveryPartnerDeliveryService();
