"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProviderServices } from "@/features/provider/services/hooks/useProviderServices";
import { ProviderServiceItem, ProviderServiceCategory } from "@/types/provider/services";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { ProviderEmptyState } from "@/features/provider/components/ProviderEmptyState";
import { ProviderCard } from "@/features/provider/components/ProviderCard";
import { ProviderServiceCard } from "./ProviderServiceCard";
import { ProviderServiceDeleteDialog } from "./ProviderServiceDeleteDialog";

export function ProviderServicesCatalogView() {
  const {
    services,
    isLoading,
    isError,
    stats,
    refetch,
    toggleStatus,
    isToggling,
    deleteService,
    isDeleting,
  } = useProviderServices();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [deleteTarget, setDeleteTarget] = useState<ProviderServiceItem | null>(null);

  if (isLoading) {
    return <ProviderLoadingState message="Loading Studio Service Catalog..." />;
  }

  if (isError) {
    return <ProviderErrorState title="Failed to load service catalog" onRetry={() => refetch()} />;
  }

  // Filtering Logic
  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === "all" || srv.category === selectedCategory;
    const matchesStatus = statusFilter === "ALL" || srv.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteService(deleteTarget.id);
    setDeleteTarget(null);
  };

  const CATEGORIES: { key: string; label: string; icon: string }[] = [
    { key: "all", label: "All Offerings", icon: "widgets" },
    { key: "laundry", label: "Dry Clean & Laundry", icon: "dry_cleaning" },
    { key: "shoes", label: "Footwear Spa", icon: "sports_tennis" },
    { key: "bags", label: "Handbags & Luggage", icon: "shopping_bag" },
    { key: "helmets", label: "Helmet Care", icon: "sports_motorsports" },
    { key: "vehicles", label: "Steam & Detailing", icon: "local_car_wash" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Total Catalog</span>
          <span className="text-2xl font-bold text-on-surface mt-1">{stats?.totalServices || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Active Services</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1">{stats?.activeServices || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Inactive / Paused</span>
          <span className="text-2xl font-bold text-zinc-400 mt-1">{stats?.inactiveServices || 0}</span>
        </ProviderCard>

        <ProviderCard variant="container" className="p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant">Avg. Ticket Price</span>
          <span className="text-2xl font-bold text-primary mt-1">₹{stats?.averagePrice || 0}</span>
        </ProviderCard>
      </div>

      {/* Action Toolbar: Search + Status Filter + Add Service CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search care services by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container text-on-surface text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-surface-container text-on-surface text-xs rounded-xl px-3 py-2.5 border border-white/5 focus:border-primary outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Add Service Button */}
          <Link
            href="/provider/services/new"
            className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add Offering</span>
          </Link>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid or Empty State */}
      {filteredServices.length === 0 ? (
        <ProviderEmptyState
          title="No Services Found"
          description={
            searchQuery
              ? `No service offerings match "${searchQuery}". Try clearing filters.`
              : "You have not added any services in this category yet."
          }
          iconName="cleaning_services"
          action={
            <Link
              href="/provider/services/new"
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add First Service</span>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <ProviderServiceCard
              key={service.id}
              service={service}
              onToggleStatus={toggleStatus}
              onDeleteClick={(srv) => setDeleteTarget(srv)}
              isToggling={isToggling}
            />
          ))}
        </div>
      )}

      {/* Delete / Archive Confirmation Modal */}
      <ProviderServiceDeleteDialog
        service={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
