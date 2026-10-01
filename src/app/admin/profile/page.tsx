import { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminProfileMasterView } from "@/features/admin/profile/components/AdminProfileMasterView";

export const metadata: Metadata = {
  title: "Admin Profile — WASHORA Lumina Console",
  description: "View and manage your operational profile, credentials, and preferences.",
};

export default function AdminProfilePage() {
  return (
    <AdminShell headerTitle="Administrator Profile">
      <AdminProfileMasterView />
    </AdminShell>
  );
}
