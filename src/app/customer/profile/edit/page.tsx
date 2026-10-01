"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
import { profileUpdateSchema, ProfileUpdateFormData } from "@/features/customer/schemas/profileSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function EditPersonalInformationPage() {
  const router = useRouter();
  const { profile, isLoading, isError, updateProfile, isUpdating, uploadAvatar, refetch } = useCustomerProfile();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    values: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      avatarUrl: profile?.avatarUrl || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);
      setValue("avatarUrl", dataUrl);
      await uploadAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      await updateProfile({
        name: data.name,
        avatarUrl: avatarPreview || profile?.avatarUrl,
      });
      setSuccessMessage("Your profile information has been updated successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch {
      // Handled via error state
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <LoadingSkeleton className="h-6 w-48 rounded" />
        <LoadingSkeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Profile unavailable"
          message="We could not retrieve your account information."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const currentAvatar = avatarPreview || profile.avatarUrl;
  const nameInitial = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link href="/customer/profile" className="hover:text-primary transition-colors">
          Account
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link href="/customer/profile" className="hover:text-primary transition-colors">
          Profile
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-semibold">Personal Information</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
          Edit Personal Information
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Update your profile details and contact information.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 text-xs text-green-400 animate-in fade-in-50">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="border border-white/10 bg-surface-container/90 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/5">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-primary/40 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden shadow-lg shadow-primary/10">
                {currentAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentAvatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{nameInitial}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h2 className="font-bold text-base text-on-surface">Profile Photo</h2>
              <p className="text-xs text-on-surface-variant">
                We recommend a square image of at least 400x400px.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 text-xs font-semibold text-primary hover:bg-surface-container-high"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </Button>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Arjun Verma"
                  className="pl-10"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface" htmlFor="phone">
                  Phone Number
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50 pointer-events-none" />
                  <Input
                    id="phone"
                    type="tel"
                    disabled
                    value={profile.phone}
                    className="pl-10 opacity-70 cursor-not-allowed bg-surface-container-low"
                  />
                </div>
                <Link href={`/customer/auth/verify-phone?phone=${encodeURIComponent(profile.phone)}`}>
                  <Button type="button" variant="outline" className="border-white/10 text-xs shrink-0">
                    Change
                  </Button>
                </Link>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value={profile.email}
                    className="pl-10 opacity-70 cursor-not-allowed bg-surface-container-low"
                  />
                </div>
                <Button type="button" variant="outline" className="border-white/10 text-xs shrink-0">
                  Change
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Link href="/customer/profile">
                <Button type="button" variant="ghost" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto font-semibold shadow-lg shadow-primary/10"
                isLoading={isUpdating}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
