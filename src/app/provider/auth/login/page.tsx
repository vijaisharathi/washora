"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { providerLoginSchema, ProviderLoginFormData } from "@/features/provider/auth/schemas/providerAuthSchemas";
import { useProviderAuth } from "@/features/provider/hooks/useProviderAuth";
import { ProviderAuthLayout } from "@/features/provider/auth/components/ProviderAuthLayout";

export default function ProviderLoginPage() {
  const { login, isLoggingIn } = useProviderAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderLoginFormData>({
    resolver: zodResolver(providerLoginSchema),
    defaultValues: {
      identifier: "partner@luxecare.example.com",
      password: "Password123!",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: ProviderLoginFormData) => {
    try {
      setAuthError(null);
      await login(data);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please verify your partner credentials.");
    }
  };

  return (
    <ProviderAuthLayout
      heroQuote='"Precision care operations, simplified order workflows, and reliable payouts."'
      heroSubquote="Sign in to manage your studio processing queue, turnaround schedules, and earnings."
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Partner Sign In</h1>
        <p className="text-sm text-on-surface-variant">
          Access your studio dashboard and operations workspace.
        </p>
      </div>

      {authError && (
        <div className="mb-5 p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Identifier Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="identifier">
            Registered Email or Phone
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

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-semibold text-on-surface-variant" htmlFor="password">
              Password
            </label>
            <Link
              href="/provider/auth/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              lock
            </span>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
          </div>
          {errors.password && (
            <span className="text-xs text-error ml-1">{errors.password.message}</span>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="rememberMe"
            type="checkbox"
            {...register("rememberMe")}
            className="w-4 h-4 rounded border-outline-variant/40 bg-surface-container text-primary focus:ring-primary"
          />
          <label htmlFor="rememberMe" className="text-xs text-on-surface-variant select-none cursor-pointer">
            Keep me signed in on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full mt-2 py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-container/20 disabled:opacity-50"
        >
          {isLoggingIn ? (
            <>
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <span>Sign In to Studio</span>
          )}
        </button>
      </form>

      {/* Registration Redirect Footer */}
      <div className="mt-6 pt-5 border-t border-white/5 text-center">
        <p className="text-xs text-on-surface-variant">
          New laundry or garment care business?{" "}
          <Link href="/provider/auth/register" className="text-primary hover:underline font-semibold ml-1">
            Apply to Partner
          </Link>
        </p>
      </div>
    </ProviderAuthLayout>
  );
}
