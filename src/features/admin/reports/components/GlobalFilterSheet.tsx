"use client";

import React, { useState } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { FilterOptionsState } from "../../hooks/useAdminAnalytics";

interface GlobalFilterSheetProps {
  city: string;
  serviceCategory: string;
  providerId: string;
  deliveryPartnerId: string;
  serviceId: string;
  filterOptions: FilterOptionsState;
  activeFilterCount: number;
  onSetCity: (val: string) => void;
  onSetCategory: (val: string) => void;
  onSetProvider: (val: string) => void;
  onSetDeliveryPartner: (val: string) => void;
  onSetService: (val: string) => void;
  onResetFilters: () => void;
  hiddenFilters?: ("city" | "category" | "provider" | "deliveryPartner" | "service")[];
}

export function GlobalFilterSheet({
  city,
  serviceCategory,
  providerId,
  deliveryPartnerId,
  serviceId,
  filterOptions,
  activeFilterCount,
  onSetCity,
  onSetCategory,
  onSetProvider,
  onSetDeliveryPartner,
  onSetService,
  onResetFilters,
  hiddenFilters = [],
}: GlobalFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
      >
        <Filter className="w-4 h-4 text-primary" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xl p-6 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-on-surface">Analytics Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="space-y-3.5 mt-4">
              {!hiddenFilters.includes("city") && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    City / Hub Zone
                  </label>
                  <select
                    value={city}
                    onChange={(e) => onSetCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Operating Cities</option>
                    {filterOptions.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!hiddenFilters.includes("category") && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Service Category
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => onSetCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Service Categories</option>
                    {filterOptions.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!hiddenFilters.includes("provider") && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Provider Facility
                  </label>
                  <select
                    value={providerId}
                    onChange={(e) => onSetProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Providers</option>
                    {filterOptions.providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!hiddenFilters.includes("deliveryPartner") && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Delivery Partner
                  </label>
                  <select
                    value={deliveryPartnerId}
                    onChange={(e) => onSetDeliveryPartner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Logistics Partners</option>
                    {filterOptions.deliveryPartners.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!hiddenFilters.includes("service") && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Catalog Service Item
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => onSetService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Catalog Items</option>
                    {filterOptions.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-90"
              >
                Apply & View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
