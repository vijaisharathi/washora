import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ReviewsListMasterView } from "@/features/admin/reviews/components/ReviewsListMasterView";

export const metadata: Metadata = {
  title: "Reviews & Moderation — WASHORA Admin Console",
  description:
    "Enterprise customer review management, rating distributions, and trust & safety content moderation.",
};

export default function AdminReviewsPage() {
  return (
    <AdminShell headerTitle="Reviews & Moderation">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant">Loading reviews & moderation data...</p>
          </div>
        }
      >
        <ReviewsListMasterView />
      </Suspense>
    </AdminShell>
  );
}
