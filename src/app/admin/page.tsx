import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminDashboardMasterView } from "@/features/admin/dashboard/components/AdminDashboardMasterView";

export const metadata: Metadata = {
  title: "Admin Dashboard — WASHORA Lumina Console",
  description: "Operational overview, marketplace vitals, and live platform telemetry.",
};

export default function AdminRootPage() {
  return (
    <AdminShell headerTitle="Lumina Control Center">
      <AdminDashboardMasterView />
    </AdminShell>
  );
}
