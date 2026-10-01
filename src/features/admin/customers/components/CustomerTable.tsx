"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  Customer,
  CustomerSortDirection,
  CustomerSortField,
  CustomerStatus,
} from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerTableProps {
  customers: Customer[];
  sort: CustomerSortField;
  sortDirection: CustomerSortDirection;
  onSortChange: (field: CustomerSortField) => void;
  onEditCustomer: (customer: Customer) => void;
  onChangeStatus: (customer: Customer) => void;
  isLoading?: boolean;
}

export function CustomerTable({
  customers,
  sort,
  sortDirection,
  onSortChange,
  onEditCustomer,
  onChangeStatus,
  isLoading = false,
}: CustomerTableProps) {
  // Render sort direction icon helper
  const renderSortIcon = (field: CustomerSortField) => {
    if (sort !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-outline opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-semibold text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            ACTIVE
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-critical/15 text-critical border border-critical/30 font-semibold text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-critical" />
            SUSPENDED
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant/50 font-medium text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            INACTIVE
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
        <p className="text-xs text-on-surface-variant">Loading customer records...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-outline mb-3">
          <Phone className="w-6 h-6" />
        </div>
        <h3 className="font-headline-md text-base font-bold text-on-surface mb-1">
          No customers found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm">
          No customer records match the specified search or filter criteria. Try resetting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl overflow-hidden flex flex-col">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left whitespace-nowrap min-w-[950px]">
          <thead className="bg-surface-container border-b border-surface-variant text-[11px] font-semibold text-outline uppercase tracking-wider">
            <tr>
              <th
                onClick={() => onSortChange("name")}
                className="px-4 py-3 cursor-pointer hover:text-on-surface transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Customer</span>
                  {renderSortIcon("name")}
                </div>
              </th>
              <th className="px-4 py-3">Customer ID</th>
              <th className="px-4 py-3">Contact</th>
              <th
                onClick={() => onSortChange("totalBookings")}
                className="px-4 py-3 text-right cursor-pointer hover:text-on-surface transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Bookings</span>
                  {renderSortIcon("totalBookings")}
                </div>
              </th>
              <th
                onClick={() => onSortChange("totalSpend")}
                className="px-4 py-3 text-right cursor-pointer hover:text-on-surface transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Spend</span>
                  {renderSortIcon("totalSpend")}
                </div>
              </th>
              <th
                onClick={() => onSortChange("lastBookingAt")}
                className="px-4 py-3 cursor-pointer hover:text-on-surface transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Booking</span>
                  {renderSortIcon("lastBookingAt")}
                </div>
              </th>
              <th
                onClick={() => onSortChange("status")}
                className="px-4 py-3 cursor-pointer hover:text-on-surface transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </th>
              <th
                onClick={() => onSortChange("joinedAt")}
                className="px-4 py-3 cursor-pointer hover:text-on-surface transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Joined</span>
                  {renderSortIcon("joinedAt")}
                </div>
              </th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/40 text-xs text-on-surface">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-surface-container-high/40 transition-colors group"
              >
                {/* Customer Column */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {customer.profileImage ? (
                      <img
                        src={customer.profileImage}
                        alt={customer.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-outline-variant/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                        {getInitials(customer.fullName)}
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-semibold text-on-surface hover:text-primary transition-colors block"
                      >
                        {customer.fullName}
                      </Link>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {customer.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Customer ID */}
                <td className="px-4 py-3.5 font-mono text-xs text-on-surface-variant">
                  {customer.id}
                </td>

                {/* Contact (Phone & City) */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-on-surface">{customer.phone}</span>
                    {customer.city && (
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {customer.city}
                      </span>
                    )}
                  </div>
                </td>

                {/* Orders / Bookings */}
                <td className="px-4 py-3.5 text-right font-medium">
                  {customer.totalBookings}
                </td>

                {/* Total Spend */}
                <td className="px-4 py-3.5 text-right font-mono font-semibold text-on-surface">
                  {formatCurrency(customer.totalSpend)}
                </td>

                {/* Last Booking */}
                <td className="px-4 py-3.5 text-on-surface-variant">
                  {customer.lastBookingAt ? formatDate(customer.lastBookingAt) : "—"}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5">{renderStatusBadge(customer.status)}</td>

                {/* Joined Date */}
                <td className="px-4 py-3.5 text-on-surface-variant">
                  {formatDate(customer.joinedAt)}
                </td>

                {/* Row Actions */}
                <td className="px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                      title="View Customer Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEditCustomer(customer)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                      title="Edit Customer Info"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onChangeStatus(customer)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-warning hover:bg-surface-container-highest transition-colors"
                      title="Manage Status"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden divide-y divide-surface-variant/40">
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {customer.profileImage ? (
                  <img
                    src={customer.profileImage}
                    alt={customer.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                    {getInitials(customer.fullName)}
                  </div>
                )}
                <div>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-semibold text-sm text-on-surface hover:text-primary transition-colors block"
                  >
                    {customer.fullName}
                  </Link>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {customer.id}
                  </span>
                </div>
              </div>

              {renderStatusBadge(customer.status)}
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-on-surface-variant truncate">
                <Mail className="w-3 h-3 text-outline shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Phone className="w-3 h-3 text-outline shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Calendar className="w-3 h-3 text-outline shrink-0" />
                <span>Joined {formatDate(customer.joinedAt)}</span>
              </div>
              {customer.city && (
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <MapPin className="w-3 h-3 text-outline shrink-0" />
                  <span>{customer.city}</span>
                </div>
              )}
            </div>

            {/* Metrics Row */}
            <div className="flex items-center justify-between text-xs px-1">
              <div>
                <span className="text-outline text-[11px] block uppercase">Bookings</span>
                <span className="font-semibold text-on-surface">{customer.totalBookings} orders</span>
              </div>
              <div className="text-right">
                <span className="text-outline text-[11px] block uppercase">Total Spend</span>
                <span className="font-mono font-bold text-on-surface">
                  {formatCurrency(customer.totalSpend)}
                </span>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant/30">
              <Link
                href={`/admin/customers/${customer.id}`}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/60 text-xs font-medium text-on-surface flex items-center gap-1 hover:bg-surface-container-highest"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>
              <button
                onClick={() => onEditCustomer(customer)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/60 text-xs font-medium text-on-surface flex items-center gap-1 hover:bg-surface-container-highest"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onChangeStatus(customer)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/60 text-xs font-medium text-warning flex items-center gap-1 hover:bg-surface-container-highest"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Status</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
