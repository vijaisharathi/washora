"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Scale,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Flame,
  User,
  Store,
  Bike,
  Building2,
  CreditCard,
  Layers,
  ExternalLink,
  FileText,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useAdminDisputeDetail } from "../../../hooks/useAdminDisputes";
import {
  DisputeStatus,
  SupportPriority,
  DisputeOutcome,
} from "@/types/admin/support";
import { AssignDisputeModal } from "../modals/AssignDisputeModal";
import { ChangeDisputeStatusModal } from "../modals/ChangeDisputeStatusModal";
import { RecordDecisionModal } from "../modals/RecordDecisionModal";
import { AddEvidenceModal } from "../modals/AddEvidenceModal";

interface DisputeDetailsMasterViewProps {
  disputeId: string;
}

export function DisputeDetailsMasterView({
  disputeId,
}: DisputeDetailsMasterViewProps) {
  const router = useRouter();
  const {
    loading,
    error,
    detail,
    assignees,
    refetch,
    updateStatus,
    assignDispute,
    unassignDispute,
    recordDecision,
    addEvidence,
  } = useAdminDisputeDetail(disputeId);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        <div className="h-8 w-48 rounded bg-surface-container/50 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-surface-container/40 animate-pulse" />
          <div className="h-96 rounded-2xl bg-surface-container/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto text-center py-16">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-on-surface mb-1">
          {error || "Dispute Case Not Found"}
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          The requested dispute does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/admin/disputes"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dispute Resolution Center</span>
        </Link>
      </div>
    );
  }

  const {
    dispute,
    raisedBy,
    against,
    booking,
    financialContext,
    assignedReviewer,
    evidence,
    activities,
  } = detail;

  const isTerminal = dispute.status === "Closed";

  const renderPriorityBadge = (priority: SupportPriority) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <Flame className="w-3.5 h-3.5" />
            <span>Urgent</span>
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High</span>
          </span>
        );
      case "Normal":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/30">
            <span>Normal</span>
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <span>Low</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Open</span>
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
      case "Awaiting Evidence":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Awaiting Evidence</span>
          </span>
        );
      case "Decision Made":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Decision Made</span>
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Closed</span>
          </span>
        );
    }
  };

  const renderOutcomeBadge = (outcome: DisputeOutcome) => {
    switch (outcome) {
      case "Customer Favored":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/30">
            Customer Favored
          </span>
        );
      case "Provider Favored":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            Provider Favored
          </span>
        );
      case "Delivery Partner Favored":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/30">
            Delivery Partner Favored
          </span>
        );
      case "Partially Resolved":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-500/10 text-teal-500 border border-teal-500/30">
            Partially Resolved
          </span>
        );
      case "No Action Required":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
            No Action Required
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/disputes"
            className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Back to Dispute Center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                {dispute.disputeNumber}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                ({dispute.id})
              </span>
              {renderStatusBadge(dispute.status)}
              {renderPriorityBadge(dispute.priority)}
            </div>
            <h1 className="text-lg font-bold text-on-surface mt-0.5">
              {dispute.subject}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        {!isTerminal && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-xs font-medium text-on-surface inline-flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>{dispute.assignedTo ? "Reassign Reviewer" : "Assign Reviewer"}</span>
            </button>

            {dispute.status === "Open" && (
              <button
                type="button"
                onClick={() => updateStatus("Under Review")}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Begin Review</span>
              </button>
            )}

            {dispute.status === "Under Review" && (
              <>
                <button
                  type="button"
                  onClick={() => updateStatus("Awaiting Evidence")}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Request Evidence</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Record Ruling</span>
                </button>
              </>
            )}

            {dispute.status === "Awaiting Evidence" && (
              <>
                <button
                  type="button"
                  onClick={() => updateStatus("Under Review")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resume Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Record Ruling</span>
                </button>
              </>
            )}

            {dispute.status === "Decision Made" && (
              <button
                type="button"
                onClick={() => updateStatus("Resolved")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finalize Resolution</span>
              </button>
            )}

            {dispute.status === "Resolved" && (
              <button
                type="button"
                onClick={() => updateStatus("Closed")}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Archive & Close</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Case Info */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Dispute Claim Details</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-medium">
                  Type:
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-container/60 border border-outline-variant/30 text-on-surface">
                  {dispute.type}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-on-surface-variant">
                Claim Statement:
              </span>
              <p className="text-xs text-on-surface leading-relaxed mt-1 whitespace-pre-wrap bg-surface-container/30 p-3.5 rounded-xl border border-outline-variant/20">
                {dispute.description}
              </p>
            </div>

            {/* Financial Amount Involved */}
            {dispute.amountInvolved !== undefined && (
              <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Disputed Amount
                  </span>
                  <div className="text-base font-mono font-bold text-primary">
                    ₹{dispute.amountInvolved.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-xs text-on-surface-variant text-right">
                  Financial ledger linkage verified with payment gateway
                </div>
              </div>
            )}

            {/* Ruling / Decision Summary if Decision Made or Resolved */}
            {dispute.outcome && (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600">
                    <FileCheck className="w-4 h-4" />
                    <span>Official Dispute Ruling</span>
                  </div>
                  {renderOutcomeBadge(dispute.outcome)}
                </div>
                {dispute.resolution && (
                  <p className="text-xs text-on-surface leading-relaxed pt-1 border-t border-teal-500/20">
                    {dispute.resolution}
                  </p>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-on-surface-variant border-t border-outline-variant/20">
              <div>
                <span className="block text-[10px] uppercase font-bold text-on-surface-variant">
                  Filed At
                </span>
                <span className="text-on-surface">
                  {new Date(dispute.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-on-surface-variant">
                  Last Updated
                </span>
                <span className="text-on-surface">
                  {new Date(dispute.updatedAt).toLocaleString("en-IN")}
                </span>
              </div>
              {dispute.resolvedAt && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-on-surface-variant">
                    Resolved At
                  </span>
                  <span className="text-on-surface">
                    {new Date(dispute.resolvedAt).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Parties Involved Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Parties Involved in Dispute</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Raised By */}
              <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Raised By (Claimant)
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {raisedBy.role}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {raisedBy.name}
                  </div>
                  <div className="text-[11px] font-mono text-primary">
                    ID: {raisedBy.id}
                  </div>
                </div>
                {raisedBy.email && (
                  <div className="text-xs font-mono text-on-surface-variant">
                    {raisedBy.email}
                  </div>
                )}
                {raisedBy.phone && (
                  <div className="text-xs font-mono text-on-surface-variant">
                    {raisedBy.phone}
                  </div>
                )}
              </div>

              {/* Against */}
              <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    Against (Respondent)
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {against.role}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {against.name}
                  </div>
                  <div className="text-[11px] font-mono text-primary">
                    ID: {against.id}
                  </div>
                </div>
                {against.email && (
                  <div className="text-xs font-mono text-on-surface-variant">
                    {against.email}
                  </div>
                )}
                {against.phone && (
                  <div className="text-xs font-mono text-on-surface-variant">
                    {against.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking & Financial Context Card */}
          {booking && (
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>Associated Booking & Financial Context</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Booking Information
                    </span>
                    <Link
                      href={booking.route}
                      className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="font-mono text-xs font-bold text-on-surface">
                    {booking.bookingNumber} ({booking.id})
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {booking.serviceName} • Status: <span className="font-semibold text-on-surface">{booking.status}</span>
                  </div>
                  <div className="text-xs text-on-surface font-mono font-bold">
                    Order Total: ₹{booking.totalAmount}
                  </div>
                </div>

                {financialContext && (
                  <div className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Payment & Settlement Ledger
                    </span>
                    <div className="text-xs text-on-surface">
                      Payment ID: <span className="font-mono font-bold">{financialContext.paymentId || "PAY-DISP-001"}</span>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Status: <span className="font-semibold text-on-surface">{financialContext.paymentStatus || "Completed"}</span>
                    </div>
                    <div className="text-[11px] font-mono text-on-surface-variant">
                      Txn Ref: {financialContext.transactionReference}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Case Evidence Dossier Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-on-surface">
                  Case Evidence Dossier
                </h2>
                <span className="text-xs text-on-surface-variant font-mono">
                  ({evidence.length} entries)
                </span>
              </div>
              {!isTerminal && (
                <button
                  type="button"
                  onClick={() => setIsEvidenceModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Evidence</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {evidence.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-3 text-center">
                  No evidence has been added yet.
                </p>
              ) : (
                evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-surface-container/40 border border-outline-variant/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-on-surface">
                        {ev.title}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {new Date(ev.submittedAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {ev.description}
                    </p>
                    <div className="text-[10px] text-on-surface-variant">
                      Submitted by: <span className="font-medium text-on-surface">{ev.submittedByName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reviewer & Timeline */}
        <div className="space-y-6">
          {/* Assigned Reviewer Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Assigned Reviewer</span>
              </h2>
              {!isTerminal && assignedReviewer && (
                <button
                  type="button"
                  onClick={unassignDispute}
                  className="text-[11px] text-rose-500 hover:underline font-medium"
                >
                  Unassign
                </button>
              )}
            </div>

            {assignedReviewer ? (
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {assignedReviewer.name}
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {assignedReviewer.role} • ID: {assignedReviewer.id}
                  </div>
                </div>
                {assignedReviewer.assignedAt && (
                  <div className="text-[10px] font-mono text-on-surface-variant">
                    Assigned: {new Date(assignedReviewer.assignedAt).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-on-surface-variant italic mb-2">
                  No reviewer assigned to investigate this dispute.
                </p>
                {!isTerminal && (
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                  >
                    Assign Reviewer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dispute Activity Timeline */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span>Dispute Audit History</span>
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic text-center py-2">
                  No activity history recorded yet.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 text-xs pb-2 border-b border-outline-variant/10 last:border-none"
                  >
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 text-[10px] text-on-surface-variant font-mono">
                        <span className="font-bold text-on-surface">{act.type}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        By {act.performedByName}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignDisputeModal
        isOpen={isAssignModalOpen}
        dispute={dispute}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={assignDispute}
      />

      <ChangeDisputeStatusModal
        isOpen={isStatusModalOpen}
        dispute={dispute}
        onClose={() => setIsStatusModalOpen(false)}
        onSelectStatus={(st) => {
          if (st === "Decision Made") setIsDecisionModalOpen(true);
          else updateStatus(st);
        }}
      />

      <RecordDecisionModal
        isOpen={isDecisionModalOpen}
        dispute={dispute}
        onClose={() => setIsDecisionModalOpen(false)}
        onRecordDecision={recordDecision}
      />

      <AddEvidenceModal
        isOpen={isEvidenceModalOpen}
        dispute={dispute}
        onClose={() => setIsEvidenceModalOpen(false)}
        onAddEvidence={addEvidence}
      />
    </div>
  );
}
