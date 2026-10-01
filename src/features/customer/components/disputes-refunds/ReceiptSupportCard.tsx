import React from "react";
import Link from "next/link";
import { MessageSquare, Info, ShieldAlert, ShoppingBag, Truck, Sparkles, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptSupportCardProps {
  orderNumber: string;
}

export function ReceiptSupportCard({ orderNumber }: ReceiptSupportCardProps) {
  return (
    <section className="bg-surface-container border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-xl sticky top-24">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-on-surface font-headline flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">
            support_agent
          </span>
          <span>Need Help?</span>
        </h2>
        <p className="text-xs text-on-surface-variant">
          Select an issue category to initiate resolution or dispute charges.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/customer/orders/${orderNumber}/dispute?category=service_mismatch`}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <ShoppingBag className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold text-on-surface group-hover:text-primary">
            Order Issue
          </span>
        </Link>

        <Link
          href={`/customer/orders/${orderNumber}/dispute?category=sla_delay`}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <Truck className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold text-on-surface group-hover:text-primary">
            Pickup Issue
          </span>
        </Link>

        <Link
          href={`/customer/orders/${orderNumber}/dispute?category=damaged_garment`}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <Sparkles className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold text-on-surface group-hover:text-primary">
            Service Issue
          </span>
        </Link>

        <Link
          href={`/customer/orders/${orderNumber}/dispute?category=billing_discrepancy`}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <CreditCard className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold text-on-surface group-hover:text-primary">
            Payment Issue
          </span>
        </Link>
      </div>

      <div className="space-y-3 pt-2">
        <Link href={`/customer/orders/${orderNumber}/dispute`} className="block">
          <Button className="w-full gap-2 text-xs font-bold shadow-lg shadow-primary/20">
            <ShieldAlert className="h-4 w-4" />
            <span>Dispute &amp; Request Refund</span>
          </Button>
        </Link>

        <p className="text-[11px] text-on-surface-variant text-center flex items-center justify-center gap-1.5 leading-tight">
          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Your order details will be automatically shared with support.</span>
        </p>
      </div>
    </section>
  );
}
