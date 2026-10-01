"use client";

import React, { useState } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Check,
  X,
  Info,
} from "lucide-react";
import { SettingsHeader } from "../SettingsHeader";
import { SettingsNavigationTabs } from "../SettingsNavigationTabs";
import { useAdminRolePermissions } from "@/features/admin/hooks/useAdminSettings";
import { CanonicalAdminRole, PermissionDefinition } from "@/types/admin";

export function RolesSettingsView() {
  const { roleSets, permissionDefinitions } = useAdminRolePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = Array.from(
    new Set(permissionDefinitions.map((p) => p.category))
  );

  const filteredPermissions = permissionDefinitions.filter((p) => {
    const matchesSearch =
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const rolesList: { role: CanonicalAdminRole; label: string; badge: string; color: string }[] = [
    {
      role: "Administrator",
      label: "Platform Administrator",
      badge: "Full Access (28 Grants)",
      color: "border-primary text-primary",
    },
    {
      role: "Operations Manager",
      label: "Operations Manager",
      badge: "Operational Scope (25 Grants)",
      color: "border-blue-500 text-blue-500",
    },
    {
      role: "Operations Executive",
      label: "Operations Executive",
      badge: "Execution & Support (16 Grants)",
      color: "border-purple-500 text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Roles & Permission Matrix"
        subtitle="Inspect platform role definitions, privilege scopes, and enterprise authorization matrices."
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Roles & Permissions" },
        ]}
      />

      <SettingsNavigationTabs />

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {rolesList.map((item) => {
          const roleData = roleSets[item.role];
          const count = roleData?.permissions.length || 0;

          return (
            <div
              key={item.role}
              className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                    {count} / 28 Grants
                  </span>
                </div>

                <h3 className="text-sm font-bold text-on-surface">{item.label}</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  {roleData?.description}
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Authorization Scope:</span>
                <span className="font-semibold text-primary">{item.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matrix Controls & Search */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search permissions by capability or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Categories ({permissionDefinitions.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Permission Matrix Table */}
      <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-outline-variant/20 bg-surface-container/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Capability Matrix</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Deterministic frontend authorization matrix across 28 operational capabilities
            </p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant font-semibold">
            Showing {filteredPermissions.length} permissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/60 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="px-5 py-3.5 w-1/3">Permission & Scope</th>
                <th className="px-5 py-3.5 text-center">Administrator</th>
                <th className="px-5 py-3.5 text-center">Operations Manager</th>
                <th className="px-5 py-3.5 text-center">Operations Executive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-xs text-on-surface">
              {filteredPermissions.map((perm) => {
                const isAdminAllowed = (roleSets as any)?.Administrator?.permissions.includes(perm.id);
                const isManagerAllowed = (roleSets as any)?.["Operations Manager"]?.permissions.includes(perm.id);
                const isExecAllowed = (roleSets as any)?.["Operations Executive"]?.permissions.includes(perm.id);

                return (
                  <tr
                    key={perm.id}
                    className="hover:bg-surface-container/60 transition-colors"
                  >
                    {/* Permission Info */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface">{perm.label}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container border border-outline-variant/20 text-on-surface-variant">
                            {perm.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {perm.description}
                        </p>
                      </div>
                    </td>

                    {/* Administrator */}
                    <td className="px-5 py-3.5 text-center">
                      {isAdminAllowed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-full">
                          <X className="w-3.5 h-3.5" />
                          <span>Not Allowed</span>
                        </span>
                      )}
                    </td>

                    {/* Operations Manager */}
                    <td className="px-5 py-3.5 text-center">
                      {isManagerAllowed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-full">
                          <X className="w-3.5 h-3.5" />
                          <span>Not Allowed</span>
                        </span>
                      )}
                    </td>

                    {/* Operations Executive */}
                    <td className="px-5 py-3.5 text-center">
                      {isExecAllowed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-full">
                          <X className="w-3.5 h-3.5" />
                          <span>Not Allowed</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
