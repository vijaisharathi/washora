"use client";

import React from "react";
import { MapPin, Navigation, Compass, Layers, CheckCircle2 } from "lucide-react";
import { RouteStop } from "@/types/delivery-partner";

interface RouteMapViewProps {
  stops: RouteStop[];
  hubName: string;
}

export function RouteMapView({ stops, hubName }: RouteMapViewProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container/90 border border-outline-variant/30 space-y-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Bengaluru East Sector Route Schematic</h2>
            <p className="text-[11px] text-on-surface-variant">Hub Origin: {hubName}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1">
          <Layers className="w-3 h-3" /> {stops.length} Sequenced Stops
        </span>
      </div>

      {/* Schematic Node Path */}
      <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-purple-500 before:to-emerald-400">
        {/* Hub Origin Node */}
        <div className="relative flex items-center gap-4 pl-1">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold z-10 shadow-md">
            H
          </div>
          <div className="p-3 rounded-2xl bg-surface/80 border border-outline-variant/15 text-xs flex-1 flex items-center justify-between">
            <span className="font-bold text-on-surface">{hubName} (Fulfillment Center)</span>
            <span className="text-[10px] font-mono text-primary font-bold">Origin Hub</span>
          </div>
        </div>

        {/* Individual Stops Nodes */}
        {stops.map((stop) => (
          <div key={stop.taskId} className="relative flex items-center gap-4 pl-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                stop.isCompleted
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "bg-surface-container-highest text-primary border border-primary/40"
              }`}
            >
              {stop.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stop.stopNumber}
            </div>

            <div className="p-3 rounded-2xl bg-surface/80 border border-outline-variant/15 text-xs flex-1 flex items-center justify-between flex-wrap gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface truncate">
                  Stop #{stop.stopNumber}: {stop.address}
                </p>
                <p className="text-[10px] text-on-surface-variant font-mono">
                  {stop.customerName} • {stop.timeWindow}
                </p>
              </div>

              <span className="text-[10px] font-mono font-bold text-on-surface-variant shrink-0">
                {stop.distanceKm} km
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
