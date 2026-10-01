"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Edit2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Archive,
  Star,
  Layers,
  Sparkles,
  Home,
  ChefHat,
  Bath,
  Armchair,
  WashingMachine,
  Tv,
  Copy,
  Info,
  ShieldAlert,
  Calendar,
  DollarSign,
  TrendingUp,
  Sliders,
  History,
} from "lucide-react";
import {
  Service,
  ServiceActivity,
  ServiceCategory,
  ServiceStatus,
  formatDuration,
} from "@/types/admin/serviceCatalog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ServiceStatusDialog } from "../ServiceStatusDialog";

interface ServiceDetailsViewProps {
  service: Service | null;
  activities: ServiceActivity[];
  isLoading?: boolean;
  onUpdateStatus: (
    serviceId: string,
    newStatus: ServiceStatus,
    reason?: string
  ) => Promise<Service>;
}

export function ServiceDetailsView({
  service,
  activities,
  isLoading = false,
  onUpdateStatus,
}: ServiceDetailsViewProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
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

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case "Home Cleaning":
        return <Home className="w-5 h-5 text-sky-400" />;
      case "Deep Cleaning":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case "Kitchen Cleaning":
        return <ChefHat className="w-5 h-5 text-orange-400" />;
      case "Bathroom Cleaning":
        return <Bath className="w-5 h-5 text-cyan-400" />;
      case "Sofa Cleaning":
        return <Armchair className="w-5 h-5 text-indigo-400" />;
      case "Carpet Cleaning":
        return <Layers className="w-5 h-5 text-teal-400" />;
      case "Laundry":
        return <WashingMachine className="w-5 h-5 text-blue-400" />;
      case "Appliance Cleaning":
        return <Tv className="w-5 h-5 text-rose-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">
          Loading service specifications...
        </p>
      </div>
    );
  }

  // Cross-organization Isolation / Not Found guard
  if (!service) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="bg-surface-container-low border border-critical/30 rounded-xl p-8 text-center flex flex-col items-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-critical/15 text-critical flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">
            Service Record Not Found
          </h2>
          <p className="text-xs text-on-surface-variant max-w-md mb-6">
            The requested service identifier does not exist or does not belong to your active organization workspace. Cross-organization catalog inspection is strictly blocked.
          </p>
          <Link
            href="/admin/services"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isArchived = service.status === "Archived";

  const renderStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Active for Discovery & Booking
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Inactive (Discovery Paused)
          </span>
        );
      case "Archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-outline border border-outline/30 font-semibold text-xs">
            <Archive className="w-3.5 h-3.5 text-outline" />
            Permanently Archived (Terminal)
          </span>
        );
    }
  };

  const handleStatusConfirm = async (
    serviceId: string,
    newStatus: ServiceStatus,
    reason?: string
  ) => {
    const updated = await onUpdateStatus(serviceId, newStatus, reason);
    showToast(`Service status updated to ${newStatus}.`);
    return updated;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-outline"
      >
        <Link
          href="/admin/services"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Services Catalog</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface font-medium truncate max-w-xs">
          {service.name}
        </span>
      </nav>

      {/* 2. Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low border border-surface-variant/50 p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-surface-variant/60 shadow-inner">
            {getCategoryIcon(service.category)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                {service.name}
              </h1>
              {renderStatusBadge(service.status)}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-outline">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-primary font-medium">{service.id}</span>
                <button
                  onClick={() => copyToClipboard(service.id, "serviceId")}
                  aria-label="Copy Service ID"
                  className="hover:text-on-surface transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {copiedField === "serviceId" && (
                  <span className="text-[10px] text-emerald-400 font-sans">
                    Copied!
                  </span>
                )}
              </div>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-on-surface-variant">
                <span>{service.category}</span>
              </span>
              <span>•</span>
              <span className="text-on-surface-variant">
                Org: <strong className="font-mono text-on-surface">{service.organizationId}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/services"
            className="px-3.5 py-2 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Services</span>
          </Link>

          {!isArchived && (
            <>
              <Link
                href={`/admin/services/${service.id}/edit`}
                className="px-3.5 py-2 rounded-xl border border-surface-variant bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Service</span>
              </Link>

              <Button
                onClick={() => setStatusDialogOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Change Status</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 3. Bento Grid Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main 2-Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview & Descriptions */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
              <Info className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                Service Overview & Catalog Descriptions
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-medium text-outline uppercase tracking-wider block mb-1">
                  Short Description (Cards & Discovery Listings)
                </span>
                <p className="text-xs text-on-surface bg-surface-container/60 border border-surface-variant/40 rounded-xl p-3 leading-relaxed">
                  {service.shortDescription}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-outline uppercase tracking-wider block mb-1">
                  Full Description & Scope of Work
                </span>
                <p className="text-xs text-on-surface-variant bg-surface-container/60 border border-surface-variant/40 rounded-xl p-3 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Quantities Card */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                  Pricing Structure & Quantity Bounds
                </h2>
              </div>
              <span className="text-[11px] text-outline">
                displayPrice = basePrice + serviceFee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Base Price */}
              <div className="bg-surface-container/50 border border-surface-variant/40 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-outline uppercase">
                  Base Price
                </span>
                <span className="text-lg font-bold text-on-surface mt-1">
                  {formatCurrency(service.basePrice)}
                </span>
                <span className="text-[10px] text-outline mt-1">
                  Standard fulfillment baseline
                </span>
              </div>

              {/* Service Fee */}
              <div className="bg-surface-container/50 border border-surface-variant/40 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-outline uppercase">
                  Platform Fee
                </span>
                <span className="text-lg font-bold text-on-surface mt-1">
                  {formatCurrency(service.serviceFee)}
                </span>
                <span className="text-[10px] text-outline mt-1">
                  Operational handling & safety
                </span>
              </div>

              {/* Total Display Price */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-emerald-400 uppercase">
                  Display Price (Customer Total)
                </span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(service.displayPrice ?? (service.basePrice + service.serviceFee))}
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-1">
                  Per booking / unit
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-surface-container/40 border border-surface-variant/30 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-outline">Minimum Order Quantity</span>
                <span className="text-sm font-semibold text-on-surface">
                  {service.minQuantity} unit{service.minQuantity > 1 ? "s" : ""}
                </span>
              </div>
              <div className="bg-surface-container/40 border border-surface-variant/30 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-outline">Maximum Order Quantity</span>
                <span className="text-sm font-semibold text-on-surface">
                  {service.maxQuantity} unit{service.maxQuantity > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Configuration */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                Operational & Slot Scheduling Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container border border-surface-variant/40 flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-on-surface block">
                    Execution Duration
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {formatDuration(service.durationMinutes)}
                  </span>
                  <p className="text-[11px] text-outline mt-1">
                    Standard provider job allocation time ({service.durationMinutes} minutes required per unit).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-surface-variant/40 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-on-surface block">
                    Slot Dispatch Rule
                  </span>
                  <span className="text-xs font-medium text-on-surface">
                    Real-time concurrency lock
                  </span>
                  <p className="text-[11px] text-outline mt-1">
                    Prevents overbooking on matched service partner facilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit History & Activity Trail */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                  Service Audit & Change Log
                </h2>
              </div>
              <span className="text-[11px] text-outline">
                {activities.length} record{activities.length !== 1 ? "s" : ""}
              </span>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-outline italic py-2">
                No activity logs recorded for this service.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-variant/60">
                {activities.map((act) => (
                  <div key={act.id} className="relative group text-xs">
                    <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-low" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-on-surface capitalize">
                        {act.action || act.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-outline font-mono">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {act.details || act.description}
                    </p>
                    <span className="text-[10px] text-outline/80 mt-1 block">
                      Actor: <strong className="text-on-surface font-medium">{act.actorName || act.performedBy}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Secondary 1-Column */}
        <div className="space-y-6">
          {/* Performance & Metrics Bento Card */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                Catalog Performance
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-variant/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-outline uppercase block">
                    Total Bookings
                  </span>
                  <span className="text-lg font-bold text-on-surface">
                    {service.totalBookings}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-outline uppercase block">
                    Active Orders
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {service.activeBookings}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-variant/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-outline uppercase block">
                    Customer Rating
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold text-on-surface">
                      {service.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-outline">/ 5.0</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-outline uppercase block">
                    Estimated Volume
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatCurrency(
                      service.totalBookings *
                        (service.displayPrice ??
                          service.basePrice + service.serviceFee)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata & Governance Card */}
          <div className="bg-surface-container-low border border-surface-variant/50 rounded-2xl p-6 space-y-3 shadow-sm text-xs">
            <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
                Metadata & Governance
              </h2>
            </div>

            <div className="space-y-2.5 divide-y divide-surface-variant/30">
              <div className="flex items-center justify-between pt-2">
                <span className="text-outline">Service ID</span>
                <span className="font-mono font-medium text-on-surface">
                  {service.id}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-outline">Organization ID</span>
                <span className="font-mono font-medium text-primary">
                  {service.organizationId}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-outline">Created At</span>
                <span className="text-on-surface">
                  {formatDate(service.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-outline">Last Modified</span>
                <span className="text-on-surface">
                  {formatDate(service.updatedAt)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-outline">Lifecycle State</span>
                <span className="font-medium text-on-surface">
                  {service.status}
                </span>
              </div>
            </div>

            {isArchived && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] mt-3">
                This service has been archived. It cannot be booked, reactivated, or edited.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Status Dialog */}
      <ServiceStatusDialog
        isOpen={statusDialogOpen}
        service={service}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={handleStatusConfirm}
      />

      {/* 5. Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-container-highest border border-primary/40 rounded-xl shadow-xl text-xs text-on-surface font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
}
