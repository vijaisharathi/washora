"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ExternalLink } from "lucide-react";

interface ProviderStickyCardProps {
  providerId: string;
  isAvailableToday: boolean;
  locationName: string;
  distanceKm: number;
}

export function ProviderStickyCard({
  providerId,
  isAvailableToday,
  locationName,
  distanceKm,
}: ProviderStickyCardProps) {
  const bookingUrl = `/customer/booking?providerId=${providerId}`;

  return (
    <div className="space-y-6 md:sticky md:top-24">
      {/* Availability & Booking Card */}
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
            {isAvailableToday ? "Available for Intake Today" : "Scheduled Intake"}
          </span>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Select this certified partner studio to proceed with service customization, pickup scheduling, and doorstep care.
        </p>

        <Link href={bookingUrl} className="w-full block">
          <Button
            size="lg"
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/20"
          >
            <span>Select Provider</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Location Map Snippet matching Stitch */}
      <div className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="h-32 w-full bg-surface-container-low relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKHjbI94lUZyrpo22ifefy3WNgs6N1e8q9qwGcqU4b6rH0wy_CwW4deInP4au4Mjb4EiA9Gaid6xO116CRTRYI4j6PRGZR-upnURKWqrrWFHGzl0u2J_VHYtlo9BQWm4RmtNyBx5fGw4i4WXu7BILJhBFaPsujNqdoV4zyZBgzjRDol-4TviS1COwu-KBi5F1OU6Uc8fZMUrjxMpuhyH0LDcQWvtHacT8OkeKGzaZFTiK6WZ34CWdo9g"
            alt="Map Preview"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
        </div>

        <div className="p-4 flex justify-between items-center text-xs">
          <div>
            <p className="font-bold text-on-surface">{locationName}</p>
            <p className="text-on-surface-variant text-[11px]">{distanceKm} km away</p>
          </div>
          <Link
            href="/customer/location"
            className="text-primary font-semibold hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>Change Location</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
