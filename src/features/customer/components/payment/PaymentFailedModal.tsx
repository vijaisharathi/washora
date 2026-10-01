"use client";

import React from "react";
import { PaymentTransactionResult } from "@/types/customer/payment";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentFailedModalProps {
  result: PaymentTransactionResult;
  onRetry: () => void;
  onSwitchMethod: () => void;
}

export function PaymentFailedModal({
  result,
  onRetry,
  onSwitchMethod,
}: PaymentFailedModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-container rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h3 className="text-2xl font-bold text-on-surface font-headline">
            Payment Declined
          </h3>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm">
            {result.errorMessage ||
              "Your payment could not be processed. Please verify your payment details or choose another payment method."}
          </p>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 flex justify-between items-center text-xs">
          <span className="text-on-surface-variant font-medium">Attempted Amount</span>
          <span className="font-bold text-on-surface font-mono">₹{result.amount}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onSwitchMethod}
            className="flex-1 gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Choose Other Method</span>
          </Button>

          <Button onClick={onRetry} className="flex-1 gap-2 text-xs font-semibold">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
