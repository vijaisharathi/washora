"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderServicesCatalogView } from "@/features/provider/services/components/ProviderServicesCatalogView";
import Link from "next/link";

export default function ProviderServicesPage() {
  return (
    <ProviderShell headerTitle="Service Offerings" headerSubtitle="Catalog Management">
      <ProviderPageHeader
        title="Service Management"
        description="Configure your studio care catalog, specialized treatments, base pricing, and turnaround SLAs."
        actions={
          <Link
            href="/provider/services/new"
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-xs font-bold transition-all shadow-md shadow-primary/20 inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Service</span>
          </Link>
        }
      />

      <ProviderServicesCatalogView />
    </ProviderShell>
  );
}
