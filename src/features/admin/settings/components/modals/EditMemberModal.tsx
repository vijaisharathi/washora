"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserCheck, AlertCircle } from "lucide-react";
import {
  OrganizationMember,
  EditMemberSchema,
  EditMemberFormData,
} from "@/types/admin";

interface EditMemberModalProps {
  isOpen: boolean;
  member: OrganizationMember | null;
  onClose: () => void;
  onSubmit: (memberId: string, data: EditMemberFormData) => Promise<any>;
}

export function EditMemberModal({
  isOpen,
  member,
  onClose,
  onSubmit,
}: EditMemberModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditMemberFormData>({
    resolver: zodResolver(EditMemberSchema),
  });

  useEffect(() => {
    if (member) {
      reset({
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        primaryWorkArea: member.primaryWorkArea,
        status: member.status,
      });
    }
  }, [member, reset]);

  if (!isOpen || !member) return null;

  const handleFormSubmit = async (data: EditMemberFormData) => {
    setServerError(null);
    try {
      await onSubmit(member.id, data);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || "Failed to update member.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                Edit Member ({member.id})
              </h3>
              <p className="text-[11px] text-on-surface-variant">Update identity and platform assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                {...register("fullName")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              {errors.fullName && (
                <p className="text-[11px] text-error mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Work Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              {errors.email && (
                <p className="text-[11px] text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="text"
                {...register("phone")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              {errors.phone && (
                <p className="text-[11px] text-error mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Role <span className="text-error">*</span>
              </label>
              <select
                {...register("role")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Administrator">Administrator</option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="Operations Executive">Operations Executive</option>
              </select>
            </div>

            {/* Primary Work Area */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Primary Work Area <span className="text-error">*</span>
              </label>
              <select
                {...register("primaryWorkArea")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Customer Operations">Customer Operations</option>
                <option value="Provider Operations">Provider Operations</option>
                <option value="Delivery Operations">Delivery Operations</option>
                <option value="Platform Operations">Platform Operations</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Account Status
              </label>
              <select
                {...register("status")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
