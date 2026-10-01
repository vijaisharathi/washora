"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Key, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  ChangePasswordSchema,
  ChangePasswordFormData,
} from "@/types/admin";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePasswordFormData) => Promise<any>;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    setServerError(null);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || "Failed to change password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Change Password</h3>
              <p className="text-[11px] text-on-surface-variant">Update mock admin credentials</p>
            </div>
          </div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-xs text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Current Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password (Admin@123)"
                {...register("currentPassword")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[11px] text-error mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              New Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                {...register("newPassword")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-error mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Confirm New Password <span className="text-error">*</span>
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              {...register("confirmPassword")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-error mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
