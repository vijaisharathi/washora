import React from "react";
import Link from "next/link";

interface ProviderAuthLayoutProps {
  children: React.ReactNode;
  heroQuote?: string;
  heroSubquote?: string;
}

export function ProviderAuthLayout({
  children,
  heroQuote = '"Elevating the standard of fabric & footwear care, one meticulous service at a time."',
  heroSubquote = "Join an exclusive network of certified garment care and studio professionals.",
}: ProviderAuthLayoutProps) {
  return (
    <main className="w-full min-h-screen flex flex-col lg:flex-row bg-background text-on-surface">
      {/* Left Column: Branding / Atmospheric Quote (Hidden on mobile) */}
      <section className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-surface-container-lowest flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABxy9ACF2PggW-miJxBVnHSLaM0zDrBK6BbuyoxhzjH0_KLggAWg6URLMda8QQc3jm14XBoA3w_BxS144EeADBkwy-KmF_90T39okc4xOQQfl07E4bfW92osroo4exYsrLMvzESS_4tStwnkLYuceapwr77h66N85sxHkEXm46fqZ5-Jo2lpCsHo1ax0L82ovitacaq_O_SE2zGj1ovAFywQy4RDcQnN1R9_xBt_HxmC_6AbZDxM7xsQ')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
        </div>

        {/* Brand Logo Anchor */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-3xl">cleaning_services</span>
          <Link href="/provider" className="flex items-center gap-2">
            <span className="font-headline-md text-2xl font-bold text-on-surface tracking-tight">
              WASHORA
            </span>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
              Studio
            </span>
          </Link>
        </div>

        {/* Value Prop Quote */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-variant/60 backdrop-blur-md border border-white/5 mb-6">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span className="text-xs font-medium text-on-surface-variant">For Certified Service Studios</span>
          </div>
          <blockquote className="text-2xl font-bold text-on-surface mb-3 leading-snug">
            {heroQuote}
          </blockquote>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {heroSubquote}
          </p>
        </div>
      </section>

      {/* Right Column: Interactive Form Card */}
      <section className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 relative z-10 min-h-screen">
        <div className="w-full max-w-[500px] bg-surface rounded-[24px] p-6 sm:p-8 border border-white/5 shadow-2xl shadow-primary-container/5 relative overflow-hidden">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6 justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">cleaning_services</span>
            <span className="font-headline-md text-xl font-bold text-on-surface tracking-tight">
              WASHORA
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary-container/30 text-primary border border-primary/20">
              Studio
            </span>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
