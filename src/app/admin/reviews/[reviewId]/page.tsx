import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ReviewDetailsMasterView } from "@/features/admin/reviews/components/details/ReviewDetailsMasterView";

interface AdminReviewDetailPageProps {
  params: {
    reviewId: string;
  };
}

export const metadata: Metadata = {
  title: "Review Details & Moderation — WASHORA Admin Console",
  description:
    "Detailed feedback inspection, provider & booking context, and moderation audit trail.",
};

export default function AdminReviewDetailPage({
  params,
}: AdminReviewDetailPageProps) {
  const { reviewId } = params;

  return (
    <AdminShell headerTitle="Review Moderation">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading review details...</p>
          </div>
        }
      >
        <ReviewDetailsMasterView reviewId={reviewId} />
      </Suspense>
    </AdminShell>
  );
}
