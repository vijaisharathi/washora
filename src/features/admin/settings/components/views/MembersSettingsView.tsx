"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PauseCircle,
  Ban,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit2,
  Shield,
  AlertCircle,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminMembers, useAdminPermissions } from "@/features/admin/hooks/useAdminSettings";
import { OrganizationMember, AdminRole, AccountStatus } from "@/types/admin";
import { AddMemberModal } from "../modals/AddMemberModal";
import { EditMemberModal } from "../modals/EditMemberModal";
import { ChangeMemberStatusModal } from "../modals/ChangeMemberStatusModal";
import { MemberDetailDrawer } from "../modals/MemberDetailDrawer";
import { SettingsTableSkeleton } from "../skeletons/SettingsSkeleton";

export function MembersSettingsView() {
  const {
    members,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    successMessage,
    params,
    setSearch,
    setRoleFilter,
    setWorkAreaFilter,
    setStatusFilter,
    setSorting,
    setPage,
    setLimit,
    addMember,
    editMember,
    changeMemberStatus,
    refresh,
  } = useAdminMembers();

  const { hasPermission } = useAdminPermissions();
  const canManageMembers = hasPermission("Manage Members");

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [statusMember, setStatusMember] = useState<OrganizationMember | null>(null);
  const [viewingMember, setViewingMember] = useState<OrganizationMember | null>(null);

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400">
            <PauseCircle className="w-3 h-3" />
            <span>Inactive</span>
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <Ban className="w-3 h-3" />
            <span>Suspended</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Organization Staff Roster"
        subtitle="Manage administrative staff accounts, assign operations roles, and monitor active sessions."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Staff Members" },
        ]}
        actions={
          canManageMembers ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          ) : undefined
        }
      />

      <SettingsNavigationTabs />

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-xs text-error animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by ID, name, email, or phone..."
            value={params.search || ""}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={params.role || "ALL"}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Operations Manager">Operations Manager</option>
            <option value="Operations Executive">Operations Executive</option>
          </select>

          {/* Work Area Filter */}
          <select
            value={params.workArea || "ALL"}
            onChange={(e) => setWorkAreaFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Work Areas</option>
            <option value="Customer Operations">Customer Operations</option>
            <option value="Provider Operations">Provider Operations</option>
            <option value="Delivery Operations">Delivery Operations</option>
            <option value="Platform Operations">Platform Operations</option>
          </select>

          {/* Status Filter */}
          <select
            value={params.status || "ALL"}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <SettingsTableSkeleton />
      ) : members.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mx-auto text-on-surface-variant">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-on-surface">No Members Found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            No organization personnel matched your search query or filter criteria.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-3.5">Member ID</th>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:text-on-surface"
                    onClick={() => setSorting("name")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Staff Member</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:text-on-surface"
                    onClick={() => setSorting("role")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Role</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5">Work Area</th>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:text-on-surface"
                    onClick={() => setSorting("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:text-on-surface"
                    onClick={() => setSorting("joinedAt")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Joined Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-5 py-3.5 cursor-pointer hover:text-on-surface"
                    onClick={() => setSorting("lastActiveAt")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Last Active</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-xs text-on-surface">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-surface-container/60 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">
                      {member.id}
                    </td>

                    {/* Member Name & Email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                          {member.fullName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate">
                            {member.fullName}
                          </p>
                          <p className="text-[11px] text-on-surface-variant font-mono truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-[11px]">
                        {member.role}
                      </span>
                    </td>

                    {/* Work Area */}
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      {member.primaryWorkArea}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">{getStatusBadge(member.status)}</td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 font-mono text-[11px] text-on-surface-variant">
                      {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Last Active */}
                    <td className="px-5 py-3.5 font-mono text-[11px] text-on-surface-variant">
                      {member.lastActiveAt
                        ? new Date(member.lastActiveAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingMember(member)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManageMembers && (
                          <>
                            <button
                              onClick={() => setEditingMember(member)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStatusMember(member)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-amber-500 hover:bg-surface-container transition-colors"
                              title="Change Status"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-semibold focus:outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>of {total} members</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Previous
              </button>
              <span className="font-mono px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawer */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addMember}
      />

      <EditMemberModal
        isOpen={Boolean(editingMember)}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={editMember}
      />

      <ChangeMemberStatusModal
        isOpen={Boolean(statusMember)}
        member={statusMember}
        onClose={() => setStatusMember(null)}
        onConfirm={changeMemberStatus}
      />

      <MemberDetailDrawer
        isOpen={Boolean(viewingMember)}
        member={viewingMember}
        onClose={() => setViewingMember(null)}
        onEdit={(m) => setEditingMember(m)}
        onChangeStatus={(m) => setStatusMember(m)}
        canManageMembers={canManageMembers}
      />
    </div>
  );
}
