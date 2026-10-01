"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  Lock,
  Smartphone,
  Laptop,
  Mail,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Sliders,
  LogOut,
  Edit3,
} from "lucide-react";

export default function AccountSecurityPage() {
  const { profile, isLoading, isError, refetch } = useCustomerProfile();
  const { logout } = useAuth();

  // Settings State
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);

  // Modals
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <LoadingSkeleton className="h-6 w-48 rounded" />
        <LoadingSkeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Could not load security settings"
          message="We encountered an issue retrieving your security settings."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPasswordSaved(true);
      setTimeout(() => {
        setPasswordSaved(false);
        setShowPasswordDialog(false);
      }, 1200);
    }, 600);
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      setShowDeleteDialog(false);
      await logout();
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-20">
      {/* Breadcrumbs matching Stitch */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/customer/profile" className="hover:text-primary transition-colors">
          Account
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-semibold">Privacy &amp; Security</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
          Account &amp; Security
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Manage your profile details, privacy preferences, and security settings.
        </p>
      </div>

      {/* Bento Grid matching Stitch anything_clean_account_privacy_security */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card (8 Cols) */}
        <section className="lg:col-span-8 bg-surface-container border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center text-primary text-xl font-bold overflow-hidden shadow-inner">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-on-surface font-headline">{profile.name}</h3>
                <span className="bg-green-500/15 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {profile.email} • {profile.phone}
              </p>
            </div>
          </div>

          <Link href="/customer/profile/edit" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full gap-2 border-white/10 text-xs">
              <Edit3 className="h-3.5 w-3.5 text-primary" />
              <span>Edit Details</span>
            </Button>
          </Link>
        </section>

        {/* Data Preferences (4 Cols) */}
        <section className="lg:col-span-4 bg-surface-container border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-on-surface font-headline flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <span>Data Preferences</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-on-surface">Usage Analytics</span>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-on-surface">Personalized Ads</span>
              <input
                type="checkbox"
                checked={personalizedAds}
                onChange={(e) => setPersonalizedAds(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Login & Security (6 Cols) */}
        <section className="lg:col-span-6 bg-surface-container border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-on-surface font-headline flex items-center gap-2 border-b border-white/5 pb-3">
            <Shield className="h-4 w-4 text-primary" />
            <span>Login &amp; Security</span>
          </h3>

          <div className="divide-y divide-white/5">
            <button
              type="button"
              onClick={() => setShowPasswordDialog(true)}
              className="w-full py-3 flex items-center justify-between hover:bg-surface-container-high/40 -mx-3 px-3 rounded-xl transition-colors text-left"
            >
              <div>
                <h4 className="text-xs font-bold text-on-surface">Change Password</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Last updated 3 months ago</p>
              </div>
              <ChevronRight className="h-4 w-4 text-on-surface-variant" />
            </button>

            <div className="py-3 flex items-center justify-between -mx-3 px-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-on-surface">Two-Step Verification</h4>
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.2 rounded text-[10px] font-bold">Enabled</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">SMS OTP verification configured</p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Sessions (6 Cols) */}
        <section className="lg:col-span-6 bg-surface-container border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-on-surface font-headline flex items-center gap-2 border-b border-white/5 pb-3">
            <Laptop className="h-4 w-4 text-primary" />
            <span>Active Sessions</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-white/5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Laptop className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-on-surface">Chrome on Windows</h4>
                  <span className="text-[10px] text-green-400 font-bold">Current Session</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Chennai, IN • IP: 182.73.12.98</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-white/5">
              <div className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-on-surface">iOS App</h4>
                  <button className="text-[10px] text-red-400 font-bold hover:underline">Revoke</button>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Chennai, IN • Active 2 hrs ago</p>
              </div>
            </div>
          </div>
        </section>

        {/* Marketing & Communications (6 Cols) */}
        <section className="lg:col-span-6 bg-surface-container border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-on-surface font-headline flex items-center gap-2 border-b border-white/5 pb-3">
            <Mail className="h-4 w-4 text-primary" />
            <span>Marketing &amp; Communications</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={productUpdates}
                onChange={(e) => setProductUpdates(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
              />
              <div>
                <h4 className="text-xs font-bold text-on-surface">Product Updates</h4>
                <p className="text-[11px] text-on-surface-variant">
                  Get notified about new care features, garment treatments, and improvements.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={promotionalOffers}
                onChange={(e) => setPromotionalOffers(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
              />
              <div>
                <h4 className="text-xs font-bold text-on-surface">Promotional Offers</h4>
                <p className="text-[11px] text-on-surface-variant">
                  Receive special deals, seasonal discount coupons, and studio partner specials.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Danger Zone (6 Cols) */}
        <section className="lg:col-span-6 bg-red-950/20 border border-red-500/20 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <h3 className="text-sm font-bold text-red-400 font-headline flex items-center gap-2 border-b border-red-500/20 pb-3">
            <AlertTriangle className="h-4 w-4" />
            <span>Danger Zone</span>
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-on-surface">Deactivate Account</h4>
                <p className="text-[11px] text-on-surface-variant max-w-xs">
                  Temporarily disable your account. Saved addresses will be hidden until reactivation.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateDialog(true)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs shrink-0"
              >
                Deactivate
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-red-500/20">
              <div>
                <h4 className="text-xs font-bold text-on-surface">Delete Account</h4>
                <p className="text-[11px] text-on-surface-variant max-w-xs">
                  Permanently remove your profile, address history, and bookings. Irreversible.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 shadow-md shadow-red-600/20"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md bg-surface-container border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>Change Account Password</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Enter your current password and pick a strong new password.
            </DialogDescription>
          </DialogHeader>

          {passwordSaved ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-on-surface">Password Updated Successfully</p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Current Password</label>
                <input
                  type="password"
                  required
                  defaultValue="••••••••"
                  className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing} className="font-semibold text-xs">
                  {isProcessing ? "Saving..." : "Save Password"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-surface-container border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Permanently Delete Account?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              This action cannot be undone. All your saved addresses, past garment care logs, and account records will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              onClick={handleDeleteAccount}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Yes, Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-md bg-surface-container border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface">Deactivate Account</DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Your account will be paused and reactivated upon next login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowDeactivateDialog(false)} className="font-semibold text-xs">
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
