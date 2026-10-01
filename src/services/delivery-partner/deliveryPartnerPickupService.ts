import {
  DeliveryPartnerTask,
  PickupVerificationState,
  PickupIssueReportPayload,
} from "@/types/delivery-partner";
import { deliveryPartnerTaskService } from "./deliveryPartnerTaskService";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { isLiveMode } from "@/lib/api/mode";

export interface IDeliveryPartnerPickupService {
  getPickupTasks(): Promise<DeliveryPartnerTask[]>;
  getPickupTaskById(taskId: string): Promise<DeliveryPartnerTask | null>;
  startPickup(taskId: string): Promise<DeliveryPartnerTask>;
  verifyPickupOtp(taskId: string, otp: string): Promise<{ success: boolean; message: string }>;
  confirmPickup(taskId: string, verificationState: PickupVerificationState): Promise<DeliveryPartnerTask>;
  reportPickupIssue(payload: PickupIssueReportPayload): Promise<{ success: boolean; message: string }>;
}

class DeliveryPartnerPickupService implements IDeliveryPartnerPickupService {
  async getPickupTasks(): Promise<DeliveryPartnerTask[]> {
    await new Promise((res) => setTimeout(res, 50));
    const allTasks = await deliveryPartnerTaskService.getTasks();
    return allTasks.filter(
      (t) =>
        t.type === "CUSTOMER_PICKUP" ||
        t.status === "PICKUP_STARTED" ||
        t.status === "ASSIGNED" ||
        t.status === "ACCEPTED"
    );
  }

  async getPickupTaskById(taskId: string): Promise<DeliveryPartnerTask | null> {
    await new Promise((res) => setTimeout(res, 50));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) return null;

    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";
    if (task.partnerId !== currentPartnerId) return null;

    return task;
  }

  async startPickup(taskId: string): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 80));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) {
      throw new Error(`Pickup task #${taskId} not found.`);
    }

    const updated: DeliveryPartnerTask = {
      ...task,
      status: "PICKUP_STARTED",
      timeline: [
        ...task.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Pickup Run Started",
          description: "Valet departing toward pickup origin address",
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

  async verifyPickupOtp(taskId: string, otp: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 100));
    if (otp.length === 4) {
      return { success: true, message: "Doorstep pickup verification PIN confirmed." };
    }
    throw new Error("Invalid pickup verification PIN. Please re-check with the customer/provider.");
  }

  async confirmPickup(
    taskId: string,
    verificationState: PickupVerificationState
  ): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 120));
    const task = await deliveryPartnerTaskService.getTaskById(taskId);
    if (!task) {
      throw new Error(`Pickup task #${taskId} not found.`);
    }

    const updated: DeliveryPartnerTask = {
      ...task,
      status: "PICKED_UP",
      timeline: [
        ...task.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Pickup Confirmed & Inward Sealed",
          description: `Verified ${verificationState.verifiedItemIndexes.length}/${task.itemsList.length} items. Tag #${verificationState.securitySealTagCode || "WASH-TAG-01"} attached.`,
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

  async reportPickupIssue(payload: PickupIssueReportPayload): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 100));
    return {
      success: true,
      message: `Pickup incident logged for Order #${payload.orderId}. Dispatch hub notified.`,
    };
  }
}

export const deliveryPartnerPickupService = new DeliveryPartnerPickupService();
