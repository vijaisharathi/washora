"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Edit,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Clock,
  ArrowLeft,
  AlertCircle,
  Activity,
} from "lucide-react";
import { Customer, CustomerActivity, CustomerStatus, UpdateCustomerPayload } from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CustomerEditModal } from "../CustomerEditModal";
import { CustomerStatusModal } from "../CustomerStatusModal";

interface CustomerDetailsViewProps {
  customer: Customer | null;
  activities: CustomerActivity[];
  isLoading?: boolean;
  onUpdateCustomer: (
    customerId: string,
    payload: UpdateCustomerPayload
  ) => Promise<Customer>;
  onUpdateStatus: (
    customerId: string,
    status: CustomerStatus,
    reason?: string
  ) => Promise<Customer>;
}

export function CustomerDetailsView({
  customer,
  activities,
  isLoading = false,
  onUpdateCustomer,
  onUpdateStatus,
}: CustomerDetailsViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">Loading customer profile...</p>
      </div>
    );
  }

  // Not Found State (Customer ID doesn't exist or belongs to another organization)
  if (!customer) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-critical/30 rounded-xl p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-critical/15 text-critical flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
            Customer Record Not Found
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            The requested customer identifier does not exist or does not belong to your active organization workspace. Direct access to cross-organization records is restricted.
          </p>
          <Link
            href="/admin/customers"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Customers Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const avgOrderValue =
    customer.totalBookings > 0
      ? Math.round(customer.totalSpend / customer.totalBookings)
      : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center text-xs text-on-surface-variant gap-2">
          <Link
            href="/admin/customers"
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customers</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span className="text-on-surface font-semibold">{customer.fullName}</span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
            {customer.id}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="bg-surface-container-high border-outline-variant hover:bg-surface-container-highest text-on-surface flex items-center gap-2 text-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            className="bg-surface-container-highest border border-warning/40 text-warning hover:bg-surface-container-high flex items-center gap-2 text-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Change Status</span>
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hero / Identity Bento Card (Span 4) */}
        <div className="lg:col-span-4 bg-surface-container-low border border-surface-variant/60 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle gradient banner */}
          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

          {/* Profile Avatar with status indicator */}
          <div className="relative w-28 h-28 rounded-full border-4 border-surface-container-lowest overflow-hidden mb-4 shadow-xl z-10">
            {customer.profileImage ? (
              <img
                src={customer.profileImage}
                alt={customer.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl">
                {getInitials(customer.fullName)}
              </div>
            )}
            <div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-surface-container-lowest z-20 ${
                customer.status === "active"
                  ? "bg-success"
                  : customer.status === "suspended"
                  ? "bg-critical"
                  : "bg-outline"
              }`}
              title={`Status: ${customer.status}`}
            />
          </div>

          <h2 className="font-headline-lg text-xl font-bold text-on-surface mb-0.5 z-10">
            {customer.fullName}
          </h2>
          <p className="font-mono text-xs text-on-surface-variant mb-3 z-10">
            {customer.id} • {customer.organizationId}
          </p>

          <div className="flex items-center gap-2 mb-6 z-10">
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                customer.status === "active"
                  ? "bg-success/15 text-success border-success/30"
                  : customer.status === "suspended"
                  ? "bg-critical/15 text-critical border-critical/30"
                  : "bg-surface-container-highest text-on-surface-variant border-outline-variant/50"
              }`}
            >
              {customer.status}
            </span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-outline" />
              Joined {formatDate(customer.joinedAt)}
            </span>
          </div>

          {/* Contact Details List with Copy Action */}
          <div className="w-full mt-auto pt-5 border-t border-surface-variant/40 flex flex-col gap-2.5 z-10 text-xs text-left">
            {/* Phone */}
            <div
              onClick={() => copyToClipboard(customer.phone, "phone")}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-surface-variant/50 hover:border-primary/50 transition-colors cursor-pointer group"
              title="Click to copy phone"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Phone className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span className="font-mono truncate">{customer.phone}</span>
              </div>
              <span className="text-[10px] text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedField === "phone" ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span className="text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </span>
            </div>

            {/* Email */}
            <div
              onClick={() => copyToClipboard(customer.email, "email")}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-surface-variant/50 hover:border-primary/50 transition-colors cursor-pointer group"
              title="Click to copy email"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Mail className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span className="font-mono truncate">{customer.email}</span>
              </div>
              <span className="text-[10px] text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedField === "email" ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span className="text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </span>
            </div>

            {/* City */}
            {customer.city && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-surface-variant/50">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-on-surface-variant shrink-0" />
                  <span>{customer.city}, India</span>
                </div>
                <span className="text-[10px] text-outline">Service Zone</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Account Metrics & Activity Stream (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Summary Grid (4 Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                Total Bookings
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-display text-on-surface">
                  {customer.totalBookings}
                </span>
                <ShoppingBag className="w-4 h-4 text-primary opacity-60" />
              </div>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                Completed / Cancelled
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-display text-success">
                  {customer.completedBookings}
                </span>
                <span className="text-lg text-outline font-display">/</span>
                <span className="text-2xl font-bold font-display text-critical">
                  {customer.cancelledBookings}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                Total Spend
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-on-surface">
                  {formatCurrency(customer.totalSpend)}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                Avg. Order Value
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-on-surface">
                  {formatCurrency(avgOrderValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Operational Activity Stream */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-variant/40">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-headline-md text-sm font-bold text-on-surface">
                  Operational Activity History
                </h3>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                {activities.length} Recorded Events
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Clock className="w-8 h-8 text-outline mb-2" />
                <p className="text-xs font-semibold text-on-surface">No activity yet.</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  This customer account has not performed any booking or account transactions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div
                    key={activity.id || idx}
                    className="relative pl-6 pb-4 border-l border-surface-variant/60 last:border-l-0 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-low" />

                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-on-surface">
                        {activity.description}
                      </p>
                      <span className="text-[11px] text-on-surface-variant font-mono whitespace-nowrap">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[10px]">
                        {activity.status}
                      </span>
                      {activity.actorName && (
                        <span>Actor: {activity.actorName}</span>
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
      <CustomerEditModal
        isOpen={editModalOpen}
        customer={customer}
        onClose={() => setEditModalOpen(false)}
        onSave={onUpdateCustomer}
      />

      <CustomerStatusModal
        isOpen={statusModalOpen}
        customer={customer}
        onClose={() => setStatusModalOpen(false)}
        onConfirmStatus={onUpdateStatus}
      />
    </div>
  );
}
