import React from "react";
import Link from "next/link";
import { CustomerReviewData } from "@/types/customer/review";
import { CheckCircle2, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewSubmittedSuccessProps {
  review: CustomerReviewData;
}

export function ReviewSubmittedSuccess({ review }: ReviewSubmittedSuccessProps) {
  return (
    <main className="w-full max-w-2xl mx-auto flex flex-col items-center text-center p-6 sm:p-12 animate-in fade-in zoom-in-95 duration-200 space-y-6">
      {/* Success Indicator matching Stitch anything_clean_review_submitted */}
      <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-pulse">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-4xl font-bold text-on-surface font-headline">
          Thanks for Your Feedback!
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
          Your review has been submitted successfully.
        </p>
      </div>

      {/* Review Preview Card */}
      <div className="w-full max-w-lg bg-surface-container border border-white/10 rounded-2xl p-5 text-left shadow-xl space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">dry_cleaning</span>
          </div>

          <div className="space-y-1 min-w-0">
            {/* Stars */}
            <div className="flex items-center gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? "fill-primary text-primary" : "text-surface-variant/40"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs sm:text-sm text-on-surface font-medium italic">
              &ldquo;{review.comment}&rdquo;
            </p>

            <span className="text-[11px] text-on-surface-variant block">
              {review.serviceName} • {review.providerName}
            </span>
          </div>
        </div>
      </div>

      {/* Reassuring Note */}
      <p className="text-xs text-primary/80 max-w-sm">
        Your insights help us maintain high standards and guide other customers.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-4">
        <Link href="/customer/orders" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full text-xs font-semibold">
            View My Orders
          </Button>
        </Link>

        <Link href="/customer/services" className="w-full sm:w-auto">
          <Button className="w-full gap-2 text-xs font-bold shadow-lg shadow-primary/20">
            <ShoppingBag className="h-4 w-4" />
            <span>Book Again</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
