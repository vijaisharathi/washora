"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/features/customer/schemas/authSchemas";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export default function CustomerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerCustomer, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const passwordVal = watch("password") || "";
  const hasMinLen = passwordVal.length >= 8;
  const hasLetter = /[A-Za-z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerCustomer(data);
    } catch {
      // Handled via useAuth error state
    }
  };

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Progress Step Indicator matching Stitch */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-on-surface-variant font-medium">
            <span>Step 1 of 2</span>
            <span>Account Details</span>
          </div>
          <div className="flex gap-2">
            <div className="h-1 flex-1 bg-primary rounded-full" />
            <div className="h-1 flex-1 bg-surface-container-highest rounded-full" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm text-on-surface-variant">
            Join WASHORA for bespoke garment care and hassle-free scheduling.
          </p>
        </div>

        {/* Global Error Banner */}
        {registerError && (
          <div className="p-3.5 rounded-lg bg-error-container/30 border border-error/30 flex items-start gap-2.5 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{(registerError as Error).message || "Registration failed. Please try again."}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface" htmlFor="fullName">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              <Input
                id="fullName"
                type="text"
                placeholder="e.g. Arjun Verma"
                className="pl-10"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
            </div>
          </div>

          {/* Email & Phone grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="phone">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="pl-10"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>
            </div>
          </div>

          {/* Passwords grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars"
                  className="pl-10 pr-10"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-white/5 space-y-1.5 text-xs text-on-surface-variant">
            <div className={`flex items-center gap-2 ${hasMinLen ? "text-green-400" : ""}`}>
              {hasMinLen ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasLetter && hasNumber ? "text-green-400" : ""}`}>
              {hasLetter && hasNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              <span>Contains both letters and numbers</span>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-1 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-on-surface-variant">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-background"
                {...register("terms")}
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && <p className="text-xs text-error">{errors.terms.message}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/10 mt-2"
            isLoading={isRegistering}
          >
            <span>Continue to Phone Verification</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-on-surface-variant border-t border-white/5">
          <span>Already have an account? </span>
          <Link href="/customer/auth/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
