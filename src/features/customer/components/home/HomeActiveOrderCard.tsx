"use client";

import React from "react";
import Link from "next/link";
import { Order } from "@/types/customer";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";

interface HomeActiveOrderCardProps {
  order?: Order | null;
}

export function HomeActiveOrderCard({ order }: HomeActiveOrderCardProps) {
  if (!order) return null;

  const currentItem = order.items?.[0];

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span>Live Order In Progress</span>
        </h2>
        <span className="text-xs font-mono text-slate-400 font-medium">
          #{order.orderNumber}
        </span>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-surface-card via-surface-container to-primary/10 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary-light shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-white">
              {currentItem?.serviceName || "Specialty Care Treatment"}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-primary-light font-medium">{order.providerName}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{order.status.replace(/_/g, " ")}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Estimated Return
            </span>
            <span className="text-xs font-bold text-white">
              {order.deliveryDate || "Scheduled Soon"}
            </span>
          </div>

          <Link
            href={`/customer/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow transition-all"
          >
            <span>Track Order</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
