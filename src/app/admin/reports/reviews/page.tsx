import { Metadata } from "next";
import { ReviewsReportView } from "@/features/admin/reports/components/views/ReviewsReportView";

export const metadata: Metadata = {
  title: "Review & Sentiment Analytics | WASHORA Admin",
  description: "Customer feedback distribution, sentiment trends, and content moderation records",
};

export default function AdminReviewsReportPage() {
  return <ReviewsReportView />;
}
