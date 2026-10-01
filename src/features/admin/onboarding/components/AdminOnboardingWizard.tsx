"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { OnboardingProgressStepper } from "./OnboardingProgressStepper";
import { Step1PersonalInfo } from "./Step1PersonalInfo";
import { Step2OrganizationInfo } from "./Step2OrganizationInfo";
import { Step3RolePreferences } from "./Step3RolePreferences";
import { Step4ReviewComplete } from "./Step4ReviewComplete";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { AdminOnboardingData } from "@/types/admin";
import {
  Step1FormData,
  Step2FormData,
  Step3FormData,
} from "../schemas/onboardingSchema";

export function AdminOnboardingWizard() {
  const {
    user,
    userId,
    getOnboardingData,
    saveOnboardingStep,
    completeOnboarding,
  } = useAdminSession();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<AdminOnboardingData | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadDraft() {
      setIsLoadingDraft(true);
      try {
        const draft = await getOnboardingData();
        if (mounted) {
          setFormData(draft);
          setCurrentStep(draft.currentStep || 1);
        }
      } catch (err: unknown) {
        if (mounted) {
          setErrorMsg("Failed to load existing draft. Starting with fresh onboarding.");
        }
      } finally {
        if (mounted) {
          setIsLoadingDraft(false);
        }
      }
    }
    loadDraft();
    return () => {
      mounted = false;
    };
  }, [getOnboardingData]);

  const handleStep1Next = async (data: Step1FormData) => {
    setErrorMsg(null);
    const updated = await saveOnboardingStep(data, 2);
    setFormData(updated);
    setCurrentStep(2);
  };

  const handleStep2Next = async (data: Step2FormData) => {
    setErrorMsg(null);
    const updated = await saveOnboardingStep(data, 3);
    setFormData(updated);
    setCurrentStep(3);
  };

  const handleStep3Next = async (data: Step3FormData) => {
    setErrorMsg(null);
    const updated = await saveOnboardingStep(data, 4);
    setFormData(updated);
    setCurrentStep(4);
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleCompleteSetup = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await completeOnboarding(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to finalize administrative setup. Please try again.";
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  if (isLoadingDraft || !formData) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant font-mono animate-pulse">
          Loading onboarding configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 items-center justify-center text-primary shadow-lg shadow-primary/10 mb-1">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
          Admin & Operations Onboarding
        </h1>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          Complete initial identity, organization details, and role preferences to activate your administrative console access.
        </p>
      </div>

      {/* Stepper */}
      <OnboardingProgressStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Wizard Form Container */}
      <div className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl">
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-critical/15 border border-critical/30 text-critical text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {currentStep === 1 && (
          <Step1PersonalInfo
            initialData={formData}
            onNext={handleStep1Next}
          />
        )}

        {currentStep === 2 && (
          <Step2OrganizationInfo
            initialData={formData}
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3RolePreferences
            initialData={formData}
            onNext={handleStep3Next}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4ReviewComplete
            data={formData}
            onBack={() => setCurrentStep(3)}
            onComplete={handleCompleteSetup}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Footer Security Note */}
      <div className="text-center text-[10px] text-on-surface-variant/70 flex items-center justify-center gap-1.5 pt-2">
        <Sparkles className="w-3 h-3 text-primary" />
        <span>WASHORA Governance Portal • Data preserved across wizard steps</span>
      </div>
    </div>
  );
}
