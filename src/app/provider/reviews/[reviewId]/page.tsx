"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProviderShell } from "@/features/provider/components/ProviderShell";
import { ProviderReviewDetailView } from "@/features/provider/reviews/components/ProviderReviewDetailView";

export default function ProviderReviewDetailPage() {
  const params = useParams();
  const reviewId = params?.reviewId as string;

  return (
    <ProviderShell headerTitle="Review Details" headerSubtitle="Client Feedback">
      <ProviderReviewDetailView reviewId={reviewId} />
    </ProviderShell>
  );
}
