import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck, Receipt, Home } from "lucide-react";

interface ConfirmationActionButtonsProps {
  orderId: string;
}

export function ConfirmationActionButtons({ orderId }: ConfirmationActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-white/5">
      <Link href={`/customer/orders/${orderId}`} className="w-full sm:w-auto">
        <Button size="lg" className="w-full gap-2 font-semibold shadow-lg shadow-primary/20">
          <Truck className="h-4 w-4" />
          <span>Track Order</span>
        </Button>
      </Link>

      <Link href={`/customer/orders/${orderId}/receipt`} className="w-full sm:w-auto">
        <Button variant="outline" size="lg" className="w-full gap-2 text-xs font-semibold">
          <Receipt className="h-4 w-4" />
          <span>Receipt &amp; Support</span>
        </Button>
      </Link>

      <Link href="/customer" className="w-full sm:w-auto">
        <Button variant="ghost" size="lg" className="w-full gap-2 text-on-surface-variant hover:text-primary text-xs">
          <Home className="h-4 w-4" />
          <span>Go Home</span>
        </Button>
      </Link>
    </div>
  );
}
