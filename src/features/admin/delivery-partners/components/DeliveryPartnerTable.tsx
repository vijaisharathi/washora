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
  Bike,
  Zap,
  Truck,
  Car,
  Star,
  MapPin,
  ExternalLink,
  Shield,
  Radio,
} from "lucide-react";
import {
  DeliveryPartner,
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerSortDirection,
  DeliveryPartnerSortField,
  DeliveryPartnerStatus,
  VehicleType,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DeliveryPartnerTableProps {
  deliveryPartners: DeliveryPartner[];
  sort: DeliveryPartnerSortField;
  sortDirection: DeliveryPartnerSortDirection;
  onSortChange: (field: DeliveryPartnerSortField) => void;
  onEditPartner: (partner: DeliveryPartner) => void;
  onChangeStatus: (partner: DeliveryPartner) => void;
  onReviewApproval: (partner: DeliveryPartner) => void;
  isLoading?: boolean;
}

export function DeliveryPartnerTable({
  deliveryPartners,
  sort,
  sortDirection,
  onSortChange,
  onEditPartner,
  onChangeStatus,
  onReviewApproval,
  isLoading = false,
}: DeliveryPartnerTableProps) {
  // Render sort direction icon helper
  const renderSortIcon = (field: DeliveryPartnerSortField) => {
    if (sort !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-outline opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  // Helper for vehicle icon & label
  const renderVehicleBadge = (vehicleType: VehicleType, plate: string) => {
    let Icon = Bike;
    let label = "Bike";

    switch (vehicleType) {
      case "electric_bike":
        Icon = Zap;
        label = "EV Bike";
        break;
      case "scooter":
        Icon = Bike;
        label = "Scooter";
        break;
      case "three_wheeler":
        Icon = Car;
        label = "3-Wheeler";
        break;
      case "van":
        Icon = Truck;
        label = "Van";
        break;
      case "bike":
      default:
        Icon = Bike;
        label = "Motorcycle";
        break;
    }

    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 font-medium text-xs text-on-surface">
          <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{label}</span>
        </div>
        <span className="font-mono text-[11px] text-outline tracking-wider bg-surface-container-high px-1.5 py-0.5 rounded border border-surface-variant/70 w-fit">
          {plate}
        </span>
      </div>
    );
  };

  // Helper for Operational Status Badge
  const renderStatusBadge = (status: DeliveryPartnerStatus, isOnline?: boolean) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-semibold text-[10px] uppercase tracking-wider">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? "bg-success animate-pulse" : "bg-success/70"
              }`}
            />
            {isOnline ? "ONLINE" : "ACTIVE"}
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-semibold text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-critical" />
            SUSPENDED
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant/50 font-medium text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            INACTIVE
          </span>
        );
    }
  };

  // Helper for Verification Approval Badge
  const renderApprovalBadge = (approval: DeliveryPartnerApprovalStatus) => {
    switch (approval) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            Verified
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

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper for formatting last active
  const formatLastActive = (dateString?: string, isOnline?: boolean) => {
    if (isOnline) {
      return (
        <span className="text-success font-medium flex items-center gap-1 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Active now
        </span>
      );
    }
    if (!dateString) return <span className="text-outline text-[11px]">Never</span>;
    return <span className="text-on-surface-variant text-[11px]">{formatDate(dateString)}</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">Loading delivery partner fleet...</p>
      </div>
    );
  }

  if (deliveryPartners.length === 0) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-outline mb-3">
          <Bike className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">
          No Delivery Partners Found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm">
          No delivery partners matched your active search query or filter criteria. Try clearing or relaxing your filters.
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
              {/* Partner Identity */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("name")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Delivery Partner</span>
                  {renderSortIcon("name")}
                </button>
              </th>

              {/* ID & Vehicle */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("vehicleType")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Vehicle & ID</span>
                  {renderSortIcon("vehicleType")}
                </button>
              </th>

              {/* Location */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("city")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>City & Zones</span>
                  {renderSortIcon("city")}
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

              {/* Deliveries */}
              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => onSortChange("totalDeliveries")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Deliveries</span>
                  {renderSortIcon("totalDeliveries")}
                </button>
              </th>

              {/* Total Earnings */}
              <th className="py-3.5 px-4 text-right">
                <button
                  onClick={() => onSortChange("totalEarnings")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors ml-auto"
                >
                  <span>Earnings</span>
                  {renderSortIcon("totalEarnings")}
                </button>
              </th>

              {/* Status & Verification */}
              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => onSortChange("status")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Status & Verification</span>
                  {renderSortIcon("status")}
                </button>
              </th>

              {/* Last Active */}
              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => onSortChange("lastActiveAt")}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Last Active</span>
                  {renderSortIcon("lastActiveAt")}
                </button>
              </th>

              {/* Actions */}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-variant/30 text-xs text-on-surface">
            {deliveryPartners.map((partner) => (
              <tr
                key={partner.id}
                className="hover:bg-surface-container-highest/40 transition-colors group"
              >
                {/* Partner Identity */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/30">
                      {getInitials(partner.fullName)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/delivery-partners/${partner.id}`}
                        className="font-medium text-on-surface hover:text-primary transition-colors flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{partner.fullName}</span>
                        <ExternalLink className="w-3 h-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                      <div className="text-[11px] text-on-surface-variant truncate">
                        {partner.phone}
                      </div>
                    </div>
                  </div>
                </td>

                {/* ID & Vehicle */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-semibold text-primary">
                      {partner.id}
                    </span>
                    {renderVehicleBadge(
                      partner.vehicleType,
                      partner.vehicleNumber
                    )}
                  </div>
                </td>

                {/* City & Zones */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-on-surface font-medium">
                      <MapPin className="w-3 h-3 text-outline" />
                      <span>{partner.city}</span>
                    </div>
                    <span className="text-[11px] text-outline truncate max-w-[140px]" title={partner.serviceAreas.join(", ")}>
                      {partner.serviceAreas.slice(0, 2).join(", ")}
                      {partner.serviceAreas.length > 2 &&
                        ` +${partner.serviceAreas.length - 2}`}
                    </span>
                  </div>
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4 text-center">
                  {partner.rating > 0 ? (
                    <div className="inline-flex items-center gap-1 font-semibold text-on-surface">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{partner.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-outline">
                        ({partner.totalReviews})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-outline">Unrated</span>
                  )}
                </td>

                {/* Total Deliveries */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-on-surface">
                      {partner.totalDeliveries.toLocaleString()}
                    </span>
                    {(partner.activeOrdersCount ?? 0) > 0 && (
                      <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        {partner.activeOrdersCount} on route
                      </span>
                    )}
                  </div>
                </td>

                {/* Total Earnings */}
                <td className="py-3.5 px-4 text-right font-medium text-on-surface">
                  {formatCurrency(partner.totalEarnings)}
                </td>

                {/* Status & Verification */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col items-center gap-1">
                    {renderStatusBadge(partner.status, partner.isOnline)}
                    {renderApprovalBadge(partner.approvalStatus)}
                  </div>
                </td>

                {/* Last Active */}
                <td className="py-3.5 px-4 text-center">
                  {formatLastActive(partner.lastActiveAt, partner.isOnline)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <Link
                      href={`/admin/delivery-partners/${partner.id}`}
                      className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                      title="View Partner Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEditPartner(partner)}
                      className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onReviewApproval(partner)}
                      className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                      title="Review Approval"
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

      {/* Mobile Card View (< lg screens) */}
      <div className="lg:hidden divide-y divide-surface-variant/40">
        {deliveryPartners.map((partner) => (
          <div key={partner.id} className="p-4 flex flex-col gap-3">
            {/* Top row: Partner & Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/30">
                  {getInitials(partner.fullName)}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/delivery-partners/${partner.id}`}
                    className="font-medium text-sm text-on-surface hover:text-primary truncate block"
                  >
                    {partner.fullName}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-outline">
                    <span className="font-mono text-primary">{partner.id}</span>
                    <span>•</span>
                    <span>{partner.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {renderStatusBadge(partner.status, partner.isOnline)}
                {renderApprovalBadge(partner.approvalStatus)}
              </div>
            </div>

            {/* Vehicle & City Info */}
            <div className="grid grid-cols-2 gap-2 bg-surface-container/60 p-2.5 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-outline uppercase block">Vehicle</span>
                <div className="font-medium text-on-surface flex items-center gap-1 mt-0.5">
                  <Bike className="w-3.5 h-3.5 text-primary" />
                  <span className="capitalize">{partner.vehicleType.replace("_", " ")}</span>
                </div>
                <span className="font-mono text-[10px] text-outline">
                  {partner.vehicleNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Location</span>
                <div className="font-medium text-on-surface flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-outline" />
                  <span>{partner.city}</span>
                </div>
                <span className="text-[10px] text-outline truncate block">
                  {partner.serviceAreas.join(", ")}
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center justify-between text-xs py-1 border-y border-surface-variant/30">
              <div className="flex items-center gap-1 font-semibold text-on-surface">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {partner.rating > 0 ? partner.rating.toFixed(1) : "New"}
                </span>
                <span className="text-[10px] text-outline">
                  ({partner.totalReviews})
                </span>
              </div>
              <div className="text-on-surface-variant">
                <span className="font-medium text-on-surface">
                  {partner.totalDeliveries}
                </span>{" "}
                deliveries
              </div>
              <div className="font-medium text-on-surface">
                {formatCurrency(partner.totalEarnings)}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-outline">
                {formatLastActive(partner.lastActiveAt, partner.isOnline)}
              </span>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/delivery-partners/${partner.id}`}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>
                <button
                  onClick={() => onEditPartner(partner)}
                  className="p-1.5 rounded-lg bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onChangeStatus(partner)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container text-xs font-medium text-primary hover:bg-surface-container-high transition-colors"
                >
                  Status
                </button>
                <button
                  onClick={() => onReviewApproval(partner)}
                  className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
