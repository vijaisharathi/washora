"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Server,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  Radio,
  Cpu,
} from "lucide-react";
import { useAdminSession } from "../hooks/useAdminSession";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { AdminSystemStatusSummary } from "@/types/admin";

export function AdminFoundationLandingView() {
  const { user, role, switchRole } = useAdminSession();
  const [systemStatus, setSystemStatus] = useState<AdminSystemStatusSummary | null>(null);

  useEffect(() => {
    adminAuthService.getSystemStatus().then(setSystemStatus);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest font-mono">
              Phase A0 — Architecture Foundation
            </span>
            <span className="text-[10px] font-medium text-on-surface-variant/80 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-success animate-pulse" />
              Gateway Connected
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            WASHORA Admin & Operations Platform
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
            Centralized operations foundation, role boundary enforcement, and scalable service architecture.
          </p>
        </div>

        {/* Persona Pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              {user?.name}
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-container-high text-primary font-mono font-normal">
                {role}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-mono truncate max-w-[200px]">
              {user?.department}
            </p>
          </div>
        </div>
      </div>

      {/* Gateway & Core Foundation Status Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gateway Status</span>
            <Server className="w-4 h-4 text-success" />
          </div>
          <div>
            <span className="text-xl font-bold text-success flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              {systemStatus?.gatewayStatus || "OPERATIONAL"}
            </span>
            <p className="text-[11px] text-on-surface-variant mt-1 font-mono">
              Build {systemStatus?.version || "v2.8.0-admin"}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Assigned Hubs</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold text-on-surface">
              {systemStatus?.activeHubsCount || 6} Major Hubs
            </span>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Bengaluru Urban & Suburban Hubs
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Operators</span>
            <Activity className="w-4 h-4 text-warning" />
          </div>
          <div>
            <span className="text-xl font-bold text-on-surface">
              {systemStatus?.assignedDispatchersCount || 14} Dispatchers
            </span>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Shift Coverage 24/7
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Role Isolation</span>
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold text-primary">STRICT</span>
            <p className="text-[11px] text-on-surface-variant mt-1 font-mono">
              0 Cross-Role Dependencies
            </p>
          </div>
        </div>
      </div>

      {/* Main Architecture & Role Boundary Certification Card */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                A0 Foundation Architecture Verification
              </h2>
              <p className="text-xs text-on-surface-variant">
                Core technical boundaries and domain contracts established for future Admin phases.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-success/15 text-success font-semibold border border-success/30">
            Validated Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-on-surface">Dedicated Namespace `/admin/*`</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Isolated Next.js App Router namespace preventing overlap with `/customer`, `/provider`, and `/delivery-partner`.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-on-surface">AdminRouteGuard & Session Handling</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Authenticates admin sessions and strictly blocks Customer, Provider, and Delivery Partner tokens.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-on-surface">Stitch LuxeCare / Lumina Design Shell</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                260px fixed desktop sidebar, top control center header with search, and mobile slide-over navigation.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-on-surface">Multi-Role Persona Switching</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Supports instant switching between Super Administrator and Operations Manager with scoped permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Role Switch Simulation Bar */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div>
            <p className="text-xs font-bold text-on-surface">Simulate Admin Role Perspective</p>
            <p className="text-[11px] text-on-surface-variant">
              Currently active: <strong className="text-primary font-mono">{role}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchRole("SUPER_ADMIN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === "SUPER_ADMIN"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              Super Admin
            </button>
            <button
              onClick={() => switchRole("OPERATIONS_MANAGER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === "OPERATIONS_MANAGER"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              Operations Manager
            </button>
          </div>
        </div>
      </div>

      {/* Roadmap Blueprint Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-on-surface">Phase A0 Foundation Certified</h4>
            <p className="text-[11px] text-on-surface-variant">
              Next phases will incrementally unlock: A1 Admin Dashboard, A2 Operations Console, A3 Order Management.
            </p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary">
          Foundation Locked <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
