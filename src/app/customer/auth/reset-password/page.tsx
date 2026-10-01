"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormData } from "@/features/customer/schemas/authSchemas";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export default function CustomerResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, isResettingPassword } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordVal = watch("newPassword") || "";
  const hasMinLen = newPasswordVal.length >= 8;
  const hasLetter = /[A-Za-z]/.test(newPasswordVal);
  const hasNumber = /[0-9]/.test(newPasswordVal);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data.newPassword);
    } catch {
      // ignore
    }
  };

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Set New Password
          </h1>
          <p className="text-sm text-on-surface-variant">
            Create a secure password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pl-10 pr-10"
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="pl-10"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
          </div>

          {/* Password checklist */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-white/5 space-y-1.5 text-xs text-on-surface-variant">
            <div className={`flex items-center gap-2 ${hasMinLen ? "text-green-400" : ""}`}>
              {hasMinLen ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              <span>Minimum 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasLetter && hasNumber ? "text-green-400" : ""}`}>
              {hasLetter && hasNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              <span>Contains both letters and numbers</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/10 mt-2"
            isLoading={isResettingPassword}
          >
            <span>Update Password</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-white/5">
          <Link href="/customer/auth/login" className="text-xs text-primary hover:underline font-medium">
            Cancel &amp; Return to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
