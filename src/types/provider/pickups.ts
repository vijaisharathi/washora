/**
 * Type definitions for WASHORA Service Provider Pickup & Handover Management (P8)
 */

export type ProviderPickupStatus =
  | "AWAITING_ASSIGNMENT"
  | "PARTNER_ASSIGNED"
  | "PARTNER_ARRIVED"
  | "HANDED_OVER"
  | "FAILED";

export interface DeliveryPartnerSnapshot {
  id: string;
  name: string;
  phone: string;
  vehicleType: "Electric Scooter" | "Motorcycle" | "Express Van";
  vehicleNumber?: string;
  rating?: number;
  arrivalEtaMinutes?: number;
}

export interface HandoverChecklist {
  itemCountVerified: boolean;
  packageSealed: boolean;
  stagingAreaReady: boolean;
}

export interface ProviderPickupItem {
  id: string;
  pickupNumber: string; // e.g. "PK-20260902-1041"
  orderId: string;
  orderNumber: string; // e.g. "WSH-20260902-1042"
  bookingId: string;
  providerId: string;
  customerName: string;
  customerPhone?: string;
  destinationArea: string;
  deliveryWindow: string; // e.g. "Today, 4:00 PM - 6:00 PM"
  serviceName: string;
  itemCount: number;
  itemDescription: string;
  status: ProviderPickupStatus;
  partner?: DeliveryPartnerSnapshot;
  checklist: HandoverChecklist;
  verificationOtp?: string; // Development deterministic test code (e.g. "4289")
  notes?: string;
  issueReport?: {
    reason: string;
    details: string;
    reportedAt: string;
  };
  handedOverAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderPickupStats {
  awaitingAssignmentCount: number;
  assignedEnRouteCount: number;
  readyForHandoverCount: number;
  handedOverCount: number;
  totalCount: number;
}

export interface AssignPartnerPayload {
  pickupId: string;
  partnerId: string;
}

export interface ToggleHandoverChecklistPayload {
  pickupId: string;
  key: keyof HandoverChecklist;
}

export interface ConfirmHandoverPayload {
  pickupId: string;
  verificationCode?: string;
}

export interface ReportHandoverIssuePayload {
  pickupId: string;
  reason: string;
  details: string;
}
