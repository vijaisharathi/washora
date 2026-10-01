"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Bike,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  UserX,
  Phone,
  Mail,
  Truck,
  History,
} from "lucide-react";
import {
  OperationalBookingView,
  AssignmentActivity,
  AssignmentStatus,
  WorkloadLevel,
} from "@/types/admin/operations";
import { BookingStatus } from "@/types/admin/booking";

interface OperationsBookingDetailsViewProps {
  bookingView: OperationalBookingView;
  activities: AssignmentActivity[];
  onOpenAssignProvider: () => void;
  onOpenReassignProvider: () => void;
  onOpenUnassignProvider: () => void;
  onOpenAssignDelivery: () => void;
  onOpenReassignDelivery: () => void;
  onOpenUnassignDelivery: () => void;
}

export function OperationsBookingDetailsView({
  bookingView,
  activities,
  onOpenAssignProvider,
  onOpenReassignProvider,
  onOpenUnassignProvider,
  onOpenAssignDelivery,
  onOpenReassignDelivery,
  onOpenUnassignDelivery,
}: OperationsBookingDetailsViewProps) {
  const { booking, assignment, customer, provider, deliveryPartner, deliveryRequired } =
    bookingView;

  const isLockedForProviderReassign = booking.status === "in_progress";
  const isTerminal = booking.status === "completed" || booking.status === "cancelled";

  const scheduledDateStr = new Date(booking.scheduledAt).toLocaleDateString();
  const scheduledTimeStr = new Date(booking.scheduledAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getWorkloadBadge = (level?: WorkloadLevel) => {
    if (!level) return null;
    let colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (level === "Medium") {
      colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else if (level === "High") {
      colorClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${colorClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {level} Workload
      </span>
    );
  };

  const getAssignmentStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "Unassigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Unassigned
          </span>
        );
      case "Provider Assigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            Provider Assigned
          </span>
        );
      case "Delivery Assigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Bike className="w-3.5 h-3.5" />
            Delivery Assigned
          </span>
        );
      case "Ready for Service":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready for Service
          </span>
        );
      case "In Service":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-3.5 h-3.5" />
            In Service
          </span>
        );
      case "Service Completed":
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getBookingStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            Confirmed
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Readiness Checklist
  const isCustomerConfirmed = booking.status !== "cancelled";
  const isProviderAssigned = Boolean(assignment.providerId);
  const isDeliveryAssigned = !deliveryRequired || Boolean(assignment.deliveryPartnerId);
  const isServiceReady = isCustomerConfirmed && isProviderAssigned && isDeliveryAssigned;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/operations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Operations Queue
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Booking Operations #{booking.id}
            </h1>
            {getAssignmentStatusBadge(assignment.status)}
            {getBookingStatusBadge(booking.status)}
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-mono">
            Created on {new Date(booking.createdAt).toLocaleDateString()} • Organization: {booking.organizationId}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!provider && !isTerminal && (
            <button
              onClick={onOpenAssignProvider}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Assign Provider
            </button>
          )}

          {deliveryRequired && !deliveryPartner && !isTerminal && (
            <button
              onClick={onOpenAssignDelivery}
              className="px-3.5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Bike className="w-4 h-4" />
              Assign Valet
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Operational Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Overview & Timestamps Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold block">
                  Booking Reference
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-bold text-on-surface font-mono">
                    {booking.bookingNumber || booking.id}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    ({booking.id})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getAssignmentStatusBadge(assignment.status)}
                {getBookingStatusBadge(booking.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Scheduled Time
                </span>
                <span className="font-semibold text-on-surface block mt-0.5">
                  {new Date(booking.scheduledAt).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Created Date
                </span>
                <span className="font-semibold text-on-surface block mt-0.5">
                  {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Last Updated
                </span>
                <span className="font-semibold text-on-surface block mt-0.5">
                  {new Date(booking.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Organization
                </span>
                <span className="font-semibold text-primary font-mono block mt-0.5">
                  {booking.organizationId}
                </span>
              </div>
            </div>
          </div>

          {/* Service & Schedule Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Service Specifications (A8 Catalog)
                </span>
                <h2 className="text-lg font-bold text-on-surface mt-0.5">{booking.serviceName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-xs font-medium">
                    {booking.serviceCategory}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Quantity: <strong className="text-on-surface">{booking.quantity}</strong>
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Duration: <strong className="text-on-surface">{bookingView.service?.durationMinutes ? `${bookingView.service.durationMinutes} mins` : "60 mins"}</strong>
                  </span>
                  <span className="text-xs text-on-surface font-semibold font-mono">
                    Total: ₹{booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/20 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Service Subtotal
                </span>
                <span className="font-semibold text-on-surface text-sm block mt-0.5">
                  ₹{booking.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Service Fee
                </span>
                <span className="font-semibold text-on-surface text-sm block mt-0.5">
                  ₹{booking.serviceFee.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                  Total Amount
                </span>
                <span className="font-bold text-primary text-sm block mt-0.5">
                  ₹{booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1 text-xs">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Service Address (A7 Canonical)
              </span>
              <p className="font-semibold text-on-surface text-sm">{booking.address.addressLine1}</p>
              {booking.address.addressLine2 && (
                <p className="text-on-surface-variant">{booking.address.addressLine2}</p>
              )}
              <p className="text-on-surface-variant">
                {booking.address.area}, {booking.address.city}, {booking.address.state} - {booking.address.postalCode}
              </p>
              {booking.address.landmark && (
                <p className="text-[11px] text-on-surface-variant italic">
                  Landmark: {booking.address.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Assigned Provider Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Assigned Service Provider</h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Canonical A5 provider operational assignment
                  </p>
                </div>
              </div>

              {provider && !isTerminal && (
                <div className="flex items-center gap-2">
                  {!isLockedForProviderReassign ? (
                    <button
                      onClick={onOpenReassignProvider}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors"
                    >
                      Reassign
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-semibold px-2 py-1 rounded bg-amber-500/10">
                      Locked (In Service)
                    </span>
                  )}
                  <button
                    onClick={onOpenUnassignProvider}
                    className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-rose-500/10 text-rose-600 transition-colors"
                    title="Unassign Provider"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {provider ? (
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-on-surface">{provider.fullName}</p>
                      <span className="text-amber-500 text-xs font-bold">★ {provider.rating.toFixed(1)}</span>
                      <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
                        {provider.status.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 font-semibold">
                        {provider.approvalStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono">ID: {provider.id}</p>
                    <p className="text-xs text-on-surface-variant">
                      Operating City: <strong>{provider.city}</strong> • Service Areas:{" "}
                      {provider.serviceAreas.slice(0, 4).join(", ")}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    {getWorkloadBadge(bookingView.providerWorkload)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                  <div>
                    <span>Assigned At: </span>
                    <strong className="text-on-surface">
                      {assignment.providerAssignedAt
                        ? new Date(assignment.providerAssignedAt).toLocaleString()
                        : "N/A"}
                    </strong>
                  </div>
                  <div>
                    <span>Assigned By: </span>
                    <strong className="text-on-surface">
                      {assignment.assignedBy || "Admin Operations"}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-surface-container-low border border-dashed border-outline-variant/50">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-on-surface">No Provider Assigned</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-3">
                  This booking is waiting for an eligible service provider in {booking.address.city}.
                </p>
                {!isTerminal && (
                  <button
                    onClick={onOpenAssignProvider}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-xs"
                  >
                    Assign Provider Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Delivery Partner / Valet Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Delivery Valet Coordination</h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Canonical A6 delivery partner logistics management
                  </p>
                </div>
              </div>

              {deliveryRequired && deliveryPartner && !isTerminal && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenReassignDelivery}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors"
                  >
                    Reassign Valet
                  </button>
                  <button
                    onClick={onOpenUnassignDelivery}
                    className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-rose-500/10 text-rose-600 transition-colors"
                    title="Unassign Valet"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!deliveryRequired ? (
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-on-surface">
                    Delivery coordination not required
                  </p>
                  <p className="text-[11px] mt-0.5">
                    This service category ({booking.serviceCategory}) is fulfilled directly on-site at the customer&apos;s residence.
                  </p>
                </div>
              </div>
            ) : deliveryPartner ? (
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-on-surface">{deliveryPartner.fullName}</p>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-medium flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {deliveryPartner.vehicleType}
                      </span>
                      <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
                        {deliveryPartner.status.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 font-semibold">
                        {deliveryPartner.approvalStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono">
                      Partner ID: {deliveryPartner.id} • Vehicle: {deliveryPartner.vehicleNumber}
                    </p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-2">
                      <span>City: <strong>{deliveryPartner.city}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-on-surface-variant/70" />
                        {deliveryPartner.phone}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    {getWorkloadBadge(bookingView.deliveryWorkload)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                  <div>
                    <span>Assigned At: </span>
                    <strong className="text-on-surface">
                      {assignment.deliveryPartnerAssignedAt
                        ? new Date(assignment.deliveryPartnerAssignedAt).toLocaleString()
                        : "N/A"}
                    </strong>
                  </div>
                  <div>
                    <span>Assigned By: </span>
                    <strong className="text-on-surface">
                      {assignment.assignedBy || "Admin Operations"}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-surface-container-low border border-dashed border-outline-variant/50">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-on-surface">Valet Required But Unassigned</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-3">
                  This laundry order requires a valet partner to handle garment collection and return.
                </p>
                {!isTerminal && (
                  <button
                    onClick={onOpenAssignDelivery}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold shadow-xs"
                  >
                    Assign Valet Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Customer Details, Readiness & Activity Timeline */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-3">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold block">
              Customer Details
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-on-surface">
                  {customer?.fullName || "Guest Customer"}
                </p>
                {customer?.id && (
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    Profile
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {customer?.phone && (
                <p className="text-on-surface-variant flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
                  <span>{customer.phone}</span>
                </p>
              )}

              {customer?.email && (
                <p className="text-on-surface-variant flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Operational Readiness Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Operational Readiness
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Customer Confirmed */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-on-surface font-medium">Customer Confirmation</span>
                {isCustomerConfirmed ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Cancelled
                  </span>
                )}
              </div>

              {/* Provider Assignment */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-on-surface font-medium">Service Provider</span>
                {isProviderAssigned ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                  </span>
                ) : (
                  <span className="text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Pending
                  </span>
                )}
              </div>

              {/* Valet Assignment */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-on-surface font-medium">Delivery Valet</span>
                {!deliveryRequired ? (
                  <span className="text-on-surface-variant font-medium">Not Required</span>
                ) : isDeliveryAssigned ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Pending
                  </span>
                )}
              </div>

              {/* Overall Status */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="font-bold text-on-surface">Queue Readiness</span>
                <span
                  className={`font-bold text-xs ${
                    isServiceReady
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isServiceReady ? "Ready for Dispatch" : "Needs Attention"}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Audit Trail Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Assignment Audit Trail ({activities.length})
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No assignment events recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30 text-xs">
                {activities.map((act) => (
                  <div key={act.id} className="relative">
                    {/* Timeline bullet */}
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest" />

                    <div>
                      <span className="font-semibold text-on-surface block">
                        {act.type.replace(/_/g, " ")}
                      </span>
                      <p className="text-[11px] text-on-surface-variant">
                        By <strong>{act.actorName || act.performedBy}</strong> • {new Date(act.timestamp).toLocaleString()}
                      </p>
                      {(act.notes || act.description) && (
                        <p className="text-[11px] text-on-surface bg-surface-container-low p-2 rounded-lg mt-1 border border-outline-variant/20">
                          {act.notes || act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
