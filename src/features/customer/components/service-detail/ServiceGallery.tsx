"use client";

import React, { useState } from "react";

interface ServiceGalleryProps {
  images: string[];
  title: string;
}

export function ServiceGallery({ images, title }: ServiceGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentImage = images[activeIdx] || images[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Main Hero Image */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 relative group bg-surface-container-low shadow-2xl">
        {currentImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Thumbnail Strip matching Stitch */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`w-20 sm:w-24 h-20 sm:h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-surface-container-low ${
                activeIdx === idx
                  ? "border-primary ring-2 ring-primary/20 scale-95"
                  : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
