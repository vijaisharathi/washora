"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Sparkles, User, ShoppingBag } from "lucide-react";

export default function CustomerAuthSuccessPage() {
  const { session } = useAuth();
  const userName = session?.user?.name || "Customer";

  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl text-center">
      <CardContent className="p-6 sm:p-10 space-y-6">
        {/* Animated Check Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary text-primary shadow-lg shadow-primary/20 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Verified &amp; Authenticated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Welcome, {userName}!
          </h1>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Your phone number has been verified. You can now browse specialized garment studios, schedule doorstep pickup, and track orders in real time.
          </p>
        </div>

        {/* User Card Snapshot */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 text-left flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-on-surface text-sm">{userName}</p>
              <p className="text-on-surface-variant">{session?.user?.phone || "+91 98765 43210"}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-medium text-[10px]">
            ACTIVE
          </span>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3 pt-2">
          <Link href="/customer" className="block w-full">
            <Button size="lg" className="w-full gap-2 text-base font-semibold shadow-lg shadow-primary/10">
              <ShoppingBag className="h-4 w-4" />
              <span>Explore Services &amp; Book</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>

          <Link href="/customer/profile" className="block w-full">
            <Button variant="outline" className="w-full gap-2 border-white/10 hover:bg-surface-container-high">
              <User className="h-4 w-4" />
              <span>Complete Profile &amp; Saved Addresses</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
