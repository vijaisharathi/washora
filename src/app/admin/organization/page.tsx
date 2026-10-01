import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminOrganizationMasterView } from "@/features/admin/organization/components/AdminOrganizationMasterView";

export const metadata: Metadata = {
  title: "Organization Setup — WASHORA Lumina Console",
  description: "View and configure your organization legal entity details and operational points.",
};

export default function AdminOrganizationPage() {
  return (
    <AdminShell headerTitle="Organization Setup">
      <AdminOrganizationMasterView />
    </AdminShell>
  );
}
