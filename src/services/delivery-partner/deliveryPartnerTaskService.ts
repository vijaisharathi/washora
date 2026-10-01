import {
  DeliveryPartnerTask,
  TaskFilterParams,
  TaskStatus,
  TaskType,
} from "@/types/delivery-partner";
import { MOCK_DELIVERY_PARTNER_TASKS } from "@/mocks/delivery-partner/tasks.mock";
import { deliveryPartnerAuthService } from "./deliveryPartnerAuthService";
import { deliveryPartnerApi } from "@/features/delivery-partner/api/deliveryPartnerApi";
import { isLiveMode } from "@/lib/api/mode";

const STORAGE_TASKS_KEY = "washora_delivery_partner_tasks";

let inMemoryTasks: DeliveryPartnerTask[] = [...MOCK_DELIVERY_PARTNER_TASKS];

function mapBackendStatusToTaskStatus(status: string): TaskStatus {
  switch (status) {
    case "BROADCASTED":
      return "AVAILABLE";
    case "ASSIGNED":
      return "ASSIGNED";
    case "ACCEPTED":
      return "ACCEPTED";
    case "PICKUP_IN_PROGRESS":
      return "PICKUP_STARTED";
    case "PICKED_UP":
      return "PICKED_UP";
    case "DELIVERY_IN_PROGRESS":
      return "IN_TRANSIT";
    case "COMPLETED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    case "REJECTED":
      return "REJECTED";
    default:
      return "ASSIGNED";
  }
}

