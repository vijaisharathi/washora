"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  providerForgotPasswordSchema,
  ProviderForgotPasswordFormData,
} from "@/features/provider/auth/schemas/providerAuthSchemas";
import { useProviderAuth } from "@/features/provider/hooks/useProviderAuth";
import { ProviderAuthLayout } from "@/features/provider/auth/components/ProviderAuthLayout";

export default function ProviderForgotPasswordPage() {
  const { forgotPassword, isSendingReset, forgotPasswordSuccess } = useProviderAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderForgotPasswordFormData>({
    resolver: zodResolver(providerForgotPasswordSchema),
    defaultValues: { identifier: "partner@luxecare.example.com" },
  });

  const onSubmit = async (data: ProviderForgotPasswordFormData) => {
    try {
      setErrorMessage(null);
      await forgotPassword(data.identifier);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process reset request. Please try again.");
    }
  };

  return (
    <ProviderAuthLayout
      heroQuote='"Account security ensures uninterrupted operational access."'
      heroSubquote="Recover access to your partner studio and processing dashboard."
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Reset Password</h1>
        <p className="text-sm text-on-surface-variant">
          Enter your registered partner email or phone number to receive reset instructions.
        </p>
      </div>

      {forgotPasswordSuccess ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm">
            <p className="font-semibold mb-1">Reset Instructions Dispatched</p>
            <p className="text-xs text-on-surface-variant">
              We have sent a secure password reset link to your registered contact channel.
            </p>
          </div>
          <Link
            href="/provider/auth/reset-password"
            className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 block text-center"
          >
            Proceed to Set New Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="identifier">
              Registered Partner Identifier
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                mail
              </span>
              <input
                id="identifier"
                type="text"
                placeholder="partner@luxecare.example.com"
                {...register("identifier")}
                className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
              />
            </div>
            {errors.identifier && (
              <span className="text-xs text-error ml-1">{errors.identifier.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSendingReset}
            className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-container/20 disabled:opacity-50"
          >
            {isSendingReset ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                <span>Sending Instructions...</span>
              </>
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </button>

          <div className="pt-3 text-center">
            <Link href="/provider/auth/login" className="text-xs text-primary hover:underline font-semibold">
              ← Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </ProviderAuthLayout>
  );
}
