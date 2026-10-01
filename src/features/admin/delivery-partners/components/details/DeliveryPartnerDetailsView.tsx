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
  Bike,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ArrowLeft,
  AlertCircle,
  Activity,
  Star,
  Shield,
  Truck,
  Zap,
  Car,
  Package,
  IndianRupee,
  Radio,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  DeliveryPartner,
  DeliveryPartnerActivity,
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerStatus,
  UpdateDeliveryPartnerApprovalPayload,
  UpdateDeliveryPartnerPayload,
  UpdateDeliveryPartnerStatusPayload,
  VehicleType,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeliveryPartnerEditModal } from "../DeliveryPartnerEditModal";
import { DeliveryPartnerApprovalModal } from "../DeliveryPartnerApprovalModal";
import { DeliveryPartnerStatusModal } from "../DeliveryPartnerStatusModal";

interface DeliveryPartnerDetailsViewProps {
  deliveryPartner: DeliveryPartner | null;
  activities: DeliveryPartnerActivity[];
  isLoading?: boolean;
  onUpdateDeliveryPartner: (
    partnerId: string,
    payload: UpdateDeliveryPartnerPayload
  ) => Promise<DeliveryPartner>;
  onUpdateApproval: (
    partnerId: string,
    payload: UpdateDeliveryPartnerApprovalPayload
  ) => Promise<DeliveryPartner>;
  onUpdateStatus: (
    partnerId: string,
    payload: UpdateDeliveryPartnerStatusPayload
  ) => Promise<DeliveryPartner>;
}

