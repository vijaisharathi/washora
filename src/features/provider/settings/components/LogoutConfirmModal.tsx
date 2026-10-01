import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { providerAuthService } from "@/services/provider/providerAuthService";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await providerAuthService.logout();
    router.push("/provider/auth/login");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <span className="material-symbols-outlined text-2xl">logout</span>
        </div>

        <h3 className="text-base font-bold text-on-surface mb-2">Confirm Sign Out</h3>
        <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
          Are you sure you want to sign out of the WASHORA Provider Portal? You will need to log back
          in to process orders or adjust scheduling.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-600/20"
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
