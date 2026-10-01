import { OrderConfirmationData } from "@/types/customer/orderConfirmation";
import { bookingService } from "@/services/bookingService";

const STORAGE_CONFIRMATION_KEY = "washora_latest_confirmation";

export interface IOrderConfirmationService {
  getOrderConfirmation(orderId?: string): Promise<OrderConfirmationData>;
  saveConfirmation(data: OrderConfirmationData): Promise<void>;
}

class OrderConfirmationService implements IOrderConfirmationService {
  async getOrderConfirmation(orderId?: string): Promise<OrderConfirmationData> {
    await new Promise((res) => setTimeout(res, 150));

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_CONFIRMATION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as OrderConfirmationData;
          if (!orderId || parsed.orderId === orderId) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    let draft = await bookingService.getSavedDraft();
    if (!draft) {
      draft = await bookingService.getInitialDraft({ serviceId: "srv-1" });
    }

    const defaultOrderId = orderId || "WSH-20260901-1024";
    const defaultTxnId = `TXN-${defaultOrderId.replace("WSH-", "")}`;

    const confirmation: OrderConfirmationData = {
      orderId: defaultOrderId,
      transactionId: defaultTxnId,
      serviceName: draft.service?.name || "Sneaker Deep Clean (Premium)",
      variantName: draft.variant?.name || "Premium Care Package",
      providerName: draft.provider?.businessName || "CleanX Service Center",
      amountPaid: draft.estimatedTotal || 502,
      paymentMethod: "upi",
      paymentMethodLabel: "UPI (Google Pay / PhonePe)",
      pickupDateFormatted: draft.pickupDate || "Sep 1",
      pickupTimeSlot: draft.pickupTimeSlotLabel || "10:00 AM – 12:00 PM",
      addressFormatted: draft.selectedAddress
        ? `${draft.selectedAddress.streetAddress}, ${draft.selectedAddress.city} - ${draft.selectedAddress.postalCode}`
        : "12, Example Street, Anna Nagar, Chennai - 600040",
      turnaroundEstimate: "24–48 hrs after doorstep pickup",
      createdAt: new Date().toISOString(),
      draft,
    };

    await this.saveConfirmation(confirmation);
    return confirmation;
  }

  async saveConfirmation(data: OrderConfirmationData): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_CONFIRMATION_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }
}

export const orderConfirmationService = new OrderConfirmationService();
