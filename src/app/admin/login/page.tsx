"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { login, isLoggingIn } = useAdminSession();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "Admin@123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      setAuthError(message);
    }
  };

  const handleSelectMock = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-body-md">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 items-center justify-center text-primary shadow-lg shadow-primary/10 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
            Lumina Admin Console
          </h1>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Authorized personnel only. Access to WASHORA platform governance & operations dispatch.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl space-y-6">
          {/* Quick Mock User Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
              Test Identity Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectMock("admin@example.com", "Admin@123")}
                className="p-2.5 rounded-xl text-left border bg-surface-container border-outline-variant/30 hover:border-primary/50 transition-all text-xs"
              >
                <div className="font-bold text-on-surface flex items-center justify-between">
                  <span>admin-001</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-success/15 text-success">Setup Done</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">admin@example.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMock("ops@example.com", "Admin@123")}
                className="p-2.5 rounded-xl text-left border bg-surface-container border-outline-variant/30 hover:border-primary/50 transition-all text-xs"
              >
                <div className="font-bold text-on-surface flex items-center justify-between">
                  <span>admin-002</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-warning/15 text-warning">New Setup</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">ops@example.com</p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {authError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-on-surface">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`w-full bg-surface-container border ${
                    errors.email ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                  placeholder="admin@example.com"
                  disabled={isLoggingIn}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-on-surface">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full bg-surface-container border ${
                    errors.password ? "border-critical" : "border-outline-variant/40"
                  } rounded-xl pl-9 pr-10 py-2.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono`}
                  placeholder="••••••••••••"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-critical mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="pt-4 border-t border-outline-variant/20 text-center">
            <p className="text-[11px] text-on-surface-variant">
              Demo Environment: Enter <span className="font-mono text-primary">admin@example.com</span> / <span className="font-mono text-primary">Admin@123</span>
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] text-on-surface-variant/70 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>WASHORA Security Boundary • End-to-end Audited Access</span>
        </div>
      </div>
    </div>
  );
}
