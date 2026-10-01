import type { Metadata } from "next";
import { AdminRouteGuard } from "@/features/admin/components/AdminRouteGuard";

export const metadata: Metadata = {
  title: "WASHORA — Admin & Operations Console",
  description: "Enterprise operations command center and marketplace governance for WASHORA.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
}
