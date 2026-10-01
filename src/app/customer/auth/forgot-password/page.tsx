"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/features/customer/schemas/authSchemas";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CustomerForgotPasswordPage() {
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const { forgotPassword, isSubmittingForgot } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await forgotPassword(data.identifier);
      setSubmittedMessage(res.message);
    } catch {
      // ignore
    }
  };

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header Graphic */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-white/10 text-primary shadow-inner">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            Enter your registered email address or mobile number to receive password recovery instructions.
          </p>
        </div>

        {submittedMessage ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto" />
              <p className="text-xs font-medium leading-relaxed">{submittedMessage}</p>
            </div>
            <Link href="/customer/auth/reset-password" className="block">
              <Button size="lg" className="w-full gap-2">
                <span>Enter New Password</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="identifier">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="e.g. name@example.com or 9876543210"
                  className="pl-10"
                  error={errors.identifier?.message}
                  {...register("identifier")}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/10 mt-2"
              isLoading={isSubmittingForgot}
            >
              <span>Send Instructions</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Back to Sign In */}
        <div className="text-center pt-2 border-t border-white/5">
          <Link
            href="/customer/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
