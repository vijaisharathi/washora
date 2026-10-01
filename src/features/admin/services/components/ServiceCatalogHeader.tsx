"use client";

import React from "react";
import Link from "next/link";
import { Plus, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCatalogHeaderProps {
  totalCount: number;
  organizationId: string;
}

export function ServiceCatalogHeader({
  totalCount,
  organizationId,
}: ServiceCatalogHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
            Services
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/25">
            {totalCount} Total Services
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-mono">
            <Shield className="w-3 h-3 text-primary" />
            {organizationId}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm mt-1">
          Configure service offerings, base pricing, platform service fees, durations, and catalog availability across your organization.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Link href="/admin/services/new" className="w-full md:w-auto">
          <Button
            size="sm"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-on-primary flex items-center justify-center gap-2 text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