export function DeliveryPartnerDetailsView({
  deliveryPartner,
  activities,
  isLoading = false,
  onUpdateDeliveryPartner,
  onUpdateApproval,
  onUpdateStatus,
}: DeliveryPartnerDetailsViewProps) {
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

  const renderVehicleIcon = (vehicleType: VehicleType) => {
    switch (vehicleType) {
      case "electric_bike":
        return <Zap className="w-4 h-4 text-primary" />;
      case "scooter":
        return <Bike className="w-4 h-4 text-primary" />;
      case "three_wheeler":
        return <Car className="w-4 h-4 text-primary" />;
      case "van":
        return <Truck className="w-4 h-4 text-primary" />;
      case "bike":
      default:
        return <Bike className="w-4 h-4 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">
          Loading delivery partner profile...
        </p>
      </div>
    );
  }

  // Direct-ID Isolation: Not Found State (Partner ID does not exist or belongs to another org)
  if (!deliveryPartner) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-critical/30 rounded-xl p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-critical/15 text-critical flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
            Delivery Partner Record Not Found
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            The requested delivery partner identifier does not exist or does not belong to your active organization workspace. Cross-organization fleet access is strictly restricted.
          </p>
          <Link
            href="/admin/delivery-partners"
            className="px-4 py-2 rounded-lg bg-primary text-primary-inverse font-semibold text-xs flex items-center gap-2 hover:bg-primary-dim transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Delivery Partners Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Derived metrics
  const completionRate =
    deliveryPartner.totalDeliveries > 0
      ? Math.round(
          (deliveryPartner.completedDeliveries / deliveryPartner.totalDeliveries) * 100
        )
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
          href="/admin/delivery-partners"
          className="hover:text-on-surface transition-colors"
        >
          Delivery Partners
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-semibold truncate max-w-xs">
          {deliveryPartner.fullName}
        </span>
      </nav>

      {/* 2. Hero Bento Card (Stitch: anything_clean_delivery_partner_profile_admin) */}
      <div className="bg-surface-container-low border border-surface-variant/60 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/30 shrink-0">
              {getInitials(deliveryPartner.fullName)}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-headline-md text-2xl font-bold text-on-surface">
                  {deliveryPartner.fullName}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant text-primary font-semibold">
                  {deliveryPartner.id}
                </span>

                {/* Verification Badge */}
                {deliveryPartner.approvalStatus === "approved" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium text-xs">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    Verified Partner
                  </span>
                )}
                {deliveryPartner.approvalStatus === "pending" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 font-medium text-xs">
                    <Clock className="w-3 h-3 text-warning" />
                    Verification Pending
                  </span>
                )}
                {deliveryPartner.approvalStatus === "rejected" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-medium text-xs">
                    <XCircle className="w-3 h-3 text-critical" />
                    Application Rejected
                  </span>
                )}

                {/* Status Badge */}
                {deliveryPartner.status === "active" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-semibold text-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    {deliveryPartner.isOnline ? "ONLINE NOW" : "ACTIVE"}
                  </span>
                )}
                {deliveryPartner.status === "suspended" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-semibold text-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-critical" />
                    SUSPENDED
                  </span>
                )}
                {deliveryPartner.status === "inactive" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant font-medium text-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Sub-identity row: Vehicle and Location */}
              <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  {renderVehicleIcon(deliveryPartner.vehicleType)}
                  <span className="capitalize">{deliveryPartner.vehicleType.replace("_", " ")}</span>
                  <span className="font-mono text-outline font-medium">({deliveryPartner.vehicleNumber})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-outline" />
                  <span>{deliveryPartner.city}</span>
                </span>
              </div>

              {/* Rating and joined date */}
              <div className="flex items-center gap-4 mt-2 text-xs text-outline flex-wrap">
                {deliveryPartner.rating > 0 ? (
                  <div className="inline-flex items-center gap-1 font-semibold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{deliveryPartner.rating.toFixed(1)}</span>
                    <span className="text-outline font-normal">
                      ({deliveryPartner.totalReviews} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="italic">No customer reviews yet</span>
                )}

                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Registered {formatDate(deliveryPartner.joinedAt)}
                </span>

                {deliveryPartner.lastActiveAt && (
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Last Active {formatDate(deliveryPartner.lastActiveAt)}
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
              className="text-xs flex items-center gap-1.5 flex-1 lg:flex-none border-surface-variant"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              className="text-xs flex items-center gap-1.5 flex-1 lg:flex-none border-surface-variant"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setApprovalModalOpen(true)}
              className="text-xs flex items-center gap-1.5 flex-1 lg:flex-none bg-primary text-primary-inverse hover:bg-primary-dim"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Review Verification</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Performance KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Deliveries */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4">
          <span className="text-[11px] text-outline font-medium uppercase tracking-wider block">
            Total Deliveries
          </span>
          <div className="text-xl font-bold text-on-surface mt-1">
            {deliveryPartner.totalDeliveries.toLocaleString()}
          </div>
          <span className="text-[10px] text-outline mt-0.5 block">All time assigned</span>
        </div>

        {/* Completed */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4">
          <span className="text-[11px] text-success font-medium uppercase tracking-wider block">
            Completed
          </span>
          <div className="text-xl font-bold text-success mt-1">
            {deliveryPartner.completedDeliveries.toLocaleString()}
          </div>
          <span className="text-[10px] text-outline mt-0.5 block">Delivered safely</span>
        </div>

        {/* Active on Route */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4">
          <span className="text-[11px] text-primary font-medium uppercase tracking-wider block">
            In Transit
          </span>
          <div className="text-xl font-bold text-primary mt-1 flex items-center gap-1.5">
            {deliveryPartner.activeOrdersCount || 0}
            {(deliveryPartner.activeOrdersCount ?? 0) > 0 && (
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
            )}
          </div>
          <span className="text-[10px] text-outline mt-0.5 block">Active live dispatches</span>
        </div>

        {/* Failed / Returned */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4">
          <span className="text-[11px] text-critical font-medium uppercase tracking-wider block">
            Failed / Canceled
          </span>
          <div className="text-xl font-bold text-critical mt-1">
            {deliveryPartner.cancelledDeliveries}
          </div>
          <span className="text-[10px] text-outline mt-0.5 block">Unfulfilled drop-offs</span>
        </div>

        {/* Completion Rate */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4">
          <span className="text-[11px] text-outline font-medium uppercase tracking-wider block">
            Success Rate
          </span>
          <div className="text-xl font-bold text-on-surface mt-1">
            {completionRate}%
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                completionRate >= 90
                  ? "bg-success"
                  : completionRate >= 75
                  ? "bg-warning"
                  : "bg-critical"
              }`}
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4">
          <span className="text-[11px] text-outline font-medium uppercase tracking-wider block">
            Total Payouts
          </span>
          <div className="text-xl font-bold text-on-surface mt-1">
            {formatCurrency(deliveryPartner.totalEarnings)}
          </div>
          <span className="text-[10px] text-outline mt-0.5 block">Settled partner earnings</span>
        </div>
      </div>

      {/* 4. Bento Details Grid: Contact, Vehicle & Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information Bento Card */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
            <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>Contact Credentials</span>
            </h3>
            <span className="text-[11px] text-outline font-mono">ID: {deliveryPartner.id}</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Email */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-outline uppercase block">Email Address</span>
                <span className="font-medium text-on-surface truncate block">
                  {deliveryPartner.email}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(deliveryPartner.email, "email")}
                className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                title="Copy Email"
              >
                {copiedField === "email" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Mobile Phone */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-outline uppercase block">Mobile Phone</span>
                <span className="font-medium text-on-surface truncate block">
                  {deliveryPartner.phone}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(deliveryPartner.phone, "phone")}
                className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                title="Copy Phone"
              >
                {copiedField === "phone" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Emergency Contact */}
            {deliveryPartner.emergencyContact && (
              <div className="p-2.5 rounded-lg bg-surface-container/60">
                <span className="text-[10px] text-outline uppercase block">Emergency Contact</span>
                <span className="font-medium text-on-surface block mt-0.5">
                  {deliveryPartner.emergencyContact.name} ({deliveryPartner.emergencyContact.relation})
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {deliveryPartner.emergencyContact.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle & Verification Card */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
            <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2">
              <Bike className="w-4 h-4 text-primary" />
              <span>Vehicle & Documents</span>
            </h3>
            <span className="text-[11px] text-success font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              RTO Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Vehicle Type & Registration */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60">
              <div>
                <span className="text-[10px] text-outline uppercase block">Vehicle Assigned</span>
                <div className="flex items-center gap-1.5 font-medium text-on-surface mt-0.5">
                  {renderVehicleIcon(deliveryPartner.vehicleType)}
                  <span className="capitalize">{deliveryPartner.vehicleType.replace("_", " ")}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase block">Plate Number</span>
                <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 block mt-0.5">
                  {deliveryPartner.vehicleNumber}
                </span>
              </div>
            </div>

            {/* Driving License */}
            {deliveryPartner.drivingLicenseNumber && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container/60">
                <div>
                  <span className="text-[10px] text-outline uppercase block">Driving License (DL)</span>
                  <span className="font-mono text-xs text-on-surface font-medium block mt-0.5">
                    {deliveryPartner.drivingLicenseNumber}
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(deliveryPartner.drivingLicenseNumber!, "dl")
                  }
                  className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                  title="Copy DL Number"
                >
                  {copiedField === "dl" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Delivery Gear / Bag */}
            <div className="p-2.5 rounded-lg bg-surface-container/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-outline uppercase block">Insulated Laundry Bag</span>
                <span className="text-xs text-on-surface font-medium block mt-0.5">
                  Issued & Tagged (WASHORA-BAG-04)
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
          </div>
        </div>

        {/* Operating Area & Service Hubs */}
        <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
            <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Coverage & Zones</span>
            </h3>
            <span className="text-[11px] text-outline font-medium">
              {deliveryPartner.serviceAreas.length} Zones Assigned
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Primary City */}
            <div className="p-2.5 rounded-lg bg-surface-container/60">
              <span className="text-[10px] text-outline uppercase block">Operational City</span>
              <span className="font-semibold text-sm text-on-surface block mt-0.5">
                {deliveryPartner.city}
              </span>
            </div>

            {/* Service Areas */}
            <div>
              <span className="text-[10px] text-outline uppercase block mb-1.5">
                Delivery Hubs & Neighborhoods
              </span>
              <div className="flex flex-wrap gap-1.5">
                {deliveryPartner.serviceAreas.map((area, idx) => (
                  <span
                    key={`${area}-${idx}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-container-high border border-surface-variant text-on-surface"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Audit Activity Log (Timeline) */}
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-6">
        <div className="flex items-center justify-between border-b border-surface-variant/40 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-on-surface">
              Partner Activity & Audit Log
            </h3>
          </div>
          <span className="text-xs text-outline font-mono">
            {activities.length} Recorded Events
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="p-6 text-center text-outline text-xs italic">
            No audit activities recorded for this delivery partner yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-variant">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-surface-container-highest border-2 border-primary group-hover:scale-125 transition-transform" />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-on-surface capitalize">
                      {act.type ? act.type.replace("_", " ") : "Activity Recorded"}
                    </span>
                    <span className="text-outline">•</span>
                    <span className="text-on-surface-variant text-[11px]">
                      {formatDate(act.timestamp)}
                    </span>
                    {act.actorName && (
                      <>
                        <span className="text-outline">•</span>
                        <span className="text-[11px] text-outline font-mono">
                          By: {act.actorName}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DeliveryPartnerEditModal
        isOpen={editModalOpen}
        deliveryPartner={deliveryPartner}
        onClose={() => setEditModalOpen(false)}
        onSave={onUpdateDeliveryPartner}
      />

      <DeliveryPartnerApprovalModal
        isOpen={approvalModalOpen}
        deliveryPartner={deliveryPartner}
        onClose={() => setApprovalModalOpen(false)}
        onConfirmApproval={onUpdateApproval}
      />

      <DeliveryPartnerStatusModal
        isOpen={statusModalOpen}
        deliveryPartner={deliveryPartner}
        onClose={() => setStatusModalOpen(false)}
        onConfirmStatus={onUpdateStatus}
      />
    </div>
  );
}
