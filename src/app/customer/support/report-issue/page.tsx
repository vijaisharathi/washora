"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSupport } from "@/features/customer/hooks/useSupport";
import { IssueCategorySelector } from "@/features/customer/components/support/IssueCategorySelector";
import { IssueDetailsForm } from "@/features/customer/components/support/IssueDetailsForm";
import { SupportTicketSuccessModal } from "@/features/customer/components/support/SupportTicketSuccessModal";
import { SupportSkeleton } from "@/features/customer/components/support/SupportSkeleton";
import { IssueCategoryType, CreateSupportTicketPayload } from "@/types/customer/support";
import { ArrowLeft, ArrowRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

function ReportIssueContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || "WSH-20260901-1024";

  const { issueCategories, isLoading, createTicket, isSubmitting, createdTicket } =
    useSupport();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategoryType>("damaged_item");
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);

  if (isLoading) {
    return <SupportSkeleton />;
  }

  const currentCategoryObj =
    issueCategories.find((c) => c.id === selectedCategory) || issueCategories[0];

  const handleTicketSubmit = async (payload: CreateSupportTicketPayload) => {
    const ticket = await createTicket(payload);
    setSubmittedTicket(ticket);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="space-y-3">
        <Link
          href="/customer/support"
          className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Help Center</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
            {step === 1 ? "Something Not Right?" : "Tell Us What Happened"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {step === 1
              ? "Select the issue that best describes your care experience."
              : "Provide a few details so our specialist care team can resolve this."}
          </p>
        </div>

        {/* Order Reference Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-white/10 rounded-full text-xs text-on-surface-variant font-mono">
          <Receipt className="h-3.5 w-3.5 text-primary" />
          <span>Attached Order: {orderId}</span>
        </div>
      </div>

      {/* STEP 1: Category Selection matching Stitch anything_clean_report_a_service_issue */}
      {step === 1 && (
        <div className="space-y-8">
          <IssueCategorySelector
            categories={issueCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="flex justify-end pt-4 border-t border-white/5">
            <Button
              size="lg"
              onClick={() => setStep(2)}
              className="gap-2 font-semibold text-xs shadow-lg shadow-primary/20"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Issue Details Form matching Stitch anything_clean_issue_details_support_request */}
      {step === 2 && currentCategoryObj && (
        <div className="bg-surface-container rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
          <IssueDetailsForm
            selectedCategory={currentCategoryObj}
            orderId={orderId}
            onChangeCategory={() => setStep(1)}
            onSubmitTicket={handleTicketSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setStep(1)}
          />
        </div>
      )}

      {/* Success Modal */}
      {(submittedTicket || createdTicket) && (
        <SupportTicketSuccessModal ticket={submittedTicket || createdTicket!} />
      )}
    </main>
  );
}

export default function ReportIssuePage() {
  return (
    <Suspense fallback={<SupportSkeleton />}>
      <ReportIssueContent />
    </Suspense>
  );
}
