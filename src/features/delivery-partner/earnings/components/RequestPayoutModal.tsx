"use client";

import React, { useState } from "react";
import { X, Wallet, Building2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { RequestPayoutPayload } from "@/types/delivery-partner";

interface RequestPayoutModalProps {
  availableBalance: number;
  bankMasked: string;
  upiMasked: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RequestPayoutPayload) => Promise<unknown>;
  isSubmitting: boolean;
}

export function RequestPayoutModal({
  availableBalance,
  bankMasked,
  upiMasked,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: RequestPayoutModalProps) {
  const [amount, setAmount] = useState(availableBalance > 0 ? availableBalance.toString() : "500");
  const [method, setMethod] = useState<"BANK_TRANSFER" | "UPI">("BANK_TRANSFER");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (numAmount < 100) {
      setErrorMsg("Minimum payout cashout amount is ₹100.");
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg(`Insufficient balance. Maximum available is ₹${availableBalance}.`);
      return;
    }

    try {
      await onSubmit({
        amount: numAmount,
        paymentMethodType: method,
      });
      setSuccessMsg(`Instant payout of ₹${numAmount} successfully processed!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to initiate payout.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-surface-container border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-on-surface">Request Instant Cashout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/20 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-semibold">Available for Cashout</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">₹{availableBalance}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Withdrawal Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-on-surface-variant font-bold text-sm">₹</span>
              <input
                type="number"
                min={100}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-base font-bold text-on-surface font-mono focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
            <div className="flex gap-2 pt-1">
              {[500, 1000, 2000, availableBalance].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant hover:text-on-surface"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Account Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-on-surface-variant">Payout Destination</label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setMethod("BANK_TRANSFER")}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  method === "BANK_TRANSFER"
                    ? "bg-primary/10 border-primary text-on-surface font-semibold"
                    : "bg-surface border-outline-variant/20 text-on-surface-variant"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-primary mb-1" />
                <p className="font-bold">Bank Account</p>
                <p className="text-[10px] font-mono opacity-80">{bankMasked}</p>
              </div>

              <div
                onClick={() => setMethod("UPI")}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  method === "UPI"
                    ? "bg-primary/10 border-primary text-on-surface font-semibold"
                    : "bg-surface border-outline-variant/20 text-on-surface-variant"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-primary mb-1" />
                <p className="font-bold">Instant UPI</p>
                <p className="text-[10px] font-mono opacity-80">{upiMasked}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numAmount < 100 || numAmount > availableBalance}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold shadow-md hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Confirm Cashout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
