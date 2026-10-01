import React from "react";
import { cn } from "@/lib/utils";

interface ProviderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "container" | "high" | "highlight";
  className?: string;
}

export function ProviderCard({
  children,
  variant = "default",
  className,
  ...props
}: ProviderCardProps) {
  const variantStyles = {
    default: "bg-surface-container-low border-white/5",
    container: "bg-surface-container border-white/5",
    high: "bg-surface-container-high border-white/10",
    highlight: "bg-surface-container border-primary/30 shadow-[0_0_15px_rgba(220,184,255,0.05)]",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
