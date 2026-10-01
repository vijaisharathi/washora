import { CustomerBookingDraft } from "./booking";
import { PaymentMethodId } from "./payment";

export interface OrderConfirmationData {
  orderId: string;
  transactionId: string;
  serviceName: string;
  variantName?: string;
  providerName: string;
  amountPaid: number;
  paymentMethod: PaymentMethodId;
  paymentMethodLabel: string;
  pickupDateFormatted: string;
  pickupTimeSlot: string;
  addressFormatted: string;
  turnaroundEstimate: string;
  createdAt: string;
  draft?: CustomerBookingDraft;
}
