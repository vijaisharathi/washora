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
  Archive,
  Clock,
  Sparkles,
  Home,
  ChefHat,
  Bath,
  Armchair,
  Layers,
  WashingMachine,
  Tv,
  Star,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import {
  Service,
  ServiceCategory,
  ServiceSortDirection,
  ServiceSortField,
  ServiceStatus,
  formatDuration,
} from "@/types/admin/serviceCatalog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ServiceTableProps {
  services: Service[];
  sort: ServiceSortField;
  sortDirection: ServiceSortDirection;
  onSortChange: (field: ServiceSortField) => void;
  onEditService: (service: Service) => void;
  onUpdateStatus: (service: Service) => void;
  isLoading?: boolean;
}

export function ServiceTable({
  services,
  sort,
  sortDirection,
  onSortChange,
  onEditService,
  onUpdateStatus,
  isLoading = false,
}: ServiceTableProps) {
  // Sort icon renderer
  const renderSortIcon = (field: ServiceSortField) => {
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
  const renderStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-medium text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Active
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-medium text-[11px]">
            <Clock className="w-3 h-3 text-amber-500" />
            Inactive
          </span>
        );
      case "Archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-outline border border-outline/30 font-medium text-[11px]">
            <Archive className="w-3 h-3 text-outline" />
            Archived
          </span>
        );
    }
  };

  // Category Icon helper
  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case "Home Cleaning":
        return <Home className="w-4 h-4 text-sky-400" />;
      case "Deep Cleaning":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "Kitchen Cleaning":
        return <ChefHat className="w-4 h-4 text-orange-400" />;
      case "Bathroom Cleaning":
        return <Bath className="w-4 h-4 text-cyan-400" />;
      case "Sofa Cleaning":
        return <Armchair className="w-4 h-4 text-indigo-400" />;
      case "Carpet Cleaning":
        return <Layers className="w-4 h-4 text-teal-400" />;
      case "Laundry":
        return <WashingMachine className="w-4 h-4 text-blue-400" />;
      case "Appliance Cleaning":
        return <Tv className="w-4 h-4 text-rose-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant">Loading services catalog...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-surface-container-low border border-surface-variant/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-outline mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">
          No Services Found
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mb-4">
          No services match your active search query or filter criteria. Try clearing or relaxing your filters.
        </p>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create New Service
        </Link>
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
              {/* Service */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("name")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Service</span>
                  {renderSortIcon("name")}
                </button>
              </th>

              {/* Category */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("category")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Category</span>
                  {renderSortIcon("category")}
                </button>
              </th>

              {/* Pricing */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("displayPrice")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Display Price</span>
                  {renderSortIcon("displayPrice")}
                </button>
              </th>

              {/* Duration */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("durationMinutes")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Duration</span>
                  {renderSortIcon("durationMinutes")}
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

              {/* Performance */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("totalBookings")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Bookings / Rating</span>
                  {renderSortIcon("totalBookings")}
                </button>
              </th>

              {/* Updated At */}
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSortChange("updatedAt")}
                  className="flex items-center gap-1.5 hover:text-on-surface transition-colors"
                >
                  <span>Last Updated</span>
                  {renderSortIcon("updatedAt")}
                </button>
              </th>

              {/* Actions */}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-variant/30 text-xs">
            {services.map((service) => {
              const isArchived = service.status === "Archived";

              return (
                <tr
                  key={service.id}
                  className="hover:bg-surface-container-high/40 transition-colors group"
                >
                  {/* Service Name & ID */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5 border border-surface-variant/60">
                        {getCategoryIcon(service.category)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/services/${service.id}`}
                          className="font-medium text-on-surface hover:text-primary transition-colors block truncate max-w-[200px]"
                          title={service.name}
                        >
                          {service.name}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-outline mt-0.5">
                          <span className="font-mono text-[10px] text-primary/90 font-medium">
                            {service.id}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">
                            {service.shortDescription}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container border border-surface-variant/60 text-on-surface-variant">
                      {service.category}
                    </span>
                  </td>

                  {/* Pricing */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">
                        {formatCurrency(
                          service.displayPrice ??
                            service.basePrice + service.serviceFee
                        )}
                      </span>
                      <span className="text-[10px] text-outline">
                        Base: {formatCurrency(service.basePrice)} + Fee: {formatCurrency(service.serviceFee)}
                      </span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5 text-outline shrink-0" />
                      <span>{formatDuration(service.durationMinutes)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(service.status)}
                  </td>

                  {/* Performance */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-on-surface">
                          {service.totalBookings}
                        </span>
                        <span className="text-[10px] text-outline">
                          ({service.activeBookings} active)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{service.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-on-surface-variant text-[11px]">
                    {formatDate(service.updatedAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit */}
                      {isArchived ? (
                        <button
                          disabled
                          className="p-1.5 rounded-lg text-outline/30 cursor-not-allowed"
                          title="Archived services cannot be edited"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link
                          href={`/admin/services/${service.id}/edit`}
                          className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Status Dialog Trigger */}
                      {isArchived ? (
                        <button
                          disabled
                          className="p-1.5 rounded-lg text-outline/30 cursor-not-allowed"
                          title="Archived services are terminal"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(service)}
                          className="p-1.5 rounded-lg text-outline hover:text-amber-500 hover:bg-surface-container transition-colors"
                          title="Change Service Status"
                        >
                          <ShieldAlert className="w-4 h-4" />
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

      {/* Mobile Card List View (< lg) */}
      <div className="lg:hidden divide-y divide-surface-variant/30">
        {services.map((service) => {
          const isArchived = service.status === "Archived";

          return (
            <div
              key={service.id}
              className="p-4 flex flex-col gap-3 hover:bg-surface-container-high/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5 border border-surface-variant/60">
                    {getCategoryIcon(service.category)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="font-medium text-sm text-on-surface hover:text-primary transition-colors block truncate"
                    >
                      {service.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-outline mt-0.5">
                      <span className="font-mono text-[11px] text-primary/90 font-medium">
                        {service.id}
                      </span>
                      <span>•</span>
                      <span>{service.category}</span>
                    </div>
                  </div>
                </div>

                <div>{renderStatusBadge(service.status)}</div>
              </div>

              <p className="text-xs text-on-surface-variant line-clamp-2">
                {service.shortDescription}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-variant/20 text-xs">
                <div>
                  <span className="text-[10px] text-outline uppercase block">Display Price</span>
                  <span className="font-semibold text-on-surface">
                    {formatCurrency(
                      service.displayPrice ??
                        service.basePrice + service.serviceFee
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Duration</span>
                  <span className="text-on-surface">
                    {formatDuration(service.durationMinutes)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Bookings</span>
                  <span className="text-on-surface">
                    {service.totalBookings} ({service.activeBookings} active)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Rating</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{service.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-variant/20">
                <span className="text-[10px] text-outline">
                  Updated {formatDate(service.updatedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/services/${service.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Link>

                  {!isArchived && (
                    <>
                      <Link
                        href={`/admin/services/${service.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Link>

                      <button
                        onClick={() => onUpdateStatus(service)}
                        className="p-1 rounded-md text-outline hover:text-amber-500 hover:bg-surface-container transition-colors"
                        title="Change Status"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </>
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
