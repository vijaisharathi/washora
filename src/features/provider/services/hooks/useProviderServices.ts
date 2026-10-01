"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerServicesService } from "@/services/provider/providerServicesService";
import {
  CreateProviderServicePayload,
  UpdateProviderServicePayload,
} from "@/types/provider/services";

export function useProviderServices(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: ["provider", "services", providerId],
    queryFn: () => providerServicesService.getServices(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const statsQuery = useQuery({
    queryKey: ["provider", "services", "stats", providerId],
    queryFn: () => providerServicesService.getServiceStats(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload: CreateProviderServicePayload) =>
      providerServicesService.createService(payload, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "services"] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProviderServicePayload }) =>
      providerServicesService.updateService(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "services"] });
      queryClient.setQueryData(["provider", "service", data.id], data);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => providerServicesService.toggleServiceStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "services"] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => providerServicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "services"] });
    },
  });

  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    stats: statsQuery.data,
    refetch: servicesQuery.refetch,

    createService: createServiceMutation.mutateAsync,
    isCreating: createServiceMutation.isPending,

    updateService: updateServiceMutation.mutateAsync,
    isUpdating: updateServiceMutation.isPending,

    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,

    deleteService: deleteServiceMutation.mutateAsync,
    isDeleting: deleteServiceMutation.isPending,
  };
}

export function useProviderServiceItem(serviceId: string) {
  return useQuery({
    queryKey: ["provider", "service", serviceId],
    queryFn: () => providerServicesService.getServiceById(serviceId),
    enabled: !!serviceId,
  });
}
