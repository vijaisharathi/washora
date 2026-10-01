import React from "react";
import Link from "next/link";
import { SupportTicketData } from "@/types/customer/support";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupportTicketSuccessModalProps {
  ticket: SupportTicketData;
}

export function SupportTicketSuccessModal({
  ticket,
}: SupportTicketSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto shadow-lg shadow-green-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-on-surface font-headline">
            Support Request Submitted
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Our care specialist team has received your ticket and is reviewing the details.
          </p>
        </div>

        {/* Ticket Reference Badge */}
        <div className="p-4 bg-surface-container-low border border-white/5 rounded-xl space-y-1.5 text-xs text-left shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Ticket ID</span>
            <span className="font-mono font-bold text-primary">{ticket.ticketNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Issue</span>
            <span className="text-on-surface font-semibold">{ticket.issueLabel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant font-medium">Expected Response</span>
            <span className="text-green-400 font-bold">
              {ticket.priority === "high" ? "< 4 Hours" : ticket.priority === "medium" ? "12–24 Hours" : "24–48 Hours"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/customer/orders" className="flex-1">
            <Button variant="outline" className="w-full text-xs font-semibold">
              Back to Orders
            </Button>
          </Link>
          <Link href="/customer/support" className="flex-1">
            <Button className="w-full gap-2 text-xs font-bold shadow-lg shadow-primary/20">
              <span>Help Center</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
