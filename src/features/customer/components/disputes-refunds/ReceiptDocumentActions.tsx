"use client";

import React, { useState } from "react";
import { Receipt, Download, FileText, Check } from "lucide-react";

interface ReceiptDocumentActionsProps {
  orderNumber: string;
}

export function ReceiptDocumentActions({ orderNumber }: ReceiptDocumentActionsProps) {
  const [downloadedDoc, setDownloadedDoc] = useState<string | null>(null);

  const handleDownload = (docName: string) => {
    setDownloadedDoc(docName);
    setTimeout(() => {
      setDownloadedDoc(null);
    }, 2000);
  };

  return (
    <section className="bg-surface-container border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      <div className="border-b border-white/5 pb-3">
        <h2 className="font-bold text-base text-on-surface font-headline">
          Official Documents
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* View Receipt */}
        <button
          type="button"
          onClick={() => handleDownload("receipt")}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-surface-container-high transition-all rounded-xl p-3.5 flex items-center justify-between group cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Receipt className="h-4 w-4 text-primary" />
            <span className="font-bold text-on-surface">View Receipt</span>
          </div>
          {downloadedDoc === "receipt" ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">
              open_in_new
            </span>
          )}
        </button>

        {/* Download Receipt */}
        <button
          type="button"
          onClick={() => handleDownload("download-receipt")}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-surface-container-high transition-all rounded-xl p-3.5 flex items-center justify-between group cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Download className="h-4 w-4 text-primary" />
            <span className="font-bold text-on-surface">Download Receipt</span>
          </div>
          {downloadedDoc === "download-receipt" ? (
            <span className="text-[10px] text-green-400 font-bold">Downloaded</span>
          ) : (
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">
              file_download
            </span>
          )}
        </button>

        {/* View Invoice */}
        <button
          type="button"
          onClick={() => handleDownload("invoice")}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-surface-container-high transition-all rounded-xl p-3.5 flex items-center justify-between group cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-bold text-on-surface">Tax Invoice</span>
          </div>
          <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">
            description
          </span>
        </button>

        {/* Download Invoice */}
        <button
          type="button"
          onClick={() => handleDownload("download-invoice")}
          className="bg-surface-container-low border border-white/10 hover:border-primary/50 hover:bg-surface-container-high transition-all rounded-xl p-3.5 flex items-center justify-between group cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Download className="h-4 w-4 text-primary" />
            <span className="font-bold text-on-surface">Download Invoice</span>
          </div>
          {downloadedDoc === "download-invoice" ? (
            <span className="text-[10px] text-green-400 font-bold">Downloaded</span>
          ) : (
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">
              file_download
            </span>
          )}
        </button>
      </div>
    </section>
  );
}
