"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  User,
  LogOut,
  MapPin,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Phone,
  CheckCircle2,
  Edit3,
  Receipt,
  Package,
  Tag,
} from "lucide-react";

export default function CustomerProfilePage() {
  const { profile, isLoading, isError, refetch } = useCustomerProfile();
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <LoadingSkeleton className="h-6 w-36 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <LoadingSkeleton className="h-80 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <LoadingSkeleton className="h-44 w-full rounded-2xl" />
            <LoadingSkeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Could not load profile"
          message="We encountered an issue fetching your account details. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const nameInitial = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24">
      {/* Breadcrumbs matching Stitch */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/customer" className="hover:text-primary transition-colors">
          Account
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-semibold">Profile</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Header Card */}
          <div className="bg-surface-container border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            {/* Top subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar with Edit trigger */}
            <div className="relative mb-4 group">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center text-primary text-3xl font-bold overflow-hidden shadow-lg shadow-primary/10">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{nameInitial}</span>
                )}
              </div>
              <Link
                href="/customer/profile/edit"
                className="absolute bottom-0 right-0 bg-surface-container-highest border border-white/20 rounded-full p-2 hover:bg-primary hover:text-on-primary transition-colors shadow-md"
                aria-label="Edit Profile"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Link>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-on-surface font-headline">
              {profile.name}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-4">{profile.email}</p>

            {/* Phone Verification Box */}
            <div className="w-full flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl border border-white/5 mb-4">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-on-surface-variant" />
                <span className="font-mono text-xs text-on-surface font-semibold tracking-wide">
                  {profile.phone}
                </span>
              </div>
              <span className="bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                Verified
              </span>
            </div>

            {/* Membership Tier */}
            <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{profile.tier || "Premium Member"}</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Since {profile.memberSince}</span>
            </div>

            {/* Edit Personal Info Action */}
            <Link href="/customer/profile/edit" className="w-full mt-4">
              <Button variant="outline" className="w-full gap-2 border-white/10 hover:bg-surface-container-high">
                <Edit3 className="h-4 w-4 text-primary" />
                <span>Edit Personal Information</span>
              </Button>
            </Link>
          </div>

          {/* Log Out Button */}
          <Button
            variant="outline"
            className="w-full gap-2 border-error/30 text-error hover:bg-error-container/10 hover:text-error transition-colors"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Button>
        </div>

        {/* Right Column: Quick Access & Navigation Grid */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Access: Recent Order */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Recent Activity</span>
            </h2>
            <div className="bg-surface-container border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3.5">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-xl">dry_cleaning</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Sneaker Deep Clean &amp; Re-conditioning</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">CleanX Premium Care Center</p>
                  </div>
                </div>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
                  Delivered
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <div>
                  <span className="text-xs text-on-surface-variant block">Total Paid</span>
                  <span className="text-xl font-bold text-on-surface">₹502</span>
                </div>
                <Link href="/customer/orders">
                  <Button variant="outline" size="sm" className="border-white/10 text-xs">
                    View Orders
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Account Settings Grid */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface font-headline">Account Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Offers & Rewards (C18) */}
              <Link
                href="/customer/offers"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Offers &amp; Rewards
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">Coupons, discounts &amp; points</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>

              {/* Orders & Bookings */}
              <Link
                href="/customer/orders"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Orders &amp; Bookings
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">View past and active services</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>

              {/* Saved Addresses */}
              <Link
                href="/customer/addresses"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Saved Addresses
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">Manage pickup &amp; drop locations</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>

              {/* Location Preference */}
              <Link
                href="/customer/location"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-lg">my_location</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Location &amp; Coverage
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">Select active service locality</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>

              {/* Notifications */}
              <Link
                href="/customer/notifications"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Notifications
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">Alert preferences &amp; updates</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>

              {/* Privacy & Security */}
              <Link
                href="/customer/profile/security"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Privacy &amp; Security
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">Password and data management</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>

              {/* Help & Support */}
              <Link
                href="/customer/support"
                className="group bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-primary/40 hover:bg-surface-container transition-all"
              >
                <div className="bg-surface-container-high p-2.5 rounded-xl text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    Help &amp; Support
                  </div>
                  <div className="text-xs text-on-surface-variant truncate">Garment care guide &amp; tickets</div>
                </div>
                <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md bg-surface-container border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface flex items-center gap-2">
              <LogOut className="h-5 w-5 text-error" />
              <span>Log Out Confirmation</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Are you sure you want to sign out of your WASHORA account? You will need to log in again to access your saved addresses and order history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              isLoading={isLoggingOut}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
