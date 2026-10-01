"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bike, ShieldCheck, ArrowRight, Lock, Phone, AlertCircle } from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";

export function DeliveryPartnerLoginForm() {
  const router = useRouter();
  const { login, isLoggingIn } = useDeliveryPartnerSession();

  const [identifier, setIdentifier] = useState("valet@washora.example.com");
  const [password, setPassword] = useState("Password123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg("Please enter your registered mobile number or valet email.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Please enter a valid password (minimum 6 characters).");
      return;
    }

    try {
      await login({ identifier, password, rememberMe });
      router.push("/delivery-partner");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to sign in. Please verify your credentials.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-surface-container border border-primary/30 shadow-md mb-2">
          <Bike className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Valet Partner Portal</h1>
        <p className="text-xs text-on-surface-variant">
          Sign in with your registered logistics partner credentials
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center justify-between">
              <span>Mobile Number or Valet Email</span>
              <span className="text-[10px] text-primary/80 font-normal">Demo: valet@washora.example.com</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+91 98765 43210 or valet@washora..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={isLoggingIn}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface-variant">Password</label>
              <Link
                href="/delivery-partner/auth/forgot-password"
                className="text-[11px] text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                disabled={isLoggingIn}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface border-outline-variant/40 text-primary focus:ring-primary"
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-wide shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                <span>Authenticating Valet...</span>
              </>
            ) : (
              <>
                <span>Sign In to Valet Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center space-y-2">
          <p className="text-xs text-on-surface-variant">
            New valet logistics partner?{" "}
            <Link
              href="/delivery-partner/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Apply to Join Fleet
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-on-surface-variant/70">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>256-bit Encrypted Logistics Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
