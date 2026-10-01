"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DeliveryPartnerPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function DeliveryPartnerPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DeliveryPartnerPaginationProps) {
  if (total === 0) return null;

  const startResult = Math.min((page - 1) * pageSize + 1, total);
  const endResult = Math.min(page * pageSize, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) {
        pages.push("...");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-on-surface-variant">
      {/* Result Range & Page Size Selector */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-on-surface font-semibold">{startResult}</strong> to{" "}
          <strong className="text-on-surface font-semibold">{endResult}</strong> of{" "}
          <strong className="text-on-surface font-semibold">{total}</strong> delivery partners
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-outline">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Select delivery partners per page"
            className="bg-surface-container border border-surface-variant rounded-md px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 rounded-lg border border-surface-variant text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((item, idx) => {
            if (item === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-outline">
                  ...
                </span>
              );
            }

            const pageNum = Number(item);
            const isCurrent = pageNum === page;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center font-medium transition-colors ${
                  isCurrent
                    ? "bg-primary text-primary-inverse"
                    : "text-on-surface hover:bg-surface-container border border-surface-variant"
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-surface-variant text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
