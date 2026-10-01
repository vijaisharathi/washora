"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/features/customer/schemas/authSchemas";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function CustomerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "arjun.verma@example.com",
      password: "Password@123",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // Handled via useAuth error state
    }
  };

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Form Header */}
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Sign In to WASHORA
          </h1>
          <p className="text-sm text-on-surface-variant">
            Enter your credentials to access your bookings and care preferences.
          </p>
        </div>

        {/* Global Error Banner */}
        {loginError && (
          <div className="p-3.5 rounded-lg bg-error-container/30 border border-error/30 flex items-start gap-2.5 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{(loginError as Error).message || "Authentication failed. Please verify your credentials."}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface" htmlFor="identifier">
              Mobile Number or Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              <Input
                id="identifier"
                type="text"
                placeholder="e.g. +91 9876543210 or name@example.com"
                className="pl-10"
                error={errors.identifier?.message}
                {...register("identifier")}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="password">
                Password
              </label>
              <Link
                href="/customer/auth/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-background"
                {...register("rememberMe")}
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/10 mt-2"
            isLoading={isLoggingIn}
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-white/5" />
          <span className="bg-surface-container px-3 text-[11px] uppercase tracking-wider text-on-surface-variant/60 font-medium">
            or continue with
          </span>
          <div className="w-full border-t border-white/5" />
        </div>

        {/* Phone OTP Fast Login Link */}
        <Link href="/customer/auth/verify-phone" className="block w-full">
          <Button variant="outline" className="w-full gap-2 border-white/10 hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-base text-primary">sms</span>
            <span>Sign in via One-Time SMS OTP</span>
          </Button>
        </Link>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-on-surface-variant">
          <span>Don&apos;t have an account? </span>
          <Link href="/customer/auth/register" className="font-semibold text-primary hover:underline">
            Create Account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
