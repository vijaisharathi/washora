import React from "react";
import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationEmptyStateProps {
  category: string;
}

export function NotificationEmptyState({ category }: NotificationEmptyStateProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-10 text-center space-y-4 shadow-xl max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface-variant mx-auto shadow-inner">
        <Bell className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-on-surface font-headline">
          {category === "all"
            ? "You're all caught up!"
            : `No ${category} notifications yet`}
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Order updates, pickup schedules, and personalized discounts will appear right here.
        </p>
      </div>

      <Link href="/customer" className="inline-block pt-2">
        <Button size="sm" className="gap-2 text-xs font-semibold shadow-lg shadow-primary/20">
          <span>Explore Services</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
