import React from "react";
import Link from "next/link";
import { SupportCategoryOption } from "@/types/customer/support";
import { Receipt, CreditCard, Sparkles, Truck, ChevronRight } from "lucide-react";

interface SupportCategoryCardsProps {
  categories: SupportCategoryOption[];
  onSelectCategory?: (categoryId: string) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  receipt_long: <Receipt className="h-5 w-5" />,
  payments: <CreditCard className="h-5 w-5" />,
  dry_cleaning: <Sparkles className="h-5 w-5" />,
  local_shipping: <Truck className="h-5 w-5" />,
};

export function SupportCategoryCards({
  categories,
  onSelectCategory,
}: SupportCategoryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory?.(cat.id)}
          className="bg-surface-container rounded-2xl border border-white/10 p-5 text-left hover:border-primary/40 hover:bg-surface-container-high/60 transition-all group flex flex-col justify-between shadow-lg"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              {ICONS_MAP[cat.iconName] || <Sparkles className="h-5 w-5" />}
            </div>

            <div>
              <h3 className="font-bold text-sm text-on-surface font-headline group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                {cat.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-primary font-bold mt-4 pt-2 border-t border-white/5">
            <span>Browse Topics</span>
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      ))}
    </div>
  );
}
