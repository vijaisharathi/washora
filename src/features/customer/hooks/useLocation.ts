"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerProfileService } from "@/services/customerProfileService";
import { LocationPreference } from "@/types/customer";
import { showError } from "@/lib/ui/toast";

export const LOCATION_PREFERENCE_KEY = ["customer", "location"] as const;

export function useLocation() {
  const queryClient = useQueryClient();

  const locationQuery = useQuery({
    queryKey: LOCATION_PREFERENCE_KEY,
    queryFn: () => customerProfileService.getLocationPreference(),
  });

  const setLocationMutation = useMutation({
    mutationFn: (location: LocationPreference) =>
      customerProfileService.setLocationPreference(location),
    onSuccess: (newLoc) => {
      queryClient.setQueryData(LOCATION_PREFERENCE_KEY, newLoc);
    },
    onError: (err) => {
      showError(err, "Failed to Update Location");
    },
  });

  const detectLocationMutation = useMutation({
    mutationFn: async () => {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            });
          });

          const loc: LocationPreference = {
            areaName: "Anna Nagar",
            city: "Chennai",
            pincode: "600040",
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            servicesAvailableCount: 24,
            providersNearbyCount: 18,
          };
          return customerProfileService.setLocationPreference(loc);
        } catch {
          // fallback if denied or error
          return customerProfileService.detectCurrentLocation();
        }
      }
      return customerProfileService.detectCurrentLocation();
    },
    onSuccess: (detected) => {
      queryClient.setQueryData(LOCATION_PREFERENCE_KEY, detected);
    },
    onError: (err) => {
      showError(err, "Failed to Detect Location");
    },
  });

  return {
    currentLocation: locationQuery.data,
    isLoading: locationQuery.isLoading,
    setLocation: setLocationMutation.mutateAsync,
    isSettingLocation: setLocationMutation.isPending,
    detectLocation: detectLocationMutation.mutateAsync,
    isDetectingLocation: detectLocationMutation.isPending,
    detectError: detectLocationMutation.error,
    searchLocations: (query: string) => customerProfileService.searchLocations(query),
  };
}
