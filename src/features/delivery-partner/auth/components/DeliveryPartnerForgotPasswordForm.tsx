"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowRight, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";

export function DeliveryPartnerForgotPasswordForm() {
  const { forgotPassword, isForgotPasswordPending } = useDeliveryPartnerSession();
  const [identifier, setIdentifier] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg("Please enter your registered email or phone number.");
      return;
    }

    try {
      const res = await forgotPassword(identifier);
      setSuccessMsg(res.message);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to dispatch reset request. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-surface-container border border-primary/30 shadow-md mb-2">
          <KeyRound className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Reset Valet Password</h1>
        <p className="text-xs text-on-surface-variant">
          Receive a secure password reset link to recover access to your portal
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container/80 border border-outline-variant/30 backdrop-blur-xl shadow-2xl">
        {successMsg ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-on-surface">Reset Instructions Dispatched</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">{successMsg}</p>
            </div>
            <div className="pt-2">
              <Link
                href="/delivery-partner/auth/reset-password?token=demo-token"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
              >
                <span>Continue to Set New Password</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">Registered Email or Phone</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="valet@washora.example.com or +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  disabled={isForgotPasswordPending}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isForgotPasswordPending}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-wide shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isForgotPasswordPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center">
          <Link
            href="/delivery-partner/auth/login"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Return to Valet Login
          </Link>
        </div>
      </div>
    </div>
  );
}
