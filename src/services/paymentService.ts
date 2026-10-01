import {
  PaymentMethodOption,
  PaymentMethodId,
  PaymentTransactionResult,
  CardFormData,
  UpiFormData,
} from "@/types/customer/payment";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "upi",
    name: "UPI (Google Pay, PhonePe, Paytm)",
    description: "Instant payment via UPI QR code or VPA identifier",
    iconName: "qr_code_2",
    badge: "Fastest",
    popular: true,
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay & American Express",
    iconName: "credit_card",
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major Indian scheduled commercial banks",
    iconName: "account_balance",
  },
  {
    id: "wallet",
    name: "Wallets",
    description: "Amazon Pay, Mobikwik, Paytm Wallet",
    iconName: "account_balance_wallet",
  },
  {
    id: "cod",
    name: "Pay on Doorstep Delivery",
    description: "Pay via UPI or Cash upon doorstep garment return",
    iconName: "payments",
  },
];

export interface IPaymentService {
  getPaymentMethods(): Promise<PaymentMethodOption[]>;
  processPayment(params: {
    amount: number;
    method: PaymentMethodId;
    payload?: CardFormData | UpiFormData;
    shouldFail?: boolean;
    bookingId?: string;
  }): Promise<PaymentTransactionResult>;
  listPayments(): Promise<unknown[]>;
  getPaymentSummary(): Promise<unknown>;
}

class PaymentService implements IPaymentService {
  async getPaymentMethods(): Promise<PaymentMethodOption[]> {
    await new Promise((res) => setTimeout(res, 100));
    return PAYMENT_METHODS;
  }

  async processPayment(params: {
    amount: number;
    method: PaymentMethodId;
    payload?: CardFormData | UpiFormData;
    shouldFail?: boolean;
    bookingId?: string;
  }): Promise<PaymentTransactionResult> {
    if (isLiveMode()) {
      if (params.shouldFail) {
        return {
          status: "FAILED",
          transactionId: `TXN-${Date.now().toString().slice(-8)}`,
          bookingId: params.bookingId || `WSH-BK-${Date.now().toString().slice(-6)}`,
          amount: params.amount,
          paymentMethod: params.method,
          timestamp: new Date().toISOString(),
          errorMessage: "Transaction declined by issuing bank. Please try a different card or UPI.",
        };
      }

      try {
        let bookingId = params.bookingId;
        if (!bookingId) {
          const addressesRes = await customerApi.addresses.list().catch(() => ({ data: [] }));
          const addresses = Array.isArray(addressesRes.data) ? addressesRes.data : [];
          const defaultAddr = (addresses as Array<{ id?: string; isDefault?: boolean }>).find((a) => a.isDefault) || addresses[0];
          const addressId = defaultAddr?.id || "addr-default";

          const bookingRes = await customerApi.bookings.create({
            addressId,
            scheduledPickupAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            items: [],
          });
          const bData = bookingRes.data as Record<string, unknown>;
          bookingId = String(bData?.id || "");
        }

        const createRes = await customerApi.payments.create(bookingId, {
          amount: params.amount,
          currency: "INR",
          paymentMethod: params.method.toUpperCase(),
        });

        const paymentData = createRes.data as Record<string, unknown>;
        const paymentId = String(paymentData?.id || "");

        if (paymentId) {
          const processRes = await customerApi.payments.process(paymentId, {
            gatewayTransactionId: `GW-${Date.now()}`,
          });
          const processed = processRes.data as Record<string, unknown>;
          return {
            status: "SUCCESS",
            transactionId: String(processed?.transactionId || `TXN-${Date.now().toString().slice(-8)}`),
            bookingId,
            amount: params.amount,
            paymentMethod: params.method,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          status: "SUCCESS",
          transactionId: `TXN-${Date.now().toString().slice(-8)}`,
          bookingId,
          amount: params.amount,
          paymentMethod: params.method,
          timestamp: new Date().toISOString(),
        };
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.processPaymentMock(params);
  }

  private async processPaymentMock(params: {
    amount: number;
    method: PaymentMethodId;
    payload?: CardFormData | UpiFormData;
    shouldFail?: boolean;
    bookingId?: string;
  }): Promise<PaymentTransactionResult> {
    await new Promise((res) => setTimeout(res, 800));

    if (params.shouldFail) {
      return {
        status: "FAILED",
        transactionId: `TXN-${Date.now().toString().slice(-8)}`,
        bookingId: params.bookingId || `WSH-BK-${Date.now().toString().slice(-6)}`,
        amount: params.amount,
        paymentMethod: params.method,
        timestamp: new Date().toISOString(),
        errorMessage: "Transaction declined by issuing bank. Please try a different card or UPI.",
      };
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return {
      status: "SUCCESS",
      transactionId: `TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${randomSuffix}`,
      bookingId: params.bookingId || `WSH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${randomSuffix}`,
      amount: params.amount,
      paymentMethod: params.method,
      timestamp: new Date().toISOString(),
    };
  }

  async listPayments(): Promise<unknown[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.payments.list();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  async getPaymentSummary(): Promise<unknown> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.payments.getSummary();
        return res.data;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const paymentService = new PaymentService();
