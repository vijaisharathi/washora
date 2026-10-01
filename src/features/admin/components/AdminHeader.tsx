"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  ShieldAlert,
  UserCheck,
  Menu,
  X,
  Sparkles,
  User,
  Building2,
} from "lucide-react";
import { useAdminSession } from "../hooks/useAdminSession";
import { useAdminNotifications } from "../hooks/useAdminNotifications";
import { AdminRole } from "@/types/admin";

interface AdminHeaderProps {
  title?: string;
  onToggleMobileNav?: () => void;
  mobileNavOpen?: boolean;
}

export function AdminHeader({
  title = "Lumina Control Center",
  onToggleMobileNav,
  mobileNavOpen = false,
}: AdminHeaderProps) {
  const { user, role, switchRole, logout } = useAdminSession();
  const { unreadCount } = useAdminNotifications();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleRoleChange = async (newRole: AdminRole) => {
    await switchRole(newRole);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-16 bg-surface-container/95 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-4 md:px-6 z-30 ml-0 md:ml-[260px]">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
          <input
            type="text"
            placeholder="Search orders, customers, providers or press Cmd + K..."
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg pl-9 pr-4 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            readOnly
            onClick={() => alert("Global Search modal will activate in Phase A1.")}
          />
        </div>
      </div>

      {/* Right: Role Indicator, Quick Actions & Profile Dropdown */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>{title}</span>
        </div>

        <Link
          href="/admin/notifications"
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center absolute -top-0.5 -right-0.5 shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => alert("Platform Settings will be available in Phase A15.")}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors hidden sm:block"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar & Menu Toggle */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-surface-container-high border border-transparent hover:border-outline-variant/30 transition-colors"
            aria-expanded={profileDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
              {user?.name ? user.name[0] : "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[120px]">
                {user?.name || "Admin User"}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                {role === "operations" || role === "OPERATIONS_MANAGER"
                  ? "Operations"
                  : "Administrator"}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-surface-container-high border border-outline-variant/40 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
                <p className="text-xs font-bold text-on-surface truncate">{user?.name}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{user?.email}</p>
                <p className="text-[10px] text-primary mt-1 font-mono">{user?.department}</p>
              </div>

              {/* Navigation Links */}
              <div className="px-1 py-1 border-b border-outline-variant/20 mb-1 flex flex-col gap-0.5">
                <Link
                  href="/admin/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-on-surface hover:bg-surface-container transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Admin Profile</span>
                </Link>
                <Link
                  href="/admin/organization"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Organization Setup</span>
                </Link>
              </div>

              {/* Role Switcher Section for A0 Verification */}
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 mb-1.5">
                  Simulate Role Access
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleRoleChange("SUPER_ADMIN")}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      role === "SUPER_ADMIN"
                        ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                        : "text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Super Admin
                    </span>
                    {role === "SUPER_ADMIN" && <span className="text-[10px]">Active</span>}
                  </button>

                  <button
                    onClick={() => handleRoleChange("OPERATIONS_MANAGER")}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      role === "OPERATIONS_MANAGER"
                        ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                        : "text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      Operations Manager
                    </span>
                    {role === "OPERATIONS_MANAGER" && <span className="text-[10px]">Active</span>}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-outline-variant/20 mt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-critical hover:bg-critical/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out of Console
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
