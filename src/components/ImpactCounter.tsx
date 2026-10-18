"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Info } from "lucide-react";
import { aggregateImpact } from "@/lib/aiService";
import { formatNumber, cn } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { GlassCard } from "./ui/GlassCard";

/** Counts up to `value` whenever it changes (respects reduced motion). */
function useCountUp(value: number, durationMs = 1100): number {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(origin + (value - origin) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return shown;
}

function Figure({ value, digits = 0, className }: { value: number; digits?: number; className?: string }) {
  const shown = useCountUp(value);
  return (
    <strong className={cn("tabular font-display font-extrabold tracking-tight", className)}>
      {formatNumber(shown, digits)}
    </strong>
  );
}

/**
 * Circular-economy metrics, written as a sentence so the numbers carry their
 * meaning. Totals are computed from every listing marked Sold.
 */
export function ImpactCounter({ soldListings, scope = "community" }: { soldListings: Listing[]; scope?: "community" | "you" }) {
  const t = aggregateImpact(soldListings);
  const [showMethod, setShowMethod] = useState(false);

  return (
    <GlassCard as="aside" className="relative overflow-hidden p-5 sm:p-6" aria-label="Sustainability impact">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          <Leaf className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <p className="text-[15px] leading-relaxed text-muted sm:text-base">
          {scope === "community" ? "So far, " : "Your sales have given "}
          <Figure value={t.itemsRehomed} className="text-xl text-fg" />{" "}
          {scope === "community" ? (t.itemsRehomed === 1 ? "item has found" : "items have found") : t.itemsRehomed === 1 ? "item" : "items"}{" "}
          a second owner{scope === "you" ? "" : " through PasarUTP"}. That keeps about{" "}
          <Figure value={t.kgMaterial} digits={1} className="text-xl text-accent" /> kg of material in use and avoids roughly{" "}
          <Figure value={t.kgCO2e} digits={1} className="text-xl text-cyan" /> kg CO₂e from making new ones, about the same
          as not driving <Figure value={t.kmNotDriven} className="text-fg" /> km.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setShowMethod((v) => !v)}
        aria-expanded={showMethod}
        className="relative mt-3 inline-flex items-center gap-1.5 pl-12 text-xs font-medium text-muted hover:text-fg"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
        How this is estimated
      </button>
      {showMethod && (
        <p className="relative mt-2 animate-rise pl-12 text-xs leading-relaxed text-muted">
          Each sold listing is matched by the AI to an item type with a typical mass and the emissions of making it new.
          Preloved items count 70% of those emissions, since not every resale replaces a new purchase. Food pre-orders count
          surplus avoided; tickets count nothing physical. Figures are indicative, not certified accounting.
        </p>
      )}
    </GlassCard>
  );
}
