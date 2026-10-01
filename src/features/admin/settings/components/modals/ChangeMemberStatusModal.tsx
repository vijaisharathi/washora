"use client";

import React, { useState } from "react";
import { X, ShieldAlert, AlertCircle } from "lucide-react";
import { OrganizationMember, AccountStatus } from "@/types/admin";

interface ChangeMemberStatusModalProps {
  isOpen: boolean;
  member: OrganizationMember | null;
  onClose: () => void;
  onConfirm: (
    memberId: string,
    newStatus: "Active" | "Inactive" | "Pending" | "Suspended"
  ) => Promise<any>;
}

export function ChangeMemberStatusModal({
  isOpen,
  member,
  onClose,
  onConfirm,
}: ChangeMemberStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus>(
    member?.status || "Active"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await onConfirm(member.id, selectedStatus);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || "Failed to update member status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Update Member Status</h3>
              <p className="text-[11px] text-on-surface-variant">Modify account access level</p>
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

        <div className="mb-5 space-y-3">
          <p className="text-xs text-on-surface-variant">
            Update the access status for{" "}
            <span className="font-semibold text-on-surface">{member.fullName}</span> (
            <span className="font-mono text-primary font-bold">{member.id}</span>):
          </p>

          <div className="space-y-2">
            {(["Active", "Pending", "Inactive", "Suspended"] as AccountStatus[]).map((status) => (
              <label
                key={status}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === status
                    ? "bg-primary/10 border-primary text-on-surface font-semibold"
                    : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    className="text-primary focus:ring-0"
                  />
                  <span>{status}</span>
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  {status === "Active" && "Full administrative permissions enabled"}
                  {status === "Pending" && "Awaiting activation / verification"}
                  {status === "Inactive" && "Temporarily disabled from sign-in"}
                  {status === "Suspended" && "Access blocked due to policy breach"}
                </span>
              </label>
            ))}
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
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>Update Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}
