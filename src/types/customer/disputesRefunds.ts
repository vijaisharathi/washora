export type DisputeReasonType =
  | "damaged_garment"
  | "service_mismatch"
  | "billing_discrepancy"
  | "sla_delay"
  | "other";

export interface DisputeReasonOption {
  id: DisputeReasonType;
  label: string;
  description: string;
}

export type ResolutionType = "FULL_REFUND" | "PARTIAL_REFUND" | "COMPLIMENTARY_RECLEAN";

export interface DisputeClaimPayload {
  orderId: string;
  reason: DisputeReasonType;
  desiredResolution: ResolutionType;
  description: string;
  refundAmount?: number;
  hasPhotoEvidence?: boolean;
}

export interface DisputeClaimData {
  id: string;
  disputeNumber: string;
  orderId: string;
  reasonLabel: string;
  desiredResolution: ResolutionType;
  refundAmount: number;
  description: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
  estimatedResolutionDate: string;
}

export interface OrderReceiptData {
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
  paymentDate: string;
  status: "PAID" | "REFUNDED" | "DISPUTED";
  serviceAmount: number;
  addOnsAmount: number;
  discountAmount: number;
  totalAmount: number;
  serviceName: string;
  providerName: string;
}
