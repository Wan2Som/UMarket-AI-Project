"use client";

import { STATUSES } from "@/lib/constants";
import type { ListingStatus } from "@/lib/types";
import { Segmented } from "./ui/Segmented";

const ACTIVE: Record<ListingStatus, string> = {
  available: "!bg-accent !text-accent-fg",
  reserved: "!bg-reserved !text-slate-950",
  sold: "!bg-sold !text-white",
};

/** One-tap Available / Reserved / Sold switch for the seller dashboard. */
export function StatusToggle({
  value,
  onChange,
  disabled,
  title,
}: {
  value: ListingStatus;
  onChange: (s: ListingStatus) => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <Segmented<ListingStatus>
      label={`Status of ${title}`}
      size="sm"
      value={value}
      onChange={(s) => s !== value && onChange(s)}
      disabled={disabled}
      options={STATUSES.map((s) => ({ value: s.id, label: s.label, activeClassName: ACTIVE[s.id] }))}
    />
  );
}
