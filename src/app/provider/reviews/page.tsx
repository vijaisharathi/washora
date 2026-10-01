"use client";

import React from "react";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderPageHeader } from "@/features/provider/components/ProviderPageHeader";
import { ProviderReviewsCatalogView } from "@/features/provider/reviews/components/ProviderReviewsCatalogView";

export default function ProviderReviewsPage() {
  return (
    <ProviderShell headerTitle="Reviews &amp; Ratings" headerSubtitle="Quality &amp; Client Feedback">
      <ProviderPageHeader
        title="Customer Reviews &amp; Ratings"
        description="Review customer satisfaction scores, inspect verified order reviews, and reply directly to client feedback."
      />

      <ProviderReviewsCatalogView />
    </ProviderShell>
  );
}
