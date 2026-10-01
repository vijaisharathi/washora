export interface CancellationReasonOption {
  id: string;
  label: string;
}

export interface RefundBreakdownData {
  amountPaid: number;
  estimatedRefund: number;
  refundMethod: string;
  timeline: string;
  isEligible: boolean;
  policyNotice: string;
}

export interface RescheduleDateOption {
  id: string;
  dayLabel: string;
  dateNumber: string;
  dateFormatted: string;
  monthFormatted: string;
  isAvailable: boolean;
}

export interface RescheduleTimeSlot {
  id: string;
  timeRange: string;
  status: "AVAILABLE" | "SELECTED" | "FULLY_BOOKED";
}

export interface CancelOrderPayload {
  orderId: string;
  reason?: string;
  notes?: string;
}

export interface RescheduleOrderPayload {
  orderId: string;
  newDateFormatted: string;
  newTimeSlot: string;
}
