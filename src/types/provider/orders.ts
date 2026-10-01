/**
 * Type definitions for WASHORA Service Provider Order Processing (P7)
 */

export type ProviderOrderStatus =
  | "INTAKE_INSPECTION"
  | "HYDROCARBON_CARE"
  | "STEAM_DEODORIZE"
  | "QUALITY_CHECK"
  | "READY_VALET";

export interface ProcessingChecklistStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  isCurrent?: boolean;
}

export interface OrderCustomerSnapshot {
  id: string;
  name: string;
  phone?: string;
  pickupAddress: string;
  distanceKm?: number;
}

export interface ProviderOrderIssue {
  reason: string;
  details: string;
  reportedAt: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface ProviderOrderItem {
  id: string;
  orderNumber: string; // e.g. "WSH-20260902-1042"
  bookingId: string;
  providerId: string;
  customer: OrderCustomerSnapshot;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  itemsCount: number;
  careType: "Standard Care" | "Express Rush" | "Couture Spa";
  status: ProviderOrderStatus;
  progressPercent: number; // 0 - 100
  startedAt: string;
  expectedCompletion: string;
  checklist: ProcessingChecklistStep[];
  itemPhotos: string[];
  providerNotes?: string;
  issueReport?: ProviderOrderIssue;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderOrderStats {
  inIntakeCount: number;
  inCareCount: number;
  inQualityCount: number;
  readyValetCount: number;
  totalActiveCount: number;
}

export interface AdvanceOrderStagePayload {
  orderId: string;
  nextStatus: ProviderOrderStatus;
}

export interface ToggleChecklistStepPayload {
  orderId: string;
  stepId: string;
}

export interface AddOrderNotePayload {
  orderId: string;
  note: string;
}

export interface ReportOrderIssuePayload {
  orderId: string;
  reason: string;
  details: string;
  severity?: "LOW" | "MEDIUM" | "HIGH";
}
