"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProviderServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.serviceId as string;

  useEffect(() => {
    if (serviceId) {
      router.replace(`/provider/services/${serviceId}/edit`);
    }
  }, [serviceId, router]);

  return null;
}
