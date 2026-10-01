"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Edit,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ArrowLeft,
  AlertCircle,
  Activity,
  Star,
  Shield,
  Layers,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import {
  Provider,
  ProviderActivity,
  ProviderApprovalStatus,
  ProviderStatus,
  UpdateProviderApprovalPayload,
  UpdateProviderPayload,
  UpdateProviderStatusPayload,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProviderEditModal } from "../ProviderEditModal";
import { ProviderApprovalModal } from "../ProviderApprovalModal";
import { ProviderStatusModal } from "../ProviderStatusModal";

interface ProviderDetailsViewProps {
  provider: Provider | null;
  activities: ProviderActivity[];
  isLoading?: boolean;
  onUpdateProvider: (
    providerId: string,
    payload: UpdateProviderPayload
  ) => Promise<Provider>;
  onUpdateApproval: (
    providerId: string,
    payload: UpdateProviderApprovalPayload
  ) => Promise<Provider>;
  onUpdateStatus: (
    providerId: string,
    payload: UpdateProviderStatusPayload
  ) => Promise<Provider>;
}

export function ProviderDetailsView({
  provider,
  activities,
  isLoading = false,
  onUpdateProvider,
  onUpdateApproval,
  onUpdateStatus,
}: ProviderDetailsViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">Loading provider profile...</p>
      </div>
    );
  }

  // Direct-ID Isolation: Not Found State (Provider ID does not exist or belongs to another org)
  if (!provider) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-critical/30 rounded-xl p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-critical/15 text-critical flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
            Provider Record Not Found
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            The requested provider identifier does not exist or does not belong to your active organization workspace. Cross-organization access is strictly restricted.
          </p>
          <Link
            href="/admin/providers"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Providers Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Derived metrics
  const completionRate =
    provider.totalBookings > 0
      ? Math.round((provider.completedBookings / provider.totalBookings) * 100)
      : 0;
  const avgOrderValue =
    provider.completedBookings > 0
      ? Math.round(provider.totalEarnings / provider.completedBookings)
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Link
          href="/admin/dashboard"
          className="hover:text-on-surface transition-colors"
        >
          Admin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <Link
          href="/admin/providers"
          className="hover:text-on-surface transition-colors"
        >
          Service Providers
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-semibold truncate max-w-xs">
          {provider.fullName}
        </span>
      </nav>

      {/* 2. Hero Bento Card (Stitch: anything_clean_provider_profile_admin) */}
      <div className="bg-surface-container-low border border-surface-variant/60 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/30 shrink-0">
              {getInitials(provider.fullName)}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-headline-md text-2xl font-bold text-on-surface">
                  {provider.fullName}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant text-primary font-semibold">
                  {provider.id}
                </span>

                {/* Verification Badge */}
                {provider.approvalStatus === "approved" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium text-xs">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    Verified Partner
                  </span>
                )}
                {provider.approvalStatus === "pending" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 font-medium text-xs">
                    <Clock className="w-3 h-3 text-warning" />
                    Verification Pending
                  </span>
                )}
                {provider.approvalStatus === "rejected" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-medium text-xs">
                    <XCircle className="w-3 h-3 text-critical" />
                    Application Rejected
                  </span>
                )}

                {/* Status Badge */}
                {provider.status === "active" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-semibold text-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    ACTIVE
                  </span>
                )}
                {provider.status === "suspended" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-semibold text-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-critical" />
                    SUSPENDED
                  </span>
                )}
                {provider.status === "inactive" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant font-medium text-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                    INACTIVE
                  </span>
                )}
              </div>

              {provider.businessName && (
                <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-outline" />
                  <span>{provider.businessName}</span>
                </p>
              )}

              {/* Rating and joined date */}
              <div className="flex items-center gap-4 mt-2 text-xs text-outline flex-wrap">
                {provider.rating > 0 ? (
                  <div className="inline-flex items-center gap-1 font-semibold text-warning">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span>{provider.rating.toFixed(1)}</span>
                    <span className="text-outline font-normal">
                      ({provider.totalReviews} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="italic">No customer reviews yet</span>
                )}

                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Registered {formatDate(provider.joinedAt)}
                </span>

                {provider.lastActiveAt && (
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Last Active {formatDate(provider.lastActiveAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="bg-surface-container border-outline-variant text-xs flex items-center gap-1.5 flex-1 lg:flex-none"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>

            {provider.approvalStatus === "pending" && (
              <Button
                size="sm"
                onClick={() => setApprovalModalOpen(true)}
                className="bg-warning text-warning-inverse hover:bg-warning/90 text-xs flex items-center gap-1.5 flex-1 lg:flex-none"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Review Verification</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              className="bg-surface-container border-outline-variant text-xs flex items-center gap-1.5 flex-1 lg:flex-none"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </Button>
          </div>
        </div>

        {/* Contact Strip with one-click copy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-surface-variant/40 text-xs">
          {/* Email */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60 border border-surface-variant/40">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              <a
                href={`mailto:${provider.email}`}
                className="truncate hover:text-primary transition-colors text-on-surface"
              >
                {provider.email}
              </a>
            </div>
            <button
              onClick={() => copyToClipboard(provider.email, "email")}
              className="p-1 rounded text-outline hover:text-on-surface transition-colors shrink-0 ml-2"
              title="Copy Email"
            >
              {copiedField === "email" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60 border border-surface-variant/40">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <a
                href={`tel:${provider.phone}`}
                className="font-mono truncate hover:text-primary transition-colors text-on-surface"
              >
                {provider.phone}
              </a>
            </div>
            <button
              onClick={() => copyToClipboard(provider.phone, "phone")}
              className="p-1 rounded text-outline hover:text-on-surface transition-colors shrink-0 ml-2"
              title="Copy Phone"
            >
              {copiedField === "phone" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* City / Base */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60 border border-surface-variant/40">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate text-on-surface font-medium">
                {provider.city}, India
              </span>
            </div>
            <span className="text-[10px] text-outline font-mono">
              {provider.organizationId}
            </span>
          </div>
        </div>
      </div>

      {/* 3. KPI Telemetry Strip (Stitch: anything_clean_provider_profile_admin) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Bookings */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-outline text-xs uppercase font-medium">
              Total Orders
            </span>
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-display text-on-surface">
              {provider.totalBookings}
            </span>
          </div>
          <span className="text-[11px] text-outline">Platform bookings</span>
        </div>

        {/* Completed Bookings */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-outline text-xs uppercase font-medium">
              Completed
            </span>
            <div className="p-1.5 rounded-lg bg-success/15 text-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-display text-on-surface">
              {provider.completedBookings}
            </span>
          </div>
          <span className="text-[11px] text-success font-medium">
            {completionRate}% completion rate
          </span>
        </div>

        {/* Cancelled Bookings */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-outline text-xs uppercase font-medium">
              Cancelled
            </span>
            <div className="p-1.5 rounded-lg bg-critical/15 text-critical">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-display text-on-surface">
              {provider.cancelledBookings}
            </span>
          </div>
          <span className="text-[11px] text-outline">Customer or partner drops</span>
        </div>

        {/* Total Earnings */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-outline text-xs uppercase font-medium">
              Total Earnings
            </span>
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-display font-mono text-on-surface">
              {formatCurrency(provider.totalEarnings)}
            </span>
          </div>
          <span className="text-[11px] text-outline">Accumulated revenue</span>
        </div>

        {/* Avg Order Value */}
        <div className="col-span-2 md:col-span-1 bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-outline text-xs uppercase font-medium">
              Avg Order Value
            </span>
            <div className="p-1.5 rounded-lg bg-secondary/15 text-secondary">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-display font-mono text-on-surface">
              {formatCurrency(avgOrderValue)}
            </span>
          </div>
          <span className="text-[11px] text-outline">Per completed booking</span>
        </div>
      </div>

      {/* 4. Two-Column Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Business & Service Coverage Details */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-variant/40">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="font-title-md text-sm font-semibold text-on-surface">
                Service Catalog & Coverage
              </h2>
            </div>

            {/* Authorized Services */}
            <div>
              <span className="text-outline text-xs font-medium block mb-2">
                Authorized Service Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {provider.serviceCategories.map((category) => (
                  <span
                    key={category}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/60 text-xs text-on-surface"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Service Coverage Areas */}
            <div>
              <span className="text-outline text-xs font-medium block mb-2">
                Operational Areas in {provider.city}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {provider.serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-primary" />
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Organization Scope */}
            <div className="pt-3 border-t border-surface-variant/40 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Organization Node:</span>
                <span className="font-mono font-bold text-on-surface">
                  {provider.organizationId}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant mt-1.5">
                <span>Last Record Update:</span>
                <span>{formatDate(provider.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2/3: Status & Verification Audit Log Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/40 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="font-title-md text-sm font-semibold text-on-surface">
                  Status & Operational Audit Trail
                </h2>
              </div>
              <span className="text-xs text-outline font-mono">
                {activities.length} Recorded Events
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-outline">
                No recorded audit events for this provider yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-variant">
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-low" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-xs font-medium text-on-surface">
                        {act.description}
                      </p>
                      <span className="text-[11px] text-outline whitespace-nowrap font-mono">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-on-surface-variant">
                        Actor: {act.actorName}
                      </span>
                      {act.status && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono">
                          {act.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProviderEditModal
        isOpen={editModalOpen}
        provider={provider}
        onClose={() => setEditModalOpen(false)}
        onSave={onUpdateProvider}
      />

      <ProviderApprovalModal
        isOpen={approvalModalOpen}
        provider={provider}
        onClose={() => setApprovalModalOpen(false)}
        onConfirmApproval={onUpdateApproval}
      />

      <ProviderStatusModal
        isOpen={statusModalOpen}
        provider={provider}
        onClose={() => setStatusModalOpen(false)}
        onConfirmStatus={onUpdateStatus}
      />
    </div>
  );
}
