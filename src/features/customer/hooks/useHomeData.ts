"use client";

import { useQuery } from "@tanstack/react-query";
import { homeService } from "@/services/homeService";
import { useLocation } from "./useLocation";

export const HOME_DATA_QUERY_KEY = ["customer", "homeData"] as const;

export function useHomeData() {
  const { currentLocation } = useLocation();

  const query = useQuery({
    queryKey: [...HOME_DATA_QUERY_KEY, currentLocation?.areaName, currentLocation?.city],
    queryFn: () => homeService.getHomeData(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
