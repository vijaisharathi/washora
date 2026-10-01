export type PaymentMethodId = "upi" | "card" | "netbanking" | "wallet" | "cod";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  description: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
}

export type PaymentTransactionStatus = "IDLE" | "PROCESSING" | "SUCCESS" | "FAILED" | "PENDING";

export interface PaymentTransactionResult {
  status: PaymentTransactionStatus;
  transactionId: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethodId;
  timestamp: string;
  errorMessage?: string;
}

export interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface UpiFormData {
  upiId: string;
}
