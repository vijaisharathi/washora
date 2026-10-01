"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { providerRegisterSchema, ProviderRegisterFormData } from "@/features/provider/auth/schemas/providerAuthSchemas";
import { useProviderAuth } from "@/features/provider/hooks/useProviderAuth";
import { ProviderAuthLayout } from "@/features/provider/auth/components/ProviderAuthLayout";

export default function ProviderRegisterPage() {
  const { register: registerProvider, isRegistering } = useProviderAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderRegisterFormData>({
    resolver: zodResolver(providerRegisterSchema),
    defaultValues: {
      category: "laundry",
      businessName: "LuxeCare Garment Studio",
      ownerName: "Rajesh Kannan",
      email: "partner@luxecare.example.com",
      phone: "+91 98401 23456",
      password: "Password123!",
      confirmPassword: "Password123!",
      acceptTerms: true,
    },
  });

  const onSubmit = async (data: ProviderRegisterFormData) => {
    try {
      setFormError(null);
      await registerProvider(data);
    } catch (err: any) {
      setFormError(err.message || "Failed to register partner account. Please try again.");
    }
  };

  return (
    <ProviderAuthLayout
      heroQuote='"Grow your garment care studio with qualified doorstep valet demand."'
      heroSubquote="Join our verified partner network to receive automated bulk processing jobs and instant settlements."
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Partner Registration</h1>
        <p className="text-sm text-on-surface-variant">
          Expand your cleaning business with WASHORA.
        </p>
      </div>

      {formError && (
        <div className="mb-5 p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Business Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="category">
            Primary Service Category
          </label>
          <div className="relative">
            <select
              id="category"
              {...register("category")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-4 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container appearance-none cursor-pointer"
            >
              <option value="laundry">Dry Cleaning & Couture Laundry</option>
              <option value="shoes">Sneaker & Leather Footwear Spa</option>
              <option value="bags">Designer Bags & Luggage Care</option>
              <option value="helmets">Helmet Sanitization & Visor Care</option>
              <option value="cars">Vehicle Detailing & Steam Wash</option>
            </select>
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>
          {errors.category && (
            <span className="text-xs text-error ml-1">{errors.category.message}</span>
          )}
        </div>

        {/* Business Name & Owner Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="businessName">
              Studio / Business Name
            </label>
            <input
              id="businessName"
              type="text"
              placeholder="e.g. Apex Care Lab"
              {...register("businessName")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
            {errors.businessName && (
              <span className="text-xs text-error ml-1">{errors.businessName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="ownerName">
              Owner / Manager Name
            </label>
            <input
              id="ownerName"
              type="text"
              placeholder="Full Name"
              {...register("ownerName")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
            {errors.ownerName && (
              <span className="text-xs text-error ml-1">{errors.ownerName.message}</span>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="email">
              Business Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="studio@example.com"
              {...register("email")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
            {errors.email && (
              <span className="text-xs text-error ml-1">{errors.email.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="phone">
              Mobile Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98401 23456"
              {...register("phone")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
            {errors.phone && (
              <span className="text-xs text-error ml-1">{errors.phone.message}</span>
            )}
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
            {errors.password && (
              <span className="text-xs text-error ml-1">{errors.password.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors hover:bg-surface-container placeholder:text-on-surface-variant/40"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-error ml-1">{errors.confirmPassword.message}</span>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="acceptTerms"
            type="checkbox"
            {...register("acceptTerms")}
            className="w-4 h-4 mt-0.5 rounded border-outline-variant/40 bg-surface-container text-primary focus:ring-primary"
          />
          <label htmlFor="acceptTerms" className="text-xs text-on-surface-variant leading-relaxed select-none cursor-pointer">
            I agree to the{" "}
            <span className="text-primary hover:underline font-medium">Partner Marketplace Agreement</span>,{" "}
            <span className="text-primary hover:underline font-medium">SLA Guidelines</span>, and{" "}
            <span className="text-primary hover:underline font-medium">Privacy Policy</span>.
          </label>
        </div>
        {errors.acceptTerms && (
          <span className="text-xs text-error ml-1 block">{errors.acceptTerms.message}</span>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full mt-2 py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-container/20 disabled:opacity-50"
        >
          {isRegistering ? (
            <>
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
              <span>Creating Partner Profile...</span>
            </>
          ) : (
            <span>Create Partner Account</span>
          )}
        </button>
      </form>

      {/* Login Redirect Footer */}
      <div className="mt-6 pt-5 border-t border-white/5 text-center">
        <p className="text-xs text-on-surface-variant">
          Already a registered partner?{" "}
          <Link href="/provider/auth/login" className="text-primary hover:underline font-semibold ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </ProviderAuthLayout>
  );
}
