import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WASHORA Studio — Service Provider Partner Portal",
  description: "Operations, order processing, service catalog, and earnings portal for certified WASHORA garment care studios.",
};

export default function ProviderRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="provider-app-root min-h-screen bg-background text-on-surface">{children}</div>;
}
