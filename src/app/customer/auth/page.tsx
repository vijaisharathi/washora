"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Sparkles, Phone, Mail } from "lucide-react";

export default function CustomerAuthEntryPage() {
  return (
    <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header graphic */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Welcome to WASHORA
          </h1>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            On-demand luxury laundry, dry cleaning, and delicate fabric care at your doorstep.
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3 pt-2">
          <Link href="/customer/auth/login" className="block w-full">
            <Button size="lg" className="w-full gap-2 text-base font-semibold">
              <Phone className="h-4 w-4" />
              <span>Sign In with Phone / Email</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>

          <Link href="/customer/auth/register" className="block w-full">
            <Button variant="secondary" size="lg" className="w-full gap-2 text-base">
              <Mail className="h-4 w-4" />
              <span>Create an Account</span>
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-left">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>100% Garment Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-base">verified</span>
            <span>Vetted Artisan Cleaners</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
