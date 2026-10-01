import React from "react";
import { OrderReceiptData } from "@/types/customer/disputesRefunds";

interface ReceiptFinancialSummaryProps {
  receipt: OrderReceiptData;
}

export function ReceiptFinancialSummary({ receipt }: ReceiptFinancialSummaryProps) {
  return (
    <section className="bg-surface-container border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h2 className="font-bold text-base text-on-surface font-headline">
          Financial Summary
        </h2>
        <span className="bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
          {receipt.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Payment Method
          </span>
          <span className="text-xs font-semibold text-on-surface">
            {receipt.paymentMethod}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Transaction ID
          </span>
          <span className="font-mono text-xs font-bold text-on-surface truncate block">
            {receipt.transactionId}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Date
          </span>
          <span className="text-xs font-semibold text-on-surface">
            {receipt.paymentDate}
          </span>
        </div>
      </div>

      {/* Itemized Breakdown matching Stitch anything_clean_receipt_invoice_support */}
      <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 space-y-2.5 text-xs shadow-inner">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Service ({receipt.serviceName})</span>
          <span className="font-mono text-on-surface font-semibold">₹{receipt.serviceAmount}</span>
        </div>

        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Fabric Care Add-ons</span>
          <span className="font-mono text-on-surface font-semibold">₹{receipt.addOnsAmount}</span>
        </div>

        <div className="flex justify-between items-center text-green-400 font-semibold">
          <span>Promotional Discount</span>
          <span className="font-mono">-₹{receipt.discountAmount}</span>
        </div>

        <div className="border-t border-white/5 pt-2.5 mt-1 flex justify-between items-center font-headline font-bold text-sm">
          <span className="text-on-surface">Total Paid</span>
          <span className="text-primary font-mono text-base">₹{receipt.totalAmount}</span>
        </div>
      </div>
    </section>
  );
}
