"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { OperationalBookingView, AssignmentActivity } from "@/types/admin/operations";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { OperationsBookingDetailsView } from "./OperationsBookingDetailsView";
import { AssignProviderModal } from "../modals/AssignProviderModal";
import { AssignDeliveryPartnerModal } from "../modals/AssignDeliveryPartnerModal";
import { ReassignModal } from "../modals/ReassignModal";
import { UnassignModal } from "../modals/UnassignModal";

interface OperationsBookingDetailsMasterViewProps {
  bookingId: string;
}

export function OperationsBookingDetailsMasterView({
  bookingId,
}: OperationsBookingDetailsMasterViewProps) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const actorName = user?.name || "Admin Operations";

  const [bookingView, setBookingView] = useState<OperationalBookingView | null>(null);
  const [activities, setActivities] = useState<AssignmentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [modalType, setModalType] = useState<
    | "assign_provider"
    | "reassign_provider"
    | "unassign_provider"
    | "assign_delivery"
    | "reassign_delivery"
    | "unassign_delivery"
    | null
  >(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [detail, acts] = await Promise.all([
        adminOperationsService.getOperationalBookingDetail(organizationId, bookingId),
        adminOperationsService.getAssignmentActivities(organizationId, bookingId),
      ]);

      if (!detail) {
        setError(`Booking #${bookingId} was not found in active operations or does not belong to your organization.`);
      } else {
        setBookingView(detail);
        setActivities(acts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load operational booking details.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, bookingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeModal = () => setModalType(null);

  // Mutation confirm handlers
  const handleConfirmAssignProvider = async (
    bId: string,
    providerId: string,
    notes?: string
  ) => {
    await adminOperationsService.assignProvider(organizationId, bId, providerId, actorName, notes);
    await loadData();
  };

  const handleConfirmReassignProvider = async (
    bId: string,
    newProviderId: string,
    notes?: string
  ) => {
    await adminOperationsService.reassignProvider(organizationId, bId, newProviderId, actorName, notes);
    await loadData();
  };

  const handleConfirmUnassignProvider = async (bId: string, notes?: string) => {
    await adminOperationsService.unassignProvider(organizationId, bId, actorName, notes);
    await loadData();
  };

  const handleConfirmAssignDelivery = async (
    bId: string,
    partnerId: string,
    notes?: string
  ) => {
    await adminOperationsService.assignDeliveryPartner(organizationId, bId, partnerId, actorName, notes);
    await loadData();
  };

  const handleConfirmReassignDelivery = async (
    bId: string,
    newPartnerId: string,
    notes?: string
  ) => {
    await adminOperationsService.reassignDeliveryPartner(organizationId, bId, newPartnerId, actorName, notes);
    await loadData();
  };

  const handleConfirmUnassignDelivery = async (bId: string, notes?: string) => {
    await adminOperationsService.unassignDeliveryPartner(organizationId, bId, actorName, notes);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary animate-spin mb-4">
          <Loader2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface">Loading operational booking...</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Evaluating provider workload, delivery requirements, and audit timeline.
        </p>
      </div>
    );
  }

  if (error || !bookingView) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface">Unable to load booking</h3>
        <p className="text-xs text-on-surface-variant mt-1.5 mb-6">
          {error || "The requested booking does not exist or has been removed."}
        </p>
        <Link
          href="/admin/operations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Operations Queue
        </Link>
      </div>
    );
  }

  return (
    <>
      <OperationsBookingDetailsView
        bookingView={bookingView}
        activities={activities}
        onOpenAssignProvider={() => setModalType("assign_provider")}
        onOpenReassignProvider={() => setModalType("reassign_provider")}
        onOpenUnassignProvider={() => setModalType("unassign_provider")}
        onOpenAssignDelivery={() => setModalType("assign_delivery")}
        onOpenReassignDelivery={() => setModalType("reassign_delivery")}
        onOpenUnassignDelivery={() => setModalType("unassign_delivery")}
      />

      {/* Modals */}
      <AssignProviderModal
        isOpen={modalType === "assign_provider"}
        onClose={closeModal}
        bookingView={bookingView}
        onConfirm={handleConfirmAssignProvider}
      />

      <AssignDeliveryPartnerModal
        isOpen={modalType === "assign_delivery"}
        onClose={closeModal}
        bookingView={bookingView}
        onConfirm={handleConfirmAssignDelivery}
      />

      <ReassignModal
        isOpen={modalType === "reassign_provider" || modalType === "reassign_delivery"}
        onClose={closeModal}
        bookingView={bookingView}
        targetType={modalType === "reassign_provider" ? "provider" : "delivery_partner"}
        onConfirm={
          modalType === "reassign_provider"
            ? handleConfirmReassignProvider
            : handleConfirmReassignDelivery
        }
      />

      <UnassignModal
        isOpen={modalType === "unassign_provider" || modalType === "unassign_delivery"}
        onClose={closeModal}
        bookingView={bookingView}
        targetType={modalType === "unassign_provider" ? "provider" : "delivery_partner"}
        onConfirm={
          modalType === "unassign_provider"
            ? handleConfirmUnassignProvider
            : handleConfirmUnassignDelivery
        }
      />
    </>
  );
}
