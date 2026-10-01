"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { providerOtpSchema, ProviderOtpFormData } from "@/features/provider/auth/schemas/providerAuthSchemas";
import { useProviderAuth } from "@/features/provider/hooks/useProviderAuth";
import { ProviderAuthLayout } from "@/features/provider/auth/components/ProviderAuthLayout";

function ProviderVerifyPhoneContent() {
  const searchParams = useSearchParams();
  const phone = searchParams?.get("phone") || "+91 98401 23456";
  const { verifyOtp, isVerifyingOtp } = useProviderAuth();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderOtpFormData>({
    resolver: zodResolver(providerOtpSchema),
    defaultValues: { otp: "123456" },
  });

  const onSubmit = async (data: ProviderOtpFormData) => {
    try {
      setVerifyError(null);
      await verifyOtp({ phone, otp: data.otp });
    } catch (err: any) {
      setVerifyError(err.message || "Invalid verification code. Please try 123456.");
    }
  };

  return (
    <ProviderAuthLayout
      heroQuote='"Secure verification protects partner studios and customer garments."'
      heroSubquote="Confirm your phone number to proceed to business identity and license verification."
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Verify Mobile Number</h1>
        <p className="text-sm text-on-surface-variant">
          We sent a 6-digit verification code to{" "}
          <span className="text-on-surface font-semibold">{phone}</span>
        </p>
      </div>

      {verifyError && (
        <div className="mb-5 p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{verifyError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* OTP Input Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="otp">
            Enter 6-Digit Code
          </label>
          <input
            id="otp"
            type="text"
            maxLength={6}
            placeholder="123456"
            {...register("otp")}
            className="w-full bg-surface-container-low text-on-surface text-center tracking-[0.5em] text-2xl font-bold rounded-xl py-3.5 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/30"
          />
          {errors.otp && (
            <span className="text-xs text-error text-center">{errors.otp.message}</span>
          )}
        </div>

        {/* Resend Action */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-on-surface-variant">Didn&apos;t receive the code?</span>
          {resendTimer > 0 ? (
            <span className="text-on-surface-variant font-medium">Resend in {resendTimer}s</span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setResendTimer(30);
                setValue("otp", "123456");
              }}
              className="text-primary hover:underline font-semibold"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isVerifyingOtp}
          className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-container/20 disabled:opacity-50"
        >
          {isVerifyingOtp ? (
            <>
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
              <span>Verifying Phone...</span>
            </>
          ) : (
            <span>Verify & Continue to Onboarding</span>
          )}
        </button>
      </form>
    </ProviderAuthLayout>
  );
}

export default function ProviderVerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-sm text-on-surface-variant">Loading verification...</div>}>
      <ProviderVerifyPhoneContent />
    </Suspense>
  );
}
