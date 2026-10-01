"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bike, ShieldCheck, ArrowRight, User, Phone, Mail, MapPin, Lock, AlertCircle } from "lucide-react";
import { useDeliveryPartnerSession } from "../../hooks/useDeliveryPartnerSession";
import { VehicleType } from "@/types/delivery-partner";

export function DeliveryPartnerRegisterForm() {
  const router = useRouter();
  const { register, isRegistering } = useDeliveryPartnerSession();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [vehicleType, setVehicleType] = useState<VehicleType>("ELECTRIC_BIKE");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      await register({ fullName, phone, email, city, vehicleType, password });
      router.push(`/delivery-partner/auth/verify-phone?phone=${encodeURIComponent(phone)}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to register. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-surface-container border border-primary/30 shadow-md mb-2">
          <Bike className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Join WASHORA Fleet</h1>
        <p className="text-xs text-on-surface-variant">
          Sign up as a garment valet and logistics fulfillment partner
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container/80 border border-outline-variant/30 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikram Singh"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={isRegistering}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                disabled={isRegistering}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={isRegistering}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Operating City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-3" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                  disabled={isRegistering}
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                disabled={isRegistering}
              >
                <option value="ELECTRIC_BIKE">Electric Bike (EV)</option>
                <option value="SCOOTER">Scooter / Moped</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="VAN">Light Delivery Van</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                disabled={isRegistering}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-wide shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-3"
          >
            {isRegistering ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                <span>Creating Valet Application...</span>
              </>
            ) : (
              <>
                <span>Continue to Phone Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-outline-variant/20 text-center space-y-2">
          <p className="text-xs text-on-surface-variant">
            Already registered with WASHORA?{" "}
            <Link
              href="/delivery-partner/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In Here
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-on-surface-variant/70">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Strict Confidentiality • KYC Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
