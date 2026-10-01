"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrderTracking } from "@/features/customer/hooks/useOrderTracking";
import { useReview } from "@/features/customer/hooks/useReview";
import { RatingStarsSelector } from "@/features/customer/components/reviews/RatingStarsSelector";
import { ReviewTextInput } from "@/features/customer/components/reviews/ReviewTextInput";
import { ReviewSuggestionChips } from "@/features/customer/components/reviews/ReviewSuggestionChips";
import { ReviewSubmittedSuccess } from "@/features/customer/components/reviews/ReviewSubmittedSuccess";
import { ReviewSkeleton } from "@/features/customer/components/reviews/ReviewSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderReviewPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "WSH-20260901-1024";

  const { data: order, isLoading: isOrderLoading, isError: isOrderError, refetch } =
    useOrderTracking(orderId);
  const { review: existingReview, isLoading: isReviewLoading, submitReview, isSubmitting, submitResult } =
    useReview(orderId);

  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Great quality"]);

  if (isOrderLoading || isReviewLoading) {
    return <ReviewSkeleton />;
  }

  if (isOrderError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState
          title="Could Not Load Order"
          message="We were unable to retrieve order details for this review."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // If review is already submitted or just submitted in this session
  if (submitResult || existingReview) {
    return <ReviewSubmittedSuccess review={submitResult || existingReview!} />;
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    await submitReview({
      orderId,
      rating,
      comment: comment.trim() || selectedTags.join(", ") || "Great service and care.",
      tags: selectedTags,
    });
  };

  return (
    <main className="w-full max-w-2xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Card Container matching Stitch */}
      <div className="bg-surface-container rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
        {/* Subtle gradient glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Action */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link
            href={`/customer/orders/${order.id}`}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Order</span>
          </Link>

          <span className="text-xs font-mono font-bold text-primary">
            {order.orderNumber}
          </span>
        </div>

        {/* STEP 1: Rate Your Experience matching Stitch anything_clean_rate_your_experience */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-8">
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
                How was your experience?
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                Your feedback helps us maintain high standards and helps other customers choose better.
              </p>
            </div>

            {/* Service Summary Strip */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 flex items-center gap-4 shadow-inner">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">dry_cleaning</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-on-surface truncate">
                  {order.serviceName}
                </h3>
                <p className="text-xs text-on-surface-variant truncate">
                  Studio: {order.providerName}
                </p>
              </div>
            </div>

            {/* Interactive 5-Star Selector */}
            <RatingStarsSelector rating={rating} onRatingChange={setRating} />

            {/* Continue to Write Review */}
            <div className="pt-2 flex justify-center">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto min-w-[200px] gap-2 font-semibold shadow-lg shadow-primary/20"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Write a Review matching Stitch anything_clean_write_a_review */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
                Write a Review
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Tell us what you liked or what we could improve.
              </p>
            </div>

            {/* Textarea */}
            <ReviewTextInput value={comment} onChange={setComment} maxLength={500} />

            {/* Suggestion Chips */}
            <ReviewSuggestionChips
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-white/5">
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs font-semibold"
              >
                Skip Written Review
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 font-semibold text-xs shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Review</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
