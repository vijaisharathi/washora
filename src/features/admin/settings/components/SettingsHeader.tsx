"use client";

import React from "react";
import Link from "next/link";
import { Settings, ChevronRight } from "lucide-react";

interface SettingsHeaderProps {
  title: string;
  subtitle: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function SettingsHeader({
  title,
  subtitle,
  breadcrumbs = [{ label: "Settings", href: "/admin/settings" }],
  actions,
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1.5 font-medium">
          <Link
            href="/admin"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>Console</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.label}>
              {b.href ? (
                <Link
                  href={b.href}
                  className="hover:text-primary transition-colors"
                >
                  {b.label}
                </Link>
              ) : (
                <span className="text-on-surface font-semibold">{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary shrink-0" />
          <span>{title}</span>
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
