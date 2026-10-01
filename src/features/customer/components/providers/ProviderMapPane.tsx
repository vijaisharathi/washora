"use client";

import React from "react";
import { Search } from "lucide-react";

interface ProviderMapPaneProps {
  onSearchArea: () => void;
}

export function ProviderMapPane({ onSearchArea }: ProviderMapPaneProps) {
  return (
    <section className="hidden lg:block lg:w-7/12 xl:w-2/3 h-full relative bg-surface-container-lowest overflow-hidden border-l border-white/5 rounded-2xl">
      {/* Background Map Imagery matching Stitch */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60 mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvoZoGNDaU0mN4wd1z2EP0fLRoVPT7KwDeJmVClrBHo0keFUwf-J35DHr0ODOe-_ZGh6SML_9I3ZmiPk2rsnK8xP1ogdakWhJjZLRBE4nwK4eMz9OZUOK7q-gQ75FHYQhjFoXtK3ZwVh-VQUaNi8DOdB8xCFMocJ1yYbwVOayTfEr5b2J499lJBCz7d8nNDURZ3XgOBEz6FFQe_ynZSLk8ksmkUrrndfrv6MF8osBl5sVNWZrI_Ignmw')`,
        }}
      />

      {/* Map Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent w-32" />

      {/* Map Pins */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        <div className="bg-surface text-primary font-bold text-xs px-3 py-1 rounded-full shadow-lg border border-primary/40 mb-2 relative z-10 group-hover:bg-primary group-hover:text-on-primary transition-colors">
          LuxeCare • 1.2km
        </div>
        <div className="w-3.5 h-3.5 bg-primary rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2 shadow-[0_0_15px_rgba(220,184,255,0.8)] animate-pulse" />
      </div>

      <div className="absolute top-2/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        <div className="bg-surface text-on-surface font-bold text-xs px-3 py-1 rounded-full shadow-lg border border-white/10 mb-2 relative z-10 group-hover:bg-primary group-hover:text-on-primary transition-colors">
          CleanX • 2.1km
        </div>
        <div className="w-3.5 h-3.5 bg-primary rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2 shadow-[0_0_15px_rgba(220,184,255,0.8)]" />
      </div>

      {/* Floating Action Button matching Stitch */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center bg-surface-container/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl z-20">
        <button
          type="button"
          onClick={onSearchArea}
          className="bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search this locality</span>
        </button>
      </div>
    </section>
  );
}
