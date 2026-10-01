"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCheckout } from "@/features/customer/hooks/useCheckout";
import { usePayment } from "@/features/customer/hooks/usePayment";
import {
  PaymentMethodId,
  CardFormData,
  UpiFormData,
  PaymentTransactionResult,
} from "@/types/customer/payment";
import { PaymentMethodRadioCard } from "@/features/customer/components/payment/PaymentMethodRadioCard";
import { PaymentUpiForm } from "@/features/customer/components/payment/PaymentUpiForm";
import { PaymentCardForm } from "@/features/customer/components/payment/PaymentCardForm";
import { PaymentSummaryCard } from "@/features/customer/components/payment/PaymentSummaryCard";
import { PaymentSuccessModal } from "@/features/customer/components/payment/PaymentSuccessModal";
import { PaymentFailedModal } from "@/features/customer/components/payment/PaymentFailedModal";
import { PaymentSkeleton } from "@/features/customer/components/payment/PaymentSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ArrowLeft, Lock } from "lucide-react";

export default function CustomerPaymentPage() {
  const { summary, isLoading: isCheckoutLoading, isError, refetch } = useCheckout();
  const { methods, isLoadingMethods, processPayment, isProcessing } = usePayment();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("upi");
  const [upiId, setUpiId] = useState("alex.care@okhdfcbank");
  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: "4532 8921 4410 7829",
    cardHolder: "Alex Mercer",
    expiry: "08/29",
    cvv: "392",
  });

  const [transactionResult, setTransactionResult] =
    useState<PaymentTransactionResult | null>(null);

  if (isCheckoutLoading || isLoadingMethods || !summary) {
    return <PaymentSkeleton />;
  }

  if (isError || !summary.draft) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Could Not Initialize Payment"
          message="We were unable to load your checkout amount and payment methods."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const amount = summary.pricing.total || 502;
  const subtotal = summary.pricing.subtotal || 450;
  const taxes = summary.pricing.taxes || 52;
  const serviceName = summary.draft.service?.name || "Specialty Garment Care";

  const handlePay = async () => {
    try {
      const payload =
        selectedMethod === "card"
          ? cardData
          : selectedMethod === "upi"
          ? { upiId }
          : undefined;

      const result = await processPayment({
        amount,
        method: selectedMethod,
        payload,
        bookingId: (summary.draft as any)?.id,
      });

      setTransactionResult(result);
    } catch {
      setTransactionResult({
        status: "FAILED",
        transactionId: `TXN-${Date.now().toString().slice(-8)}`,
        bookingId: `WSH-BK-${Date.now().toString().slice(-6)}`,
        amount,
        paymentMethod: selectedMethod,
        timestamp: new Date().toISOString(),
        errorMessage: "Network timeout or bank gateway unreachable. Please try again.",
      });
    }
  };

  const handleCardChange = (field: keyof CardFormData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-20">
      {/* Top Header matching Stitch anything_clean_payment_method_selection */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/checkout"
            className="w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
              Payment Method
            </h1>
            <p className="text-xs text-on-surface-variant">
              Select your preferred encrypted payment method to complete booking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full font-semibold">
          <Lock className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Secure Gateway</span>
        </div>
      </div>

      {/* Main 12-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Payment Methods (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-3">
            {methods.map((method) => (
              <PaymentMethodRadioCard
                key={method.id}
                option={method}
                selected={selectedMethod === method.id}
                onSelect={(id) => setSelectedMethod(id)}
              />
            ))}
          </div>

          {/* Conditional Forms */}
          {selectedMethod === "upi" && (
            <PaymentUpiForm upiId={upiId} onUpiIdChange={setUpiId} />
          )}

          {selectedMethod === "card" && (
            <PaymentCardForm cardData={cardData} onChange={handleCardChange} />
          )}
        </div>

        {/* Right Column: Sticky Amount & Summary (4 cols) */}
        <div className="lg:col-span-4">
          <PaymentSummaryCard
            amount={amount}
            serviceName={serviceName}
            subtotal={subtotal}
            taxes={taxes}
            isProcessing={isProcessing}
            onPay={handlePay}
          />
        </div>
      </div>

      {/* Modals */}
      {transactionResult?.status === "SUCCESS" && (
        <PaymentSuccessModal
          result={transactionResult}
          draft={summary.draft}
        />
      )}

      {transactionResult?.status === "FAILED" && (
        <PaymentFailedModal
          result={transactionResult}
          onRetry={handlePay}
          onSwitchMethod={() => setTransactionResult(null)}
        />
      )}
    </div>
  );
}
