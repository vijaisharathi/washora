"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  LifeBuoy,
  Send,
  AlertTriangle,
  User,
  Store,
  Bike,
  Building2,
  Layers,
  CreditCard,
  Star,
} from "lucide-react";
import { useAdminCreateSupportTicket } from "../../../hooks/useAdminSupport";
import {
  CreateSupportTicketSchema,
  CreateSupportTicketFormValues,
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  SUPPORT_REQUESTER_TYPES,
  SupportRequesterType,
} from "@/types/admin/support";

export function CreateSupportTicketView() {
  const router = useRouter();
  const { loading, error, createTicket, getRequesters } = useAdminCreateSupportTicket();

  const [requesterOptions, setRequesterOptions] = useState<
    Array<{ id: string; name: string; info: string }>
  >([]);
  const [loadingRequesters, setLoadingRequesters] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSupportTicketFormValues>({
    resolver: zodResolver(CreateSupportTicketSchema),
    defaultValues: {
      requesterType: "Customer",
      requesterId: "",
      category: "Booking Issue",
      priority: "Normal",
      subject: "",
      description: "",
      bookingId: "",
      paymentId: "",
      transactionId: "",
      reviewId: "",
    },
  });

  const selectedRequesterType = watch("requesterType");

  useEffect(() => {
    if (selectedRequesterType) {
      setLoadingRequesters(true);
      getRequesters(selectedRequesterType)
        .then((options) => {
          setRequesterOptions(options);
          if (options.length > 0) {
            setValue("requesterId", options[0].id);
          } else {
            setValue("requesterId", "");
          }
        })
        .finally(() => setLoadingRequesters(false));
    }
  }, [selectedRequesterType, getRequesters, setValue]);

  const onSubmit = async (data: CreateSupportTicketFormValues) => {
    try {
      const created = await createTicket(data);
      router.push(`/admin/support/${created.id}`);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/support"
          className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
          title="Back to Support Tickets"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            <span>Create New Support Ticket</span>
          </h1>
          <p className="text-xs text-on-surface-variant">
            File an operational case, merchant ticket, or customer service inquiry.
          </p>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-5"
      >
        {/* Row 1: Requester Type & Requester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Requester Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("requesterType")}
              className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
            >
              {SUPPORT_REQUESTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.requesterType && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">
                {errors.requesterType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Select Requester <span className="text-rose-500">*</span>
            </label>
            {loadingRequesters ? (
              <div className="h-9 rounded-lg bg-surface-container/50 animate-pulse" />
            ) : (
              <select
                {...register("requesterId")}
                className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
              >
                {requesterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.id})
                  </option>
                ))}
              </select>
            )}
            {errors.requesterId && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">
                {errors.requesterId.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
            >
              {SUPPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("priority")}
              className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
            >
              {SUPPORT_PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Brief summary of the issue or inquiry (5–150 chars)..."
            {...register("subject")}
            className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
          />
          {errors.subject && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Detailed description of the problem, incident timeline, or inquiry (10–2000 chars)..."
            {...register("description")}
            className="w-full p-3 text-xs rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
          />
          {errors.description && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Optional Linkages */}
        <div className="pt-2 border-t border-outline-variant/20 space-y-3">
          <span className="block text-xs font-bold text-on-surface">
            Optional Cross-Entity Linkages
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Related Booking ID
              </label>
              <input
                type="text"
                placeholder="e.g. BKG-0001"
                {...register("bookingId")}
                className="w-full py-1.5 px-3 text-xs font-mono rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Related Payment ID
              </label>
              <input
                type="text"
                placeholder="e.g. PAY-0001"
                {...register("paymentId")}
                className="w-full py-1.5 px-3 text-xs font-mono rounded-lg bg-surface-container/50 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
          <Link
            href="/admin/support"
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40 inline-flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Creating Ticket..." : "Submit Ticket"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
