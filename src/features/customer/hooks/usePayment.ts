"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { paymentService } from "@/services/paymentService";
import {
  PaymentMethodId,
  CardFormData,
  UpiFormData,
} from "@/types/customer/payment";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const PAYMENT_METHODS_KEY = queryKeys.customer.paymentMethods();

export function usePayment() {
  const methodsQuery = useQuery({
    queryKey: PAYMENT_METHODS_KEY,
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 1000 * 60 * 10,
  });

  const processMutation = useMutation({
    mutationFn: (params: {
      amount: number;
      method: PaymentMethodId;
      payload?: CardFormData | UpiFormData;
      shouldFail?: boolean;
      bookingId?: string;
    }) => paymentService.processPayment(params),
    onError: (err) => {
      showError(err, "Payment Processing Failed");
    },
  });

  return {
    methods: methodsQuery.data || [],
    isLoadingMethods: methodsQuery.isLoading,
    processPayment: processMutation.mutateAsync,
    isProcessing: processMutation.isPending,
    paymentResult: processMutation.data,
    paymentError: processMutation.error,
  };
}
