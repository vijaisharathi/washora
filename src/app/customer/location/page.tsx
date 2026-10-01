"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { useAddresses } from "@/features/customer/hooks/useAddresses";
import { LocationPreference } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  X,
  Home,
  Briefcase,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
} from "lucide-react";

export default function CustomerLocationSelectionPage() {
  const router = useRouter();
  const {
    currentLocation,
    setLocation,
    isSettingLocation,
    detectLocation,
    isDetectingLocation,
    searchLocations,
  } = useLocation();

  const { addresses } = useAddresses();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationPreference[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<LocationPreference>(
    currentLocation || {
      areaName: "Anna Nagar",
      city: "Chennai",
      pincode: "600040",
      latitude: 13.085,
      longitude: 80.21,
      servicesAvailableCount: 24,
      providersNearbyCount: 18,
    }
  );

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const res = await searchLocations(val);
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  };

  const handleDetectGPS = async () => {
    const loc = await detectLocation();
    setSelectedLoc(loc);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSelectSearchResult = (loc: LocationPreference) => {
    setSelectedLoc(loc);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSelectAddress = (addr: (typeof addresses)[0]) => {
    const loc: LocationPreference = {
      areaName: addr.streetAddress.split(",")[0] || addr.city,
      city: addr.city,
      pincode: addr.postalCode,
      latitude: addr.latitude || 13.085,
      longitude: addr.longitude || 80.21,
      servicesAvailableCount: 28,
      providersNearbyCount: 19,
    };
    setSelectedLoc(loc);
  };

  const handleConfirm = async () => {
    await setLocation(selectedLoc);
    router.push("/customer");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header matching Stitch */}
        <div className="p-6 sm:p-8 border-b border-white/5 bg-surface-container-low/60 flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface font-headline tracking-tight">
              Choose your location
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              See specialized cleaning studios and services available near you.
            </p>
          </div>
          <Link href="/customer">
            <button
              type="button"
              className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Link>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
            <Input
              type="text"
              placeholder="Search area, locality or pincode..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-surface-container-low"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-surface-container border border-white/10 rounded-xl shadow-2xl overflow-hidden divide-y divide-white/5">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-3 hover:bg-primary/10 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <span className="font-bold text-on-surface block">
                          {res.areaName}, {res.city}
                        </span>
                        <span className="text-on-surface-variant">Pincode: {res.pincode}</span>
                      </div>
                    </div>
                    <span className="text-primary font-medium text-[11px]">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Location GPS Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetectingLocation}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary transition-all group active:scale-[0.99]"
          >
            <Navigation className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs text-primary">
              {isDetectingLocation ? "Detecting location..." : "Use Current Location via GPS"}
            </span>
          </button>

          {/* Selected Area Card matching Stitch */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Selected Area
            </span>
            <div className="p-4 rounded-xl bg-surface-container-low border border-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base text-on-surface">
                    {selectedLoc.areaName}, {selectedLoc.city}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Pincode: {selectedLoc.pincode}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{selectedLoc.servicesAvailableCount} Services Available</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>{selectedLoc.providersNearbyCount} Studios Nearby</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Addresses / Locations List */}
          {addresses.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Saved Locations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.slice(0, 2).map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectAddress(addr)}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-white/5 hover:border-primary/40 hover:bg-surface-container-high transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant group-hover:text-primary transition-colors">
                      {addr.label === "Home" ? (
                        <Home className="h-4 w-4" />
                      ) : (
                        <Briefcase className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-on-surface block group-hover:text-primary transition-colors">
                        {addr.label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
                        {addr.streetAddress}, {addr.city}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stylized Dark Satellite Map Visualizer matching Stitch */}
          <div className="rounded-xl border border-white/10 h-44 relative overflow-hidden bg-surface-container-low flex items-center justify-center group shadow-inner">
            {/* Ambient Map background vector */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/20 via-surface-container-lowest to-background opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Bouncing Map Pin */}
            <div className="relative z-10 flex flex-col items-center animate-bounce">
              <div className="p-2.5 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30">
                <MapPin className="h-6 w-6 text-on-primary" />
              </div>
              <div className="w-3 h-1 bg-primary/40 rounded-full mt-1 blur-[1px]" />
            </div>

            {/* Area View pill */}
            <div className="absolute bottom-3 right-3 z-10 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-[11px] text-on-surface font-medium">
              {selectedLoc.areaName} Active Service Hub
            </div>
          </div>

          {/* Confirm Action Button */}
          <Button
            type="button"
            size="lg"
            className="w-full gap-2 font-semibold text-base shadow-lg shadow-primary/10 mt-2"
            isLoading={isSettingLocation}
            onClick={handleConfirm}
          >
            <span>Confirm Location</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
