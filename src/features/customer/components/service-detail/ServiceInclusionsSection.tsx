import React from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

interface ServiceInclusionsSectionProps {
  inclusions: string[];
  exclusions: string[];
  processSteps: { step: number; title: string; description: string }[];
}

export function ServiceInclusionsSection({
  inclusions,
  exclusions,
  processSteps,
}: ServiceInclusionsSectionProps) {
  return (
    <div className="space-y-8 pt-4">
      {/* Inclusions & Exclusions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div className="bg-surface-container rounded-2xl p-5 sm:p-6 border border-white/10 space-y-3 shadow-lg">
          <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>What&apos;s Included</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-on-surface-variant">
            {inclusions.map((inc, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <span>{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="bg-surface-container rounded-2xl p-5 sm:p-6 border border-white/10 space-y-3 shadow-lg">
          <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <XCircle className="h-4 w-4 text-on-surface-variant" />
            <span>Not Included / Optional Add-ons</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-on-surface-variant">
            {exclusions.map((exc, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                <span>{exc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4-Step Treatment Process */}
      {processSteps && processSteps.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-base text-on-surface font-headline flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Certified Treatment Process</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="bg-surface-container border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 shadow-md relative"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-bold flex items-center justify-center">
                  0{step.step}
                </div>
                <h5 className="font-bold text-xs sm:text-sm text-on-surface">{step.title}</h5>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
