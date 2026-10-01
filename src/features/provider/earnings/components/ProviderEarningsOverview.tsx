"use client";

import React, { useState } from "react";
import { useProviderEarnings } from "@/features/provider/earnings/hooks/useProviderEarnings";
import { ProviderLoadingState } from "@/features/provider/components/ProviderLoadingState";
import { ProviderErrorState } from "@/features/provider/components/ProviderErrorState";
import { EarningsSummaryBento } from "./EarningsSummaryBento";
import { WeeklyRevenueFlexChart } from "./WeeklyRevenueFlexChart";
import { TransactionsTable } from "./TransactionsTable";
import { PayoutsHistorySection } from "./PayoutsHistorySection";
import { PayoutAccountCard } from "./PayoutAccountCard";
import { RequestPayoutModal } from "./RequestPayoutModal";
import { EditPayoutAccountModal } from "./EditPayoutAccountModal";
import { UpdatePayoutAccountPayload } from "@/types/provider/earnings";

export function ProviderEarningsOverview() {
  const {
    summary,
    isLoadingSummary,
    trends,
    transactions,
    isLoadingTransactions,
    payouts,
    isLoadingPayouts,
    account,
    isLoadingAccount,
    requestPayout,
    isRequestingPayout,
    updateAccount,
    isUpdatingAccount,
  } = useProviderEarnings();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  if (isLoadingSummary || isLoadingTransactions || isLoadingPayouts || isLoadingAccount) {
    return <ProviderLoadingState message="Loading Studio Financial Ledger &amp; Payouts..." />;
  }

  if (!summary) {
    return <ProviderErrorState title="Failed to load earnings records" />;
  }

  const handleRequestPayoutConfirm = async (amount: number, notes?: string) => {
    await requestPayout({ amount, notes });
    setIsPayoutModalOpen(false);
  };

  const handleUpdateAccountConfirm = async (payload: UpdatePayoutAccountPayload) => {
    await updateAccount(payload);
    setIsEditAccountModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 3-Card Summary Bento */}
      <EarningsSummaryBento
        summary={summary}
        onRequestPayoutClick={() => setIsPayoutModalOpen(true)}
      />

      {/* Weekly Revenue Flex Bar Chart */}
      <WeeklyRevenueFlexChart trends={trends} />

      {/* Payout Bank Account Details */}
      <PayoutAccountCard
        account={account}
        onEditClick={() => setIsEditAccountModalOpen(true)}
      />

      {/* Grid: Left (Transactions Table) | Right (Payout Settlements) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TransactionsTable transactions={transactions} />
        </div>

        <div className="lg:col-span-5">
          <PayoutsHistorySection payouts={payouts} />
        </div>
      </div>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        availableBalance={summary.availableBalance}
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onConfirm={handleRequestPayoutConfirm}
        isSubmitting={isRequestingPayout}
      />

      {/* Edit Account Modal */}
      <EditPayoutAccountModal
        account={account}
        isOpen={isEditAccountModalOpen}
        onClose={() => setIsEditAccountModalOpen(false)}
        onSave={handleUpdateAccountConfirm}
        isSaving={isUpdatingAccount}
      />
    </div>
  );
}
