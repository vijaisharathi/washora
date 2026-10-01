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
  Activity,
  CheckCheck,
  ShoppingBag,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  BookingOrder,
  BookingSortDirection,
  BookingSortField,
  BookingStatus,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BookingTableProps {
  bookings: BookingOrder[];
  sort: BookingSortField;
  sortDirection: BookingSortDirection;
  onSortChange: (field: BookingSortField) => void;
  onEditBooking: (booking: BookingOrder) => void;
  onUpdateStatus: (booking: BookingOrder) => void;
  isLoading?: boolean;
}

export function BookingTable({
  bookings,
  sort,
  sortDirection,
  onSortChange,
  onEditBooking,
  onUpdateStatus,
  isLoading = false,
}: BookingTableProps) {
  // Sort icon renderer
  const renderSortIcon = (field: BookingSortField) => {
    if (sort !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-outline opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  // Status badge renderer
  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-medium text-[11px]">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 font-medium text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Confirmed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30 font-medium text-[11px]">
            <Activity className="w-3 h-3 text-purple-500" />
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-medium text-[11px]">
            <CheckCheck className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 font-medium text-[11px]">
            <XCircle className="w-3 h-3 text-rose-500" />
            Cancelled
          </span>
        );
    }
  };

  // Format date and time
  const formatSchedule = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return { datePart, timePart };
    } catch {
      return { datePart: isoString, timePart: "" };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">Loading orders & bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-outline mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">
          No Bookings Found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm">
          No bookings match your active search query or filter criteria. Try clearing or relaxing your filters.
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
              {/* Booking */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("bookingNumber")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Booking / Order</span>
                  {renderSortIcon("bookingNumber")}
                </button>
              </th>

              {/* Customer */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("customerName")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Customer</span>
                  {renderSortIcon("customerName")}
                </button>
              </th>

              {/* Provider */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("providerName")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Provider</span>
                  {renderSortIcon("providerName")}
                </button>
              </th>

              {/* Service */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("serviceName")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Service</span>
                  {renderSortIcon("serviceName")}
                </button>
              </th>

              {/* Scheduled Date */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("scheduledAt")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Scheduled Date</span>
                  {renderSortIcon("scheduledAt")}
                </button>
              </th>

              {/* Location */}
              <th className="py-3.5 px-4">Location</th>

              {/* Amount */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("totalAmount")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Total (INR)</span>
                  {renderSortIcon("totalAmount")}
                </button>
              </th>

              {/* Status */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("status")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Status</span>
                  {renderSortIcon("status")}
                </button>
              </th>

              {/* Actions */}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-variant/30 text-xs">
            {bookings.map((booking) => {
              const { datePart, timePart } = formatSchedule(booking.scheduledAt);
              const isTerminal =
                booking.status === "completed" || booking.status === "cancelled";

              return (
                <tr
                  key={booking.id}
                  className="hover:bg-surface-container-high/40 transition-colors group"
                >
                  {/* Booking Identity */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="font-mono font-semibold text-primary hover:underline"
                      >
                        {booking.bookingNumber}
                      </Link>
                      <span className="text-[10px] text-outline font-mono">
                        {booking.id} • Created {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/customers/${booking.customerId}`}
                        className="font-medium text-on-surface hover:text-primary transition-colors"
                      >
                        {booking.customerId}
                      </Link>
                      <span className="text-[11px] text-on-surface-variant">
                        Customer Record
                      </span>
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/providers/${booking.providerId}`}
                        className="font-medium text-on-surface hover:text-primary transition-colors"
                      >
                        {booking.providerId}
                      </Link>
                      <span className="text-[11px] text-on-surface-variant">
                        Provider Hub
                      </span>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">
                        {booking.serviceName}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {booking.serviceCategory} • Qty: {booking.quantity}
                      </span>
                    </div>
                  </td>

                  {/* Scheduled Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-outline" />
                        {datePart}
                      </span>
                      <span className="text-[10px] text-outline font-mono">
                        {timePart}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
                      <span>
                        {booking.address.area}, {booking.address.city}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface font-mono">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                      <span className="text-[10px] text-outline font-mono">
                        Fee: {formatCurrency(booking.serviceFee)}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {renderStatusBadge(booking.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => onEditBooking(booking)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                        title="Edit schedule & notes"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {!isTerminal && (
                        <button
                          onClick={() => onUpdateStatus(booking)}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          title="Transition order status"
                        >
                          Lifecycle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Compact Cards View */}
      <div className="block lg:hidden divide-y divide-surface-variant/30">
        {bookings.map((booking) => {
          const { datePart, timePart } = formatSchedule(booking.scheduledAt);
          const isTerminal =
            booking.status === "completed" || booking.status === "cancelled";

          return (
            <div
              key={`mobile-${booking.id}`}
              className="p-4 flex flex-col gap-3 hover:bg-surface-container-high/30 transition-colors"
            >
              {/* Card Header: Booking # & Status */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-mono font-bold text-sm text-primary hover:underline"
                  >
                    {booking.bookingNumber}
                  </Link>
                  <span className="text-[10px] text-outline font-mono">
                    {booking.id}
                  </span>
                </div>
                {renderStatusBadge(booking.status)}
              </div>

              {/* Service & Total */}
              <div className="flex items-center justify-between bg-surface-container/50 p-2.5 rounded-lg border border-surface-variant/30">
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-on-surface">
                    {booking.serviceName}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {booking.serviceCategory} • Qty: {booking.quantity}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-on-surface font-mono">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Key Details: Customer, Provider, Schedule, Location */}
              <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-outline shrink-0" />
                  <span>
                    {datePart} ({timePart})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
                  <span className="truncate">
                    {booking.address.area}, {booking.address.city}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-outline">Customer:</span>
                  <Link
                    href={`/admin/customers/${booking.customerId}`}
                    className="text-on-surface hover:text-primary font-mono truncate"
                  >
                    {booking.customerId}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-outline">Provider:</span>
                  <Link
                    href={`/admin/providers/${booking.providerId}`}
                    className="text-on-surface hover:text-primary font-mono truncate"
                  >
                    {booking.providerId}
                  </Link>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-variant/30">
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditBooking(booking)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-surface-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Edit
                  </button>

                  {!isTerminal && (
                    <button
                      onClick={() => onUpdateStatus(booking)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                    >
                      Lifecycle
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
