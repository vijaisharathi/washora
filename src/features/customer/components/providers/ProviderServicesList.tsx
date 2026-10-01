"use client";

import React from "react";
import Link from "next/link";
import { ServiceItem } from "@/types/customer";
import { Layers, ArrowRight } from "lucide-react";

interface ProviderServicesListProps {
  services: ServiceItem[];
}

export function ProviderServicesList({ services }: ProviderServicesListProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 shadow-lg">
      <h3 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <span>Specialty Treatments Offered</span>
      </h3>

      <div className="space-y-3">
        {services.map((srv) => (
          <Link
            key={srv.id}
            href={`/customer/services/clothing-care/${srv.id}`}
            className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 transition-all group block cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">dry_cleaning</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                  {srv.name}
                </h4>
                <p className="text-[11px] text-on-surface-variant truncate">{srv.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-on-surface">₹{srv.basePrice}</span>
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
