import React, { useState } from "react";
import { ChangePasswordPayload } from "@/types/provider/settings";
import { ProviderCard } from "@/features/provider/components/ProviderCard";

interface SecurityPasswordSectionProps {
  onChangePassword: (payload: ChangePasswordPayload) => Promise<void>;
  isChanging: boolean;
}

export function SecurityPasswordSection({
  onChangePassword,
  isChanging,
}: SecurityPasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must contain at least 8 characters.");
      return;
    }

    try {
      await onChangePassword({ currentPassword, newPassword, confirmPassword });
      setSuccessMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      setErrorMsg(msg);
    }
  };

  return (
    <ProviderCard variant="container" className="p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">lock_reset</span>
        <div>
          <h3 className="text-sm font-bold text-on-surface">Change Password</h3>
          <p className="text-xs text-on-surface-variant">
            Update your partner account password to protect access to orders and financials.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:border-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:border-primary outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isChanging}
          className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
        >
          {isChanging ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </ProviderCard>
  );
}
