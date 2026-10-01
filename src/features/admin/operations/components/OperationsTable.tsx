"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Bike,
  ExternalLink,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  OperationalBookingView,
  OperationsSortField,
  OperationsSortDirection,
  AssignmentStatus,
  WorkloadLevel,
} from "@/types/admin/operations";
import { BookingStatus } from "@/types/admin/booking";

interface OperationsTableProps {
  items: OperationalBookingView[];
  isLoading: boolean;
  searchQuery?: string;
  sort: OperationsSortField;
  sortDirection: OperationsSortDirection;
  onSort: (field: OperationsSortField) => void;
  onAssignProvider: (item: OperationalBookingView) => void;
  onReassignProvider: (item: OperationalBookingView) => void;
  onUnassignProvider?: (item: OperationalBookingView) => void;
  onAssignDeliveryPartner: (item: OperationalBookingView) => void;
  onReassignDeliveryPartner: (item: OperationalBookingView) => void;
  onUnassignDeliveryPartner?: (item: OperationalBookingView) => void;
}

export function OperationsTable({
  items,
  isLoading,
  searchQuery = "",
  sort,
  sortDirection,
  onSort,
  onAssignProvider,
  onReassignProvider,
  onAssignDeliveryPartner,
  onReassignDeliveryPartner,
}: OperationsTableProps) {
  // Helpers
  const renderSortIcon = (field: OperationsSortField) => {
    if (sort !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-on-surface-variant/40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />
    );
  };

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
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${colorClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {level} Load
      </span>
    );
  };

  const getAssignmentStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "Unassigned":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            Unassigned
          </span>
        );
      case "Provider Assigned":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <UserCheck className="w-3 h-3 text-blue-500" />
            Provider Assigned
          </span>
        );
      case "Delivery Assigned":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Bike className="w-3 h-3 text-sky-500" />
            Delivery Assigned
          </span>
        );
      case "Ready for Service":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Ready for Service
          </span>
        );
      case "In Service":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-3 h-3 text-purple-500" />
            In Service
          </span>
        );
      case "Service Completed":
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
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
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            Confirmed
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary animate-spin mb-3">
          <RefreshCw className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-on-surface">Loading operational queue...</p>
        <p className="text-xs text-on-surface-variant mt-1">
          Evaluating booking readiness, provider workloads, and delivery states.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface">
          {isSearchActive
            ? "No operational bookings match your search."
            : "No bookings require operational attention."}
        </h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
          {isSearchActive
            ? "Try adjusting your search criteria or resetting filters to view all queue items."
            : "All bookings matching your current filters have been processed or are already operating smoothly."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-on-surface-variant font-semibold select-none">
              <th
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => onSort("bookingNumber")}
              >
                <div className="flex items-center">
                  <span>Booking</span>
                  {renderSortIcon("bookingNumber")}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => onSort("customer")}
              >
                <div className="flex items-center">
                  <span>Customer & Area</span>
                  {renderSortIcon("customer")}
                </div>
              </th>
              <th className="py-3 px-4">Service</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => onSort("scheduledAt")}
              >
                <div className="flex items-center">
                  <span>Scheduled Slot</span>
                  {renderSortIcon("scheduledAt")}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => onSort("provider")}
              >
                <div className="flex items-center">
                  <span>Provider</span>
                  {renderSortIcon("provider")}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => onSort("deliveryPartner")}
              >
                <div className="flex items-center">
                  <span>Delivery Partner</span>
                  {renderSortIcon("deliveryPartner")}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => onSort("assignmentState")}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon("assignmentState")}
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {items.map((item) => {
              const booking = item.booking;
              const assignment = item.assignment;
              const customer = item.customer;
              const provider = item.provider;
              const deliveryPartner = item.deliveryPartner;

              const isLockedForProviderReassign = booking.status === "in_progress";
              const isTerminal = booking.status === "completed" || booking.status === "cancelled";

              const scheduledDateStr = new Date(booking.scheduledAt).toLocaleDateString();
              const scheduledTimeStr = new Date(booking.scheduledAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr
                  key={booking.id}
                  className="hover:bg-surface-container-high/30 transition-colors group"
                >
                  {/* Booking ID & Creation */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/admin/operations/${booking.id}`}
                      className="font-mono font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      {booking.id}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <span className="text-[11px] text-on-surface-variant block mt-0.5">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Customer & Area */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-on-surface">
                      {customer?.fullName || "Guest Customer"}
                    </div>
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-on-surface-variant/70 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {booking.address.area}, {booking.address.city}
                      </span>
                    </div>
                  </td>

                  {/* Service & Category */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-on-surface truncate max-w-[160px]" title={booking.serviceName}>
                      {booking.serviceName}
                    </div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-medium mt-0.5">
                      {booking.serviceCategory}
                    </span>
                  </td>

                  {/* Scheduled Slot */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-on-surface">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{scheduledDateStr}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-0.5">
                      <Clock className="w-3 h-3 text-on-surface-variant/70 shrink-0" />
                      <span>{scheduledTimeStr}</span>
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="py-3.5 px-4">
                    {provider ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="truncate max-w-[140px]">{provider.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getWorkloadBadge(item.providerWorkload)}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-rose-500 font-semibold text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Unassigned
                        </span>
                        {!isTerminal && (
                          <button
                            onClick={() => onAssignProvider(item)}
                            className="text-[11px] text-primary hover:underline font-medium block"
                          >
                            + Assign Now
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Delivery Partner */}
                  <td className="py-3.5 px-4">
                    {!item.deliveryRequired ? (
                      <span className="text-on-surface-variant/60 italic text-[11px]">
                        Not Required
                      </span>
                    ) : deliveryPartner ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-on-surface flex items-center gap-1.5">
                          <Bike className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate max-w-[140px]">{deliveryPartner.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getWorkloadBadge(item.deliveryWorkload)}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-amber-500 font-semibold text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Unassigned Valet
                        </span>
                        {!isTerminal && (
                          <button
                            onClick={() => onAssignDeliveryPartner(item)}
                            className="text-[11px] text-primary hover:underline font-medium block"
                          >
                            + Assign Valet
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {getAssignmentStatusBadge(assignment.status)}
                      <div>{getBookingStatusBadge(booking.status)}</div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/operations/${booking.id}`}
                        className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Open Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {/* Provider Action */}
                      {!provider && !isTerminal && (
                        <button
                          onClick={() => onAssignProvider(item)}
                          className="px-2.5 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary/90 text-[11px] font-semibold transition-colors"
                        >
                          Assign
                        </button>
                      )}

                      {provider && !isTerminal && !isLockedForProviderReassign && (
                        <button
                          onClick={() => onReassignProvider(item)}
                          className="px-2 py-1 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
                          title="Reassign Provider"
                        >
                          Reassign
                        </button>
                      )}

                      {/* Delivery Partner Action */}
                      {item.deliveryRequired && !deliveryPartner && !isTerminal && (
                        <button
                          onClick={() => onAssignDeliveryPartner(item)}
                          className="px-2 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Bike className="w-3 h-3" />
                          Valet
                        </button>
                      )}

                      {item.deliveryRequired && deliveryPartner && !isTerminal && (
                        <button
                          onClick={() => onReassignDeliveryPartner(item)}
                          className="px-2 py-1 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
                          title="Reassign Delivery Partner"
                        >
                          Valet ↻
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

      {/* Mobile / Tablet Cards View */}
      <div className="block lg:hidden space-y-3">
        {items.map((item) => {
          const booking = item.booking;
          const assignment = item.assignment;
          const customer = item.customer;
          const provider = item.provider;
          const deliveryPartner = item.deliveryPartner;

          const isLockedForProviderReassign = booking.status === "in_progress";
          const isTerminal = booking.status === "completed" || booking.status === "cancelled";

          const scheduledDateStr = new Date(booking.scheduledAt).toLocaleDateString();
          const scheduledTimeStr = new Date(booking.scheduledAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={booking.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 space-y-3 shadow-xs"
            >
              {/* Card Header: Booking ID & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/admin/operations/${booking.id}`}
                    className="font-mono font-bold text-sm text-primary hover:underline flex items-center gap-1.5"
                  >
                    {booking.id}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Created {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getAssignmentStatusBadge(assignment.status)}
                  {getBookingStatusBadge(booking.status)}
                </div>
              </div>

              {/* Service & Customer details */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-outline-variant/20">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase font-semibold">
                    Customer
                  </span>
                  <p className="font-semibold text-on-surface truncate">
                    {customer?.fullName || "Guest Customer"}
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {booking.address.area}, {booking.address.city}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase font-semibold">
                    Service
                  </span>
                  <p className="font-semibold text-on-surface truncate">{booking.serviceName}</p>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-medium">
                    {booking.serviceCategory}
                  </span>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="flex items-center justify-between text-xs bg-surface-container-low/50 p-2.5 rounded-lg">
                <div className="flex items-center gap-1.5 font-medium text-on-surface">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{scheduledDateStr}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <Clock className="w-3 h-3 text-on-surface-variant/70 shrink-0" />
                  <span>{scheduledTimeStr}</span>
                </div>
              </div>

              {/* Resource Assignments */}
              <div className="space-y-2 pt-1 border-t border-outline-variant/20 text-xs">
                {/* Provider row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="text-on-surface-variant font-medium">Provider:</span>
                    {provider ? (
                      <span className="font-semibold text-on-surface">{provider.fullName}</span>
                    ) : (
                      <span className="text-rose-500 font-semibold text-[11px]">Unassigned</span>
                    )}
                  </div>
                  <div>
                    {provider ? (
                      getWorkloadBadge(item.providerWorkload)
                    ) : !isTerminal ? (
                      <button
                        onClick={() => onAssignProvider(item)}
                        className="px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-semibold"
                      >
                        Assign
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Delivery row */}
                {item.deliveryRequired && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5 text-on-surface-variant" />
                      <span className="text-on-surface-variant font-medium">Valet:</span>
                      {deliveryPartner ? (
                        <span className="font-semibold text-on-surface">{deliveryPartner.fullName}</span>
                      ) : (
                        <span className="text-amber-500 font-semibold text-[11px]">Unassigned</span>
                      )}
                    </div>
                    <div>
                      {deliveryPartner ? (
                        getWorkloadBadge(item.deliveryWorkload)
                      ) : !isTerminal ? (
                        <button
                          onClick={() => onAssignDeliveryPartner(item)}
                          className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-semibold"
                        >
                          Assign Valet
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <Link
                  href={`/admin/operations/${booking.id}`}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  View Details
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  {provider && !isTerminal && !isLockedForProviderReassign && (
                    <button
                      onClick={() => onReassignProvider(item)}
                      className="px-2.5 py-1 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-on-surface text-[11px] font-medium"
                    >
                      Reassign
                    </button>
                  )}
                  {item.deliveryRequired && deliveryPartner && !isTerminal && (
                    <button
                      onClick={() => onReassignDeliveryPartner(item)}
                      className="px-2.5 py-1 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-on-surface text-[11px] font-medium"
                    >
                      Valet ↻
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
