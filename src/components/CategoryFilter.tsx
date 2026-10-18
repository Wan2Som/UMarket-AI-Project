"use client";

import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/format";
import { CategoryIcon } from "./CategoryIcon";

export type CategoryFilterValue = Category | "ALL";

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  counts: Partial<Record<CategoryFilterValue, number>>;
}

/** Horizontal, scrollable category pills styled as the channel's hashtags. */
export function CategoryFilter({ value, onChange, counts }: CategoryFilterProps) {
  const options: { id: CategoryFilterValue; label: string }[] = [
    { id: "ALL", label: "Everything" },
    ...CATEGORIES.map((c) => ({ id: c.id as CategoryFilterValue, label: c.hashtag })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter by category"
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "group flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border pl-3 pr-2 text-sm font-semibold transition-all duration-200",
              active
                ? "border-transparent bg-fg text-bg shadow-float"
                : "border-line bg-surface text-muted backdrop-blur-md hover:border-line-strong hover:text-fg",
            )}
          >
            <CategoryIcon category={o.id} className="h-4 w-4" />
            <span className={cn(o.id !== "ALL" && "font-display tracking-tight")}>{o.label}</span>
            <span
              className={cn(
                "tabular min-w-7 rounded-full px-2 py-0.5 text-xs",
                active ? "bg-bg/15 text-bg" : "bg-line text-muted group-hover:text-fg",
              )}
            >
              {counts[o.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
