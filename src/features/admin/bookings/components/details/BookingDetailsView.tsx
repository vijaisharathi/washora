"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Activity,
  XCircle,
  CheckCheck,
  User,
  Store,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Info,
} from "lucide-react";
import {
  BookingOrder,
  BookingActivity,
  BookingStatus,
  BookingEditFormValues,
  Customer,
  Provider,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookingEditModal } from "../BookingEditModal";
import { BookingStatusActionDialog } from "../BookingStatusActionDialog";

interface BookingDetailsViewProps {
  booking: BookingOrder | null;
  customer: Customer | null;
  provider: Provider | null;
  activities: BookingActivity[];
  isLoading?: boolean;
  onUpdateBooking: (
    bookingId: string,
    payload: BookingEditFormValues
  ) => Promise<BookingOrder>;
  onUpdateStatus: (
    bookingId: string,
    newStatus: BookingStatus,
    reason?: string
  ) => Promise<BookingOrder>;
}

export function BookingDetailsView({
  booking,
  customer,
  provider,
  activities,
  isLoading = false,
  onUpdateBooking,
  onUpdateStatus,
}: BookingDetailsViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">
          Loading booking details...
        </p>
      </div>
    );
  }

  // Direct-ID Isolation: Not Found State (Booking does not exist or belongs to another organization)
  if (!booking) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-critical/30 rounded-xl p-8 text-center flex flex-col items-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-critical/15 text-critical flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
            Booking Record Not Found
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            The requested booking identifier does not exist or does not belong to your active organization workspace. Cross-organization order inspection is strictly blocked.
          </p>
          <Link
            href="/admin/bookings"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookings & Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Pending Operational Confirmation
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            Confirmed for Fulfillment
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30 font-semibold text-xs">
            <Activity className="w-3.5 h-3.5 text-purple-500" />
            In Progress (Workshop Processing)
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-semibold text-xs">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            Completed (Delivered)
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 font-semibold text-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Cancelled (Terminated)
          </span>
        );
    }
  };

  const isTerminal =
    booking.status === "completed" || booking.status === "cancelled";

  // Date and Time formatting
  const scheduleDateObj = new Date(booking.scheduledAt);
  const formattedScheduleDate = scheduleDateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedScheduleTime = scheduleDateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Link href="/admin" className="hover:text-on-surface transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/admin/bookings"
          className="hover:text-on-surface transition-colors"
        >
          Bookings & Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-on-surface font-mono font-medium">
          {booking.bookingNumber}
        </span>
      </nav>

      {/* 2. Top Header & Action Strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono text-on-surface">
              {booking.bookingNumber}
            </h1>
            {renderStatusBadge(booking.status)}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-outline font-mono">
              {booking.id}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Created on {formatDate(booking.createdAt)} • Last updated{" "}
            {formatDate(booking.updatedAt)}
            {booking.lastUpdatedBy && ` by ${booking.lastUpdatedBy}`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="border-surface-variant hover:bg-surface-container text-on-surface flex items-center gap-2 text-xs"
          >
            <Edit2 className="w-4 h-4 text-primary" />
            <span>Edit Details</span>
          </Button>

          {!isTerminal && (
            <Button
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-on-primary flex items-center gap-2 text-xs font-semibold"
            >
              <Activity className="w-4 h-4" />
              <span>Lifecycle Actions</span>
            </Button>
          )}

          <Link
            href="/admin/bookings"
            className="p-2 rounded-lg border border-surface-variant hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3. Primary Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary, Service & Address (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bento Card: Order & Service Summary */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-outline flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Service & Order Specifications</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {booking.serviceCategory}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container/50 border border-surface-variant/30 flex flex-col gap-1">
                <span className="text-[11px] text-outline uppercase font-semibold">
                  Service Name
                </span>
                <span className="text-base font-bold text-on-surface">
                  {booking.serviceName}
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  Ref ID: {booking.serviceId}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container/50 border border-surface-variant/30 flex flex-col gap-1">
                <span className="text-[11px] text-outline uppercase font-semibold">
                  Quantity / Workload
                </span>
                <span className="text-base font-bold text-on-surface">
                  {booking.quantity} Unit{booking.quantity > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-on-surface-variant">
                  Operational Standard Garment Batch
                </span>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="p-4 rounded-xl bg-surface-container/50 border border-surface-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-outline uppercase font-semibold block">
                    Execution Schedule
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    {formattedScheduleDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high border border-surface-variant text-xs font-mono text-on-surface">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Slot: {formattedScheduleTime}</span>
              </div>
            </div>

            {/* Fulfillment Address */}
            <div className="space-y-2">
              <span className="text-[11px] text-outline uppercase font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Service Address</span>
              </span>
              <div className="p-4 rounded-xl bg-surface-container/50 border border-surface-variant/30 space-y-1 text-xs">
                <p className="font-semibold text-on-surface text-sm">
                  {booking.address.addressLine1}
                </p>
                {booking.address.addressLine2 && (
                  <p className="text-on-surface-variant">
                    {booking.address.addressLine2}
                  </p>
                )}
                <p className="text-on-surface-variant">
                  {booking.address.area}, {booking.address.city},{" "}
                  {booking.address.state} —{" "}
                  <span className="font-mono font-semibold">
                    {booking.address.postalCode}
                  </span>
                </p>
                {booking.address.landmark && (
                  <p className="text-outline text-[11px] pt-1">
                    Landmark: {booking.address.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Notes */}
            <div className="space-y-2">
              <span className="text-[11px] text-outline uppercase font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Customer Instructions / Notes</span>
              </span>
              <div className="p-4 rounded-xl bg-surface-container/40 border border-surface-variant/30 text-xs text-on-surface">
                {booking.customerNotes ? (
                  <p className="italic leading-relaxed">
                    &ldquo;{booking.customerNotes}&rdquo;
                  </p>
                ) : (
                  <p className="text-outline italic">No customer notes provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bento Card: Canonical Customer & Provider References */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Reference */}
            <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" />
                    <span>Customer Record (A4)</span>
                  </span>
                  <Link
                    href={`/admin/customers/${booking.customerId}`}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {customer ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-sm font-bold text-on-surface">
                      {customer.fullName}
                    </p>
                    <p className="text-on-surface-variant font-mono">
                      {customer.email}
                    </p>
                    <p className="text-on-surface-variant font-mono">
                      {customer.phone}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-[10px] font-mono text-outline">
                      ID: {customer.id} • City: {customer.city}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-surface-container border border-surface-variant/40 text-xs text-on-surface-variant flex items-center gap-2">
                    <Info className="w-4 h-4 text-outline" />
                    <span>Customer record unavailable ({booking.customerId})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Provider Reference */}
            <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-primary" />
                    <span>Provider Hub (A5)</span>
                  </span>
                  <Link
                    href={`/admin/providers/${booking.providerId}`}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Hub</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {provider ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-sm font-bold text-on-surface">
                      {provider.businessName}
                    </p>
                    <p className="text-on-surface-variant">
                      Contact: {provider.fullName}
                    </p>
                    <p className="text-on-surface-variant font-mono">
                      {provider.phone}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-[10px] font-mono text-outline">
                      ID: {provider.id} • Rating: ★ {provider.rating}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-surface-container border border-surface-variant/40 text-xs text-on-surface-variant flex items-center gap-2">
                    <Info className="w-4 h-4 text-outline" />
                    <span>Provider hub unavailable ({booking.providerId})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Activity Timeline */}
        <div className="space-y-6">
          {/* Bento Card: Financial Breakdown */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-outline border-b border-surface-variant/30 pb-3">
              Order Pricing Breakdown
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Subtotal (Garment Care)</span>
                <span className="font-mono text-on-surface">
                  {formatCurrency(booking.subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Platform & Service Fee</span>
                <span className="font-mono text-on-surface">
                  {formatCurrency(booking.serviceFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-surface-variant/40 flex justify-between items-baseline">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Total (INR)
                </span>
                <span className="text-xl font-bold font-mono text-primary">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-outline pt-2 border-t border-surface-variant/20">
              Pricing verified: subtotal + service fee = ₹
              {booking.subtotal + booking.serviceFee} (Matches Total). Payments & settlements handled in A10.
            </p>
          </div>

          {/* Bento Card: Activity Audit Timeline */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-outline flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Audit Activity Trail</span>
              </h2>
              <span className="text-[11px] text-outline font-mono">
                {activities.length} Events
              </span>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                No activity records logged.
              </p>
            ) : (
              <div className="space-y-4 pt-1">
                {activities.map((act, index) => (
                  <div key={act.id} className="relative pl-6 pb-2 group">
                    {/* Vertical connecting line */}
                    {index < activities.length - 1 && (
                      <div className="absolute left-2.5 top-3.5 bottom-0 w-0.5 bg-surface-variant/60" />
                    )}

                    {/* Timeline bullet dot */}
                    <div className="absolute left-1 top-1.5 w-3.5 h-3.5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center" />

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-on-surface capitalize">
                          {act.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-outline font-mono">
                          {formatDate(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {act.description}
                      </p>
                      {act.actorName && (
                        <span className="text-[10px] text-outline font-mono">
                          By: {act.actorName}
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

      {/* Edit Booking Modal */}
      {editModalOpen && (
        <BookingEditModal
          isOpen={editModalOpen}
          booking={booking}
          onClose={() => setEditModalOpen(false)}
          onSave={async (id, payload) => {
            const updated = await onUpdateBooking(id, payload);
            showToast(
              `Order ${updated.bookingNumber} details updated successfully.`
            );
            return updated;
          }}
        />
      )}

      {/* Status Lifecycle Transition Modal */}
      {statusModalOpen && (
        <BookingStatusActionDialog
          isOpen={statusModalOpen}
          booking={booking}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={async (id, newStatus, reason) => {
            const updated = await onUpdateStatus(id, newStatus, reason);
            showToast(
              `Order ${updated.bookingNumber} transitioned to ${newStatus.toUpperCase()}.`
            );
            return updated;
          }}
        />
      )}

      {/* Feedback Toast */}
      {feedbackToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-container-lowest border border-primary/40 rounded-xl shadow-2xl text-xs text-on-surface animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
}
