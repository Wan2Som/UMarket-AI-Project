import type { ListingStatus } from "@/lib/types";
import { cn } from "@/lib/format";

const STYLES: Record<ListingStatus, { label: string; pill: string; dot: string }> = {
  available: { label: "Available", pill: "text-accent border-accent/30 bg-accent/10", dot: "bg-accent" },
  reserved: { label: "Reserved", pill: "text-reserved border-reserved/35 bg-reserved/10", dot: "bg-reserved" },
  sold: { label: "Sold", pill: "text-sold border-sold/30 bg-sold/10", dot: "bg-sold" },
};

export function StatusPill({ status, className }: { status: ListingStatus; className?: string }) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md",
        s.pill,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "available" && (
          <span className={cn("absolute inline-flex h-full w-full rounded-full animate-live-ping", s.dot)} />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", s.dot)} />
      </span>
      {s.label}
    </span>
  );
}
