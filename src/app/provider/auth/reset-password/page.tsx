"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  providerResetPasswordSchema,
  ProviderResetPasswordFormData,
} from "@/features/provider/auth/schemas/providerAuthSchemas";
import { useProviderAuth } from "@/features/provider/hooks/useProviderAuth";
import { ProviderAuthLayout } from "@/features/provider/auth/components/ProviderAuthLayout";

export default function ProviderResetPasswordPage() {
  const { resetPassword, isResettingPassword } = useProviderAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderResetPasswordFormData>({
    resolver: zodResolver(providerResetPasswordSchema),
    defaultValues: {
      password: "NewSecurePassword123!",
      confirmPassword: "NewSecurePassword123!",
    },
  });

  const onSubmit = async (data: ProviderResetPasswordFormData) => {
    try {
      setErrorMessage(null);
      await resetPassword(data.password);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <ProviderAuthLayout
      heroQuote='"Create a robust password to safeguard partner operations."'
      heroSubquote="Set your new credentials to resume managing your workshop orders and earnings."
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Set New Password</h1>
        <p className="text-sm text-on-surface-variant">
          Enter a strong password with at least 8 characters.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-4 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
          />
          {errors.password && (
            <span className="text-xs text-error ml-1">{errors.password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-4 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
          />
          {errors.confirmPassword && (
            <span className="text-xs text-error ml-1">{errors.confirmPassword.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isResettingPassword}
          className="w-full mt-2 py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-container/20 disabled:opacity-50"
        >
          {isResettingPassword ? (
            <>
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Save New Password & Sign In</span>
          )}
        </button>

        <div className="pt-3 text-center">
          <Link href="/provider/auth/login" className="text-xs text-primary hover:underline font-semibold">
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </ProviderAuthLayout>
  );
}