function mapAssignmentToTask(item: any, partnerId: string): DeliveryPartnerTask {
  const taskType: TaskType = item.type === "PROVIDER_TRANSFER" ? "HUB_TRANSFER" : (item.type || "CUSTOMER_PICKUP");
  const mappedStatus: TaskStatus = mapBackendStatusToTaskStatus(item.status);

  return {
    id: item.publicId || item.id,
    partnerId,
    orderId: item.bookingNumber || item.bookingId || "BK-0000",
    type: taskType,
    status: mappedStatus,
    customerName: item.address?.recipientName || "Valued Customer",
    customerPhone: item.address?.recipientPhone || "+91 98765 43210",
    pickupAddress: item.address?.formattedAddress || "100ft Road, Indiranagar, Bangalore",
    deliveryAddress: item.address?.formattedAddress || "100ft Road, Indiranagar, Bangalore",
    itemSummary: `${item.totalPackageCount || 1} Standard Garment Package(s)`,
    itemsList: [`Garment Package #${item.bookingNumber || "01"}-A`, `Valet Tagged Pouch #${item.bookingNumber || "01"}-B`],
    packageCount: item.totalPackageCount || 1,
    scheduledTimeWindow: item.schedule ? `${item.schedule.timeSlot || "Standard Slot"}` : "09:00 AM - 11:00 AM",
    distanceKm: 3.5,
    payoutAmount: 85,
    isPriority: false,
    notes: undefined,
    createdAt: new Date().toISOString(),
    estimatedDurationMins: 30,
    timeline: (item.history && Array.isArray(item.history) && item.history.length > 0)
      ? item.history.map((h: any, idx: number) => ({
          id: `tl-${h.id || idx}`,
          title: `Assignment ${h.toStatus}`,
          description: h.reason || `Status updated from ${h.fromStatus} to ${h.toStatus}`,
          timestamp: new Date(h.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
          isCurrent: idx === item.history.length - 1,
        }))
      : [
          {
            id: `tl-${item.publicId || "1"}-created`,
            title: "Assignment Created",
            description: "Booking dispatched to valet network",
            timestamp: "09:00 AM",
            isCompleted: true,
          },
          {
            id: `tl-${item.publicId || "1"}-status`,
            title: mappedStatus === "ACCEPTED" || mappedStatus === "IN_TRANSIT" || mappedStatus === "DELIVERED"
              ? "Assignment Accepted"
              : "Pending Acceptance",
            description: "Valet delivery partner assignment",
            timestamp: "09:15 AM",
            isCompleted: mappedStatus !== "AVAILABLE" && mappedStatus !== "ASSIGNED",
            isCurrent: mappedStatus === "ACCEPTED",
          },
        ],
  };
}

export interface IDeliveryPartnerTaskService {
  getTasks(filters?: TaskFilterParams): Promise<DeliveryPartnerTask[]>;
  getTaskById(taskId: string): Promise<DeliveryPartnerTask | null>;
  acceptTask(taskId: string): Promise<DeliveryPartnerTask>;
  rejectTask(taskId: string, reason?: string): Promise<DeliveryPartnerTask>;
  startTransit(taskId: string): Promise<DeliveryPartnerTask>;
  cancelTask(taskId: string, reason: string): Promise<DeliveryPartnerTask>;
}

class DeliveryPartnerTaskService implements IDeliveryPartnerTaskService {
  private async loadStoredTasks(): Promise<DeliveryPartnerTask[]> {
    if (typeof window === "undefined") return inMemoryTasks;
    try {
      const stored = localStorage.getItem(STORAGE_TASKS_KEY);
      if (stored) {
        inMemoryTasks = JSON.parse(stored);
        return inMemoryTasks;
      }
    } catch {
      return inMemoryTasks;
    }
    return inMemoryTasks;
  }

  persistTasks(tasks: DeliveryPartnerTask[]): void {
    inMemoryTasks = tasks;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
      } catch {
        // ignore
      }
    }
  }

  async getTasks(filters?: TaskFilterParams): Promise<DeliveryPartnerTask[]> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const queryParams: Record<string, any> = {};
      if (filters?.category && filters.category !== "ALL") {
        if (filters.category === "AVAILABLE") queryParams.status = "BROADCASTED";
        else if (filters.category === "ASSIGNED") queryParams.status = "ASSIGNED";
        else if (filters.category === "IN_TRANSIT") queryParams.status = "DELIVERY_IN_PROGRESS";
        else if (filters.category === "COMPLETED") queryParams.status = "COMPLETED";
      }

      const res = await deliveryPartnerApi.assignments.list(queryParams);
      const items: any[] = Array.isArray(res.data) ? res.data : [];
      let mapped = items.map((item: any) => mapAssignmentToTask(item, currentPartnerId));

      if (filters?.type && filters.type !== "ALL") {
        mapped = mapped.filter((t: DeliveryPartnerTask) => t.type === filters.type);
      }

      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        mapped = mapped.filter(
          (t: DeliveryPartnerTask) =>
            t.orderId.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q) ||
            t.deliveryAddress.toLowerCase().includes(q) ||
            t.pickupAddress.toLowerCase().includes(q) ||
            t.itemSummary.toLowerCase().includes(q)
        );
      }

      return mapped;
    }

    await new Promise((res) => setTimeout(res, 50));
    const allTasks = await this.loadStoredTasks();
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    let scoped = allTasks.filter((t) => t.partnerId === currentPartnerId);

    if (!filters) return scoped;

    if (filters.category && filters.category !== "ALL") {
      if (filters.category === "AVAILABLE") {
        scoped = scoped.filter((t) => t.status === "AVAILABLE");
      } else if (filters.category === "ASSIGNED") {
        scoped = scoped.filter((t) => t.status === "ASSIGNED" || t.status === "ACCEPTED");
      } else if (filters.category === "IN_TRANSIT") {
        scoped = scoped.filter((t) => t.status === "IN_TRANSIT");
      } else if (filters.category === "COMPLETED") {
        scoped = scoped.filter((t) => t.status === "DELIVERED");
      }
    }

    if (filters.type && filters.type !== "ALL") {
      scoped = scoped.filter((t) => t.type === filters.type);
    }

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      scoped = scoped.filter(
        (t) =>
          t.orderId.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.deliveryAddress.toLowerCase().includes(q) ||
          t.pickupAddress.toLowerCase().includes(q) ||
          t.itemSummary.toLowerCase().includes(q)
      );
    }

    return scoped;
  }

  async getTaskById(taskId: string): Promise<DeliveryPartnerTask | null> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      try {
        const res = await deliveryPartnerApi.assignments.getById(taskId);
        if (!res.data) return null;
        return mapAssignmentToTask(res.data, currentPartnerId);
      } catch {
        return null;
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const allTasks = await this.loadStoredTasks();
    const session = await deliveryPartnerAuthService.getSession();
    const currentPartnerId = session.partner?.id || "dp-1";

    const match = allTasks.find((t) => t.id === taskId);
    if (!match) return null;

    if (match.partnerId !== currentPartnerId) return null;
    return match;
  }

  async acceptTask(taskId: string): Promise<DeliveryPartnerTask> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const res = await deliveryPartnerApi.assignments.accept(taskId);
      return mapAssignmentToTask(res.data, currentPartnerId);
    }

    await new Promise((res) => setTimeout(res, 100));
    const allTasks = await this.loadStoredTasks();
    const idx = allTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      throw new Error(`Task ${taskId} not found.`);
    }

    const current = allTasks[idx];
    if (current.status !== "AVAILABLE" && current.status !== "ASSIGNED") {
      throw new Error(`Cannot accept task in status ${current.status}.`);
    }

    const updated: DeliveryPartnerTask = {
      ...current,
      status: "ACCEPTED",
      timeline: [
        ...current.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Job Accepted by Valet",
          description: "Valet confirmed job assignment",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
          isCurrent: true,
        },
      ],
    };

    allTasks[idx] = updated;
    this.persistTasks(allTasks);
    return updated;
  }

  async rejectTask(taskId: string, reason?: string): Promise<DeliveryPartnerTask> {
    if (isLiveMode()) {
      const session = await deliveryPartnerAuthService.getSession();
      const currentPartnerId = session.partner?.id || "dp-1";

      const res = await deliveryPartnerApi.assignments.reject(taskId, reason || "Declined by delivery partner");
      return mapAssignmentToTask(res.data, currentPartnerId);
    }

    await new Promise((res) => setTimeout(res, 100));
    const allTasks = await this.loadStoredTasks();
    const idx = allTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      throw new Error(`Task ${taskId} not found.`);
    }

    const current = allTasks[idx];
    const updated: DeliveryPartnerTask = {
      ...current,
      status: "REJECTED",
      notes: reason ? `Rejected: ${reason}` : current.notes,
      timeline: [
        ...current.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Job Declined by Valet",
          description: reason || "Valet opted out from job broadcast",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
        },
      ],
    };

    allTasks[idx] = updated;
    this.persistTasks(allTasks);
    return updated;
  }

  async startTransit(taskId: string): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 100));
    const allTasks = await this.loadStoredTasks();
    const idx = allTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      // In live mode, fetch and return updated task
      if (isLiveMode()) {
        const task = await this.getTaskById(taskId);
        if (task) {
          return { ...task, status: "IN_TRANSIT" };
        }
      }
      throw new Error(`Task ${taskId} not found.`);
    }

    const current = allTasks[idx];
    const updated: DeliveryPartnerTask = {
      ...current,
      status: "IN_TRANSIT",
      timeline: [
        ...current.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "In Transit to Destination",
          description: "Valet started transit route",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
          isCurrent: true,
        },
      ],
    };

    allTasks[idx] = updated;
    this.persistTasks(allTasks);
    return updated;
  }

  async cancelTask(taskId: string, reason: string): Promise<DeliveryPartnerTask> {
    await new Promise((res) => setTimeout(res, 100));
    const allTasks = await this.loadStoredTasks();
    const idx = allTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      if (isLiveMode()) {
        const task = await this.getTaskById(taskId);
        if (task) {
          return { ...task, status: "CANCELLED", notes: `Cancelled by Valet: ${reason}` };
        }
      }
      throw new Error(`Task ${taskId} not found.`);
    }

    const current = allTasks[idx];
    const updated: DeliveryPartnerTask = {
      ...current,
      status: "CANCELLED",
      notes: `Cancelled by Valet: ${reason}`,
      timeline: [
        ...current.timeline,
        {
          id: `tl-${Date.now()}`,
          title: "Task Cancelled",
          description: reason,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
        },
      ],
    };

    allTasks[idx] = updated;
    this.persistTasks(allTasks);
    return updated;
  }
}

export const deliveryPartnerTaskService = new DeliveryPartnerTaskService();
