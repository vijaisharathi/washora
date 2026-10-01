"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OtpInput } from "@/components/ui/otp-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyPhoneContent() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "+91 98765 43210";

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(45);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { verifyOtp, isVerifyingOtp, verifyOtpError, resendOtp, isResendingOtp } = useAuth();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    try {
      await verifyOtp({ phone: phoneParam, otp });
    } catch {
      // Handled via useAuth error
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOtp(phoneParam);
      setTimer(45);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      // ignore
    }
  };

  const formattedTimer = `00:${timer < 10 ? `0${timer}` : timer}`;

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Graphic Header matching Stitch */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-white/10 text-primary shadow-inner">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Verify Your Phone Number
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-primary inline-block mt-1">{phoneParam}</span>
          </p>
        </div>

        {/* Global Error Banner */}
        {verifyOtpError && (
          <div className="p-3.5 rounded-lg bg-error-container/30 border border-error/30 flex items-start gap-2.5 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{(verifyOtpError as Error).message || "Invalid OTP code. Please try again."}</span>
          </div>
        )}

        {/* Resend Success Banner */}
        {resendSuccess && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-xs text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>New code sent! (Demo OTP: 123456)</span>
          </div>
        )}

        {/* 6-Digit OTP Input */}
        <div className="py-2">
          <OtpInput
            length={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerifyingOtp}
          />
        </div>

        {/* Helper Links / Resend Timer */}
        <div className="flex flex-col items-center gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span>Didn&apos;t receive code?</span>
            {timer > 0 ? (
              <span className="text-on-surface font-medium">Resend in {formattedTimer}</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendingOtp}
                className="text-primary font-semibold hover:underline"
              >
                {isResendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <Link
            href="/customer/auth/register"
            className="text-tertiary hover:text-on-surface transition-colors underline underline-offset-4 decoration-white/20"
          >
            Change phone number
          </Link>
        </div>

        {/* Verify Action Button */}
        <Button
          type="button"
          size="lg"
          className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/10 mt-2"
          disabled={otp.length !== 6 || isVerifyingOtp}
          isLoading={isVerifyingOtp}
          onClick={handleVerify}
        >
          <span>Verify &amp; Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CustomerVerifyPhonePage() {
  return (
    <Suspense
      fallback={
        <Card className="border border-white/10 bg-surface-container/90 p-8 space-y-4">
          <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-16 w-full" />
        </Card>
      }
    >
      <VerifyPhoneContent />
    </Suspense>
  );
}
