"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServicePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function ServicePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ServicePaginationProps) {
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
          Showing{" "}
          <strong className="text-on-surface font-semibold">
            {startResult}
          </strong>{" "}
          to{" "}
          <strong className="text-on-surface font-semibold">{endResult}</strong>{" "}
          of <strong className="text-on-surface font-semibold">{total}</strong>{" "}
          services
        </span>

        <div className="flex items-center gap-1.5 ml-2 border-l border-surface-variant/40 pl-3">
          <span className="text-[11px] text-outline">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
            className="bg-surface-container border border-surface-variant rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-surface-variant bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-outline"
                >
                  ...
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-primary text-on-primary shadow-sm"
                    : "border border-surface-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-surface-variant bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
