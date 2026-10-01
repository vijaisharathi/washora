import { Metadata } from "next";
import { AdminOnboardingWizard } from "@/features/admin/onboarding/components/AdminOnboardingWizard";

export const metadata: Metadata = {
  title: "Admin Onboarding — WASHORA Platform",
  description: "Initial administrative profile and organizational setup for WASHORA.",
};

export default function AdminOnboardingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-body-md">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full relative z-10">
        <AdminOnboardingWizard />
      </div>
    </div>
  );
}
