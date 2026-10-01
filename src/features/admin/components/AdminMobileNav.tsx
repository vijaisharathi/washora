"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Bike,
  Activity,
  Terminal,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Layers,
  X,
  User,
  Building2,
  CreditCard,
  Star,
  Bell,
  MessageSquare,
  Scale,
  BarChart3,
} from "lucide-react";
import { useAdminSession } from "../hooks/useAdminSession";

interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMobileNav({ isOpen, onClose }: AdminMobileNavProps) {
  const pathname = usePathname();
  const { user, role, logout } = useAdminSession();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-[280px] max-w-[85vw] bg-surface-container-lowest border-r border-outline-variant/30 h-full flex flex-col p-6 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-on-surface">Lumina Admin</h2>
              <p className="text-[10px] text-on-surface-variant">Mobile Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 mb-4">
          <p className="text-xs font-semibold text-on-surface">{user?.name}</p>
          <p className="text-[10px] text-on-surface-variant font-mono">{user?.email}</p>
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold">
            {role === "OPERATIONS_MANAGER" ? "Operations Manager" : "Super Administrator"}
          </span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 mb-1">
            Navigation
          </p>

          <Link
            href="/admin"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
              pathname === "/admin"
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            href="/admin/bookings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/bookings")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span>Bookings / Orders</span>
          </Link>

          <Link
            href="/admin/services"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/services")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>Services Catalog</span>
          </Link>

          <Link
            href="/admin/customers"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/customers")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Users className="w-4 h-4 text-primary" />
            <span>Customers</span>
          </Link>

          <Link
            href="/admin/providers"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/providers")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Store className="w-4 h-4 text-primary" />
            <span>Providers</span>
          </Link>

          <Link
            href="/admin/delivery-partners"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/delivery-partners")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Bike className="w-4 h-4 text-primary" />
            <span>Delivery Partners</span>
          </Link>

          <Link
            href="/admin/operations"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/operations")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Activity className="w-4 h-4 text-primary" />
            <span>Operations</span>
          </Link>

          <Link
            href="/admin/payments"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/payments")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <CreditCard className="w-4 h-4 text-primary" />
            <span>Payments & Earnings</span>
          </Link>

          <Link
            href="/admin/reviews"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/reviews")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Star className="w-4 h-4 text-primary" />
            <span>Reviews & Moderation</span>
          </Link>

          <Link
            href="/admin/notifications"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/notifications")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Bell className="w-4 h-4 text-primary" />
            <span>Notifications</span>
          </Link>

          <Link
            href="/admin/communications"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/communications")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Communications</span>
          </Link>

          <Link
            href="/admin/support"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/support")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-primary" />
            <span>Support Tickets</span>
          </Link>

          <Link
            href="/admin/disputes"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/disputes")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Scale className="w-4 h-4 text-primary" />
            <span>Disputes</span>
          </Link>

          <Link
            href="/admin/reports"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/reports")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Reports & Analytics</span>
          </Link>

          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 mt-3 mb-1">
            Account & Organization
          </p>

          <Link
            href="/admin/profile"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
              pathname === "/admin/profile"
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <User className="w-4 h-4 text-primary" />
            <span>Admin Profile</span>
          </Link>

          <Link
            href="/admin/organization"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
              pathname === "/admin/organization"
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Building2 className="w-4 h-4 text-primary" />
            <span>Organization Setup</span>
          </Link>

          <Link
            href="/admin/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
              pathname.startsWith("/admin/settings")
                ? "bg-surface-container-high text-on-surface font-semibold border-l-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Settings className="w-4 h-4 text-primary" />
            <span>Settings & Access</span>
          </Link>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-outline-variant/20 mt-auto">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full py-2 px-3 rounded-lg bg-critical/10 text-critical text-xs font-semibold hover:bg-critical/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
