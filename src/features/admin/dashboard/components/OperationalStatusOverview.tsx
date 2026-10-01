"use client";

import React from "react";
import { ShoppingBag, Store, Bike, Layers } from "lucide-react";
import {
  BookingStatusSummary,
  ProviderStatusSummary,
  DeliveryPartnerStatusSummary,
} from "@/types/admin";

interface OperationalStatusOverviewProps {
  bookingStatus: BookingStatusSummary[];
  providerStatus: ProviderStatusSummary[];
  deliveryPartnerStatus: DeliveryPartnerStatusSummary[];
}

export function OperationalStatusOverview({
  bookingStatus,
  providerStatus,
  deliveryPartnerStatus,
}: OperationalStatusOverviewProps) {
  const totalBookings = bookingStatus.reduce((acc, curr) => acc + curr.count, 0);
  const totalProviders = providerStatus.reduce((acc, curr) => acc + curr.count, 0);
  const totalPartners = deliveryPartnerStatus.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span>Platform Workload & Resource Capacity</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Bookings / Orders Breakdown */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface">Order Pipeline</h3>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {totalBookings} total orders
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {bookingStatus.map((item) => {
              const pct = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0;
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.status}
                    </span>
                    <span className="font-bold text-on-surface font-mono">
                      {item.count}{" "}
                      <span className="text-[10px] font-normal text-on-surface-variant">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Provider Operational Status */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface">Provider Fleet</h3>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {totalProviders} registered hubs
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {providerStatus.map((item) => {
              const pct = totalProviders > 0 ? (item.count / totalProviders) * 100 : 0;
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.status}
                    </span>
                    <span className="font-bold text-on-surface font-mono">
                      {item.count}{" "}
                      <span className="text-[10px] font-normal text-on-surface-variant">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Delivery Partner Status */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface">Valet Logistics</h3>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {totalPartners} valet partners
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {deliveryPartnerStatus.map((item) => {
              const pct = totalPartners > 0 ? (item.count / totalPartners) * 100 : 0;
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.status}
                    </span>
                    <span className="font-bold text-on-surface font-mono">
                      {item.count}{" "}
                      <span className="text-[10px] font-normal text-on-surface-variant">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
