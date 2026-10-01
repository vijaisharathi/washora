"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  Bell,
  LogIn,
  ChevronDown,
  Sparkles,
  Compass,
  Calendar,
  Gift,
  User,
} from "lucide-react";
import { useAuth } from "@/features/customer/hooks/useAuth";
import { useLocation } from "@/features/customer/hooks/useLocation";
import { useNotifications } from "@/features/customer/hooks/useNotifications";
import { GlobalSearchModal } from "@/components/discovery/GlobalSearchModal";

export function CustomerHeader() {
  const pathname = usePathname();
  const { session, isAuthenticated } = useAuth();
  const { currentLocation } = useLocation();
  const { unreadCount } = useNotifications();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "W";

  const displayArea = currentLocation?.areaName || "Indiranagar";
  const displayCity = currentLocation?.city || "Bangalore";

  const navLinks = [
    { label: "Home", href: "/customer", icon: Sparkles },
    { label: "Explore", href: "/customer/services", icon: Compass },
    { label: "Bookings", href: "/customer/orders", icon: Calendar },
    { label: "Rewards", href: "/customer/offers", icon: Gift },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Desktop & Tablet Header Strip */}
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Brand Mark & Location Pill */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/customer" className="flex items-center gap-2 group">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-headline group-hover:text-primary transition-colors">
                  WASHORA<span className="text-primary">.</span>
                </span>
              </Link>

              {/* Location Pill Selector */}
              <Link
                href="/customer/location"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card hover:bg-surface-container border border-white/[0.08] hover:border-primary/40 transition-all text-xs text-white max-w-[190px] sm:max-w-[240px] group"
              >
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex items-baseline gap-1 truncate text-xs font-semibold">
                  <span className="truncate">{displayArea}</span>
                  <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">({displayCity})</span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 ml-auto flex-shrink-0" />
              </Link>
            </div>

            {/* Center: Desktop Global Search Trigger */}
            <div className="hidden lg:flex flex-1 max-w-md items-center">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-card hover:bg-surface-container border border-white/[0.08] hover:border-primary/40 text-xs text-left text-slate-400 flex items-center relative transition-all group shadow-sm"
              >
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="truncate">Search services, shoe care, dry cleaning...</span>
                <span className="ml-auto text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  ⌘K
                </span>
              </button>
            </div>

            {/* Right: Desktop Nav Links & User Profile */}
            <div className="flex items-center gap-1 sm:gap-4">
              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/customer"
                      ? pathname === "/customer"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary/15 text-primary-light border border-primary/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Notifications Icon Button */}
              <Link href="/customer/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full text-slate-300 hover:text-white hover:bg-white/5 h-9 w-9"
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </Button>
              </Link>

              {/* Profile Avatar / Login CTA */}
              {isAuthenticated ? (
                <Link href="/customer/profile">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-white/10 hover:border-primary/50 transition-all cursor-pointer ring-offset-background">
                    <AvatarImage src={session?.user?.avatarUrl} alt={session?.user?.name || "Customer"} />
                    <AvatarFallback className="bg-primary/20 text-primary-light font-bold text-xs">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link href="/customer/auth/login">
                  <Button
                    size="sm"
                    className="h-8 sm:h-9 px-3.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold gap-1.5 shadow-glow"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Prominent Search Bar (Immediately below top bar) */}
          <div className="lg:hidden pb-3">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-card border border-white/[0.08] active:border-primary/50 text-xs text-left text-slate-400 flex items-center relative transition-all shadow-sm"
            >
              <Search className="absolute left-3.5 h-4 w-4 text-primary-light" />
              <span className="truncate">Search services, providers, categories...</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Expanded Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
