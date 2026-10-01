"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bike, ShieldCheck, ArrowRight, KeyRound, AlertCircle, RefreshCw } from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";

export function DeliveryPartnerVerifyPhoneForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "+91 98765 43210";

  const { verifyPhone, isVerifyingPhone } = useDeliveryPartnerSession();
  const [otp, setOtp] = useState("123456");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    try {
      await verifyPhone({ phone, otp });
      router.push("/delivery-partner/onboarding");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to verify code. Use 123456 for demo.");
      }
    }
  };

  const handleResend = () => {
    setResendStatus(true);
    setTimeout(() => setResendStatus(false), 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-surface-container border border-primary/30 shadow-md mb-2">
          <KeyRound className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Verify Mobile Number</h1>
        <p className="text-xs text-on-surface-variant">
          Enter the 6-digit security code sent to <span className="text-on-surface font-semibold font-mono">{phone}</span>
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container/80 border border-outline-variant/30 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface-variant">6-Digit OTP</label>
              <span className="text-[10px] text-primary/80 font-mono">Demo Code: 123456</span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full py-3 text-center text-xl font-bold tracking-widest rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
              disabled={isVerifyingPhone}
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${resendStatus ? "animate-spin" : ""}`} />
              {resendStatus ? "Sent new code!" : "Resend OTP"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isVerifyingPhone}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-wide shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-3"
          >
            {isVerifyingPhone ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Start Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center">
          <Link
            href="/delivery-partner/auth/login"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Back to Partner Login
          </Link>
        </div>
      </div>
    </div>
  );
}
