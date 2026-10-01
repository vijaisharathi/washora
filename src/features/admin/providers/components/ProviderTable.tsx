"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Star,
  MapPin,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import {
  Provider,
  ProviderApprovalStatus,
  ProviderSortDirection,
  ProviderSortField,
  ProviderStatus,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProviderTableProps {
  providers: Provider[];
  sort: ProviderSortField;
  sortDirection: ProviderSortDirection;
  onSortChange: (field: ProviderSortField) => void;
  onEditProvider: (provider: Provider) => void;
  onChangeStatus: (provider: Provider) => void;
  onReviewApproval: (provider: Provider) => void;
  isLoading?: boolean;
}

export function ProviderTable({
  providers,
  sort,
  sortDirection,
  onSortChange,
  onEditProvider,
  onChangeStatus,
  onReviewApproval,
  isLoading = false,
}: ProviderTableProps) {
  // Render sort direction icon helper
  const renderSortIcon = (field: ProviderSortField) => {
    if (sort !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-outline opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  // Helper for Operational Status Badge
  const renderStatusBadge = (status: ProviderStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-semibold text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            ACTIVE
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-semibold text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-critical" />
            SUSPENDED
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant/50 font-medium text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            INACTIVE
          </span>
        );
    }
  };

  // Helper for Verification Approval Badge
  const renderApprovalBadge = (approval: ProviderApprovalStatus) => {
    switch (approval) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-medium text-[11px]">
            <XCircle className="w-3 h-3 text-critical" />
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 font-medium text-[11px]">
            <Clock className="w-3 h-3 text-warning" />
            Pending
          </span>
        );
    }
  };

  // Helper for initials fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">Loading provider records...</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-outline mb-3">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">No Providers Found</h3>
        <p className="text-xs text-on-surface-variant max-w-sm">
          No service providers matched your active search query or filter criteria. Try clearing or relaxing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl overflow-hidden shadow-sm">
      {/* Desktop / Tablet Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-variant/50 bg-surface-container/60 text-[11px] font-semibold text-outline uppercase tracking-wider">
              {/* Provider identity */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("name")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Provider & Business</span>
                  {renderSortIcon("name")}
                </button>
              </th>

              {/* ID & Joined */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("joinedAt")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>ID & Joined</span>
                  {renderSortIcon("joinedAt")}
                </button>
              </th>

              {/* Service Categories */}
              <th className="py-3.5 px-4">Services</th>

              {/* Location */}
              <th className="py-3.5 px-4">Location</th>

              {/* Orders */}
              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => onSortChange("totalBookings")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Orders</span>
                  {renderSortIcon("totalBookings")}
                </button>
              </th>

              {/* Rating */}
              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => onSortChange("rating")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Rating</span>
                  {renderSortIcon("rating")}
                </button>
              </th>

              {/* Earnings */}
              <th className="py-3.5 px-4 text-right">
                <button
                  onClick={() => onSortChange("totalEarnings")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors ml-auto"
                >
                  <span>Earnings</span>
                  {renderSortIcon("totalEarnings")}
                </button>
              </th>

              {/* Status & Approval */}
              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => onSortChange("status")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Status & Approval</span>
                  {renderSortIcon("status")}
                </button>
              </th>

              {/* Actions */}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-variant/30 text-xs text-on-surface">
            {providers.map((provider) => (
              <tr
                key={provider.id}
                className="hover:bg-surface-container-highest/40 transition-colors group"
              >
                {/* Provider Identity */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/30">
                      {getInitials(provider.fullName)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/providers/${provider.id}`}
                        className="font-medium text-on-surface hover:text-primary transition-colors flex items-center gap-1 truncate"
                      >
                        <span>{provider.fullName}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-outline" />
                      </Link>
                      {provider.businessName && (
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {provider.businessName}
                        </p>
                      )}
                      <p className="text-[11px] text-outline truncate font-mono">
                        {provider.phone}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ID & Joined */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-mono text-xs font-semibold text-primary">
                    {provider.id}
                  </div>
                  <div className="text-[11px] text-outline">
                    {formatDate(provider.joinedAt)}
                  </div>
                </td>

                {/* Service Categories */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {provider.serviceCategories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 text-[10px] text-on-surface-variant truncate"
                      >
                        {cat}
                      </span>
                    ))}
                    {provider.serviceCategories.length > 2 && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] text-outline"
                        title={provider.serviceCategories.slice(2).join(", ")}
                      >
                        +{provider.serviceCategories.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 font-medium text-xs text-on-surface">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{provider.city}</span>
                  </div>
                  <div className="text-[11px] text-outline pl-4 truncate max-w-[140px]">
                    {provider.serviceAreas.join(", ")}
                  </div>
                </td>

                {/* Orders */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="font-semibold text-xs text-on-surface">
                    {provider.totalBookings}
                  </div>
                  <div className="text-[11px] text-outline">
                    {provider.completedBookings} done
                  </div>
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  {provider.rating > 0 ? (
                    <div>
                      <div className="inline-flex items-center gap-1 font-semibold text-xs text-warning">
                        <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                        <span>{provider.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-[10px] text-outline">
                        ({provider.totalReviews})
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-outline italic">Unrated</span>
                  )}
                </td>

                {/* Earnings */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-medium text-on-surface">
                  {formatCurrency(provider.totalEarnings)}
                </td>

                {/* Status & Approval */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex flex-col items-center gap-1">
                    {renderStatusBadge(provider.status)}
                    {renderApprovalBadge(provider.approvalStatus)}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Details */}
                    <Link
                      href={`/admin/providers/${provider.id}`}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                      title="View Provider Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit Profile */}
                    <button
                      onClick={() => onEditProvider(provider)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                      title="Edit Provider Information"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Review Approval (if pending) */}
                    {provider.approvalStatus === "pending" && (
                      <button
                        onClick={() => onReviewApproval(provider)}
                        className="p-1.5 rounded-lg text-warning hover:text-warning-inverse hover:bg-warning/20 transition-colors"
                        title="Review Verification Application"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    {/* Operational Status Change */}
                    <button
                      onClick={() => onChangeStatus(provider)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                      title="Change Operational Status"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="lg:hidden divide-y divide-surface-variant/40">
        {providers.map((provider) => (
          <div key={provider.id} className="p-4 flex flex-col gap-3">
            {/* Top row: Avatar + Identity + Statuses */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/30">
                  {getInitials(provider.fullName)}
                </div>
                <div>
                  <Link
                    href={`/admin/providers/${provider.id}`}
                    className="font-medium text-sm text-on-surface hover:text-primary transition-colors block"
                  >
                    {provider.fullName}
                  </Link>
                  {provider.businessName && (
                    <p className="text-xs text-on-surface-variant">
                      {provider.businessName}
                    </p>
                  )}
                  <span className="font-mono text-[11px] text-primary">
                    {provider.id}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {renderStatusBadge(provider.status)}
                {renderApprovalBadge(provider.approvalStatus)}
              </div>
            </div>

            {/* Middle Grid: Services, Location, Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container/50 rounded-lg p-2.5">
              <div>
                <span className="text-outline text-[10px] uppercase">Location</span>
                <p className="font-medium text-on-surface flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  {provider.city}
                </p>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase">Orders</span>
                <p className="font-medium text-on-surface">
                  {provider.totalBookings} ({provider.completedBookings} done)
                </p>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase">Rating</span>
                <p className="font-medium text-on-surface flex items-center gap-1">
                  {provider.rating > 0 ? (
                    <>
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <span>{provider.rating.toFixed(1)} ({provider.totalReviews})</span>
                    </>
                  ) : (
                    <span className="italic text-outline">Unrated</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-outline text-[10px] uppercase">Earnings</span>
                <p className="font-mono font-medium text-on-surface">
                  {formatCurrency(provider.totalEarnings)}
                </p>
              </div>
            </div>

            {/* Service categories */}
            <div className="flex flex-wrap gap-1">
              {provider.serviceCategories.map((c) => (
                <span
                  key={c}
                  className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-on-surface-variant border border-outline-variant/30"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-variant/30">
              <span className="text-[11px] text-outline">
                Joined {formatDate(provider.joinedAt)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditProvider(provider)}
                  className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/50 text-xs font-medium hover:text-primary transition-colors"
                >
                  Edit
                </button>
                {provider.approvalStatus === "pending" && (
                  <button
                    onClick={() => onReviewApproval(provider)}
                    className="px-2.5 py-1 rounded bg-warning/20 border border-warning/30 text-warning text-xs font-medium hover:bg-warning/30 transition-colors"
                  >
                    Review
                  </button>
                )}
                <button
                  onClick={() => onChangeStatus(provider)}
                  className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/50 text-xs font-medium hover:text-on-surface transition-colors"
                >
                  Status
                </button>
                <Link
                  href={`/admin/providers/${provider.id}`}
                  className="px-2.5 py-1 rounded bg-primary text-on-primary text-xs font-medium hover:bg-primary-hover transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
