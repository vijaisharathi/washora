import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DisputesPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function DisputesPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DisputesPaginationProps) {
  if (total === 0) return null;

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
      {/* Items count info */}
      <div className="text-xs text-on-surface-variant font-mono">
        Showing <span className="font-bold text-on-surface">{startIdx}</span> to{" "}
        <span className="font-bold text-on-surface">{endIdx}</span> of{" "}
        <span className="font-bold text-on-surface">{total}</span> disputes
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="py-1 px-2 text-xs rounded-md bg-surface-container/60 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-md bg-surface-container/60 hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none text-on-surface-variant transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-mono text-on-surface font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-md bg-surface-container/60 hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none text-on-surface-variant transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
