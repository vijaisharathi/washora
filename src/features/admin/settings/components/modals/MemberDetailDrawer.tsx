"use client";

import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Ban,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import { OrganizationMember } from "@/types/admin";
import { useAdminRolePermissions } from "@/features/admin/hooks/useAdminSettings";

interface MemberDetailDrawerProps {
  isOpen: boolean;
  member: OrganizationMember | null;
  onClose: () => void;
  onEdit: (member: OrganizationMember) => void;
  onChangeStatus: (member: OrganizationMember) => void;
  canManageMembers?: boolean;
}

export function MemberDetailDrawer({
  isOpen,
  member,
  onClose,
  onEdit,
  onChangeStatus,
  canManageMembers = true,
}: MemberDetailDrawerProps) {
  const { roleSets } = useAdminRolePermissions();

  if (!isOpen || !member) return null;

  const roleInfo = (roleSets as any)[member.role] || roleSets.Administrator;
  const permissionsList: string[] = roleInfo?.permissions || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md bg-surface-container-lowest border-l border-outline-variant/30 h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm">
              {member.fullName[0]}
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface truncate">
                {member.fullName}
              </h3>
              <p className="text-xs font-mono text-primary font-semibold">
                {member.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity & Status */}
        <div className="space-y-4 flex-1">
          {/* Status Badge Card */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Account Status</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                member.status === "Active"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : member.status === "Pending"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : member.status === "Inactive"
                  ? "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              {member.status === "Active" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {member.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
              {member.status === "Inactive" && <PauseCircle className="w-3.5 h-3.5" />}
              {member.status === "Suspended" && <Ban className="w-3.5 h-3.5" />}
              <span>{member.status}</span>
            </span>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Contact & Persona
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-on-surface">
                <Mail className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span className="font-medium truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <Phone className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span className="font-mono">{member.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <Shield className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span className="font-semibold text-primary">{member.role}</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <Briefcase className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span>{member.primaryWorkArea}</span>
              </div>
            </div>
          </div>

          {/* Activity Timestamps */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Activity History
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined Date:</span>
                </span>
                <span className="font-mono text-on-surface">
                  {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Active:</span>
                </span>
                <span className="font-mono text-on-surface">
                  {member.lastActiveAt
                    ? new Date(member.lastActiveAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never logged in"}
                </span>
              </div>
            </div>
          </div>

          {/* Role & Permissions Summary */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Assigned Permissions
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                {permissionsList.length} Active Grants
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {roleInfo?.description}
            </p>

            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {permissionsList.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-2 text-[11px] text-on-surface p-1.5 rounded-lg bg-surface-container/60"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {canManageMembers && (
          <div className="pt-4 mt-6 border-t border-outline-variant/20 flex gap-2.5">
            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Info</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onChangeStatus(member);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
