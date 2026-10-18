"use client";

import type { ReactNode } from "react";
import { TriangleAlert, Check, Info, Leaf, Plus, Sparkles } from "lucide-react";
import type { ListingAnalysis, PriceVerdict } from "@/lib/aiService";
import { CATEGORIES } from "@/lib/constants";
import { cn, formatRM } from "@/lib/format";
import type { Category } from "@/lib/types";
import { GlassCard } from "./ui/GlassCard";
import { CategoryIcon } from "./CategoryIcon";

interface AIAssistantPanelProps {
  analysis: ListingAnalysis | null;
  chosenCategory: Category;
  categoryFollowsAI: boolean;
  tags: string[];
  price: number | null;
  onUseCategory: (c: Category) => void;
  onAddTag: (tag: string) => void;
  onUsePrice: (price: number) => void;
}

const VERDICT_TEXT: Record<PriceVerdict, { text: string; tone: string }> = {
  great_deal: { text: "Below the usual range. It should go quickly.", tone: "text-accent" },
  fair: { text: "Within the usual range for this item.", tone: "text-cyan" },
  high: { text: "Above the usual range. Expect slower interest or haggling.", tone: "text-reserved" },
  above_face_value: { text: "Above face value. Please resell at or below what you paid.", tone: "text-sold" },
  unknown: { text: "Enter your price to compare.", tone: "text-muted" },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      {children}
    </section>
  );
}

/** Live suggestions from lib/aiService.ts while the seller types. */
export function AIAssistantPanel({
  analysis,
  chosenCategory,
  categoryFollowsAI,
  tags,
  price,
  onUseCategory,
  onAddTag,
  onUsePrice,
}: AIAssistantPanelProps) {
  return (
    <GlassCard as="aside" className="relative overflow-hidden p-5 sm:p-6" aria-label="AI listing assistant" aria-live="polite">
      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-ai/20 blur-3xl" />
      <header className="relative mb-5 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
          <Sparkles className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-base font-bold tracking-tight text-fg">Listing assistant</h2>
          <p className="text-xs text-muted">Runs on your phone. Nothing is sent anywhere.</p>
        </div>
      </header>

      {!analysis ? (
        <p className="relative rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm leading-relaxed text-muted">
          Start typing a title. Category, tags and a fair price will appear here as you write.
        </p>
      ) : (
        <div className="relative space-y-4">
          {/* 1. Category */}
          <Section title="Category">
            <ul className="space-y-2">
              {CATEGORIES.map((c) => {
                const p = analysis.prediction.probabilities[c.id];
                const top = analysis.prediction.category === c.id;
                return (
                  <li key={c.id} className="flex items-center gap-3 text-sm">
                    <CategoryIcon category={c.id} className={cn("h-4 w-4 shrink-0", top ? "text-ai" : "text-muted")} />
                    <span className={cn("w-24 shrink-0 font-display text-[13px] font-bold tracking-tight", top ? "text-fg" : "text-muted")}>
                      {c.hashtag}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span
                        className={cn("block h-full rounded-full transition-[width] duration-500", top ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-muted/40")}
                        style={{ width: `${Math.round(p * 100)}%` }}
                      />
                    </span>
                    <span className="tabular w-10 text-right text-xs text-muted">{Math.round(p * 100)}%</span>
                  </li>
                );
              })}
            </ul>
            {analysis.prediction.informative ? (
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {analysis.prediction.evidence.length > 0 && (
                  <>Based on the words {analysis.prediction.evidence.map((w) => `“${w}”`).join(", ")}. </>
                )}
                {chosenCategory !== analysis.prediction.category && !categoryFollowsAI ? (
                  <button
                    type="button"
                    onClick={() => onUseCategory(analysis.prediction.category)}
                    className="font-semibold text-ai underline-offset-2 hover:underline"
                  >
                    Switch to {CATEGORIES.find((c) => c.id === analysis.prediction.category)?.hashtag}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-accent">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Category set
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted">Not sure yet. Add a few more words about the item.</p>
            )}
          </Section>

          {/* 2. Tags */}
          {analysis.tags.length > 0 && (
            <Section title="Suggested tags">
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((t) => {
                  const added = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={added}
                      onClick={() => onAddTag(t)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        added ? "border-accent/30 bg-accent/10 text-accent" : "border-line text-muted hover:border-ai/50 hover:text-fg",
                      )}
                    >
                      {added ? <Check className="h-3 w-3" aria-hidden /> : <Plus className="h-3 w-3" aria-hidden />}#{t}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* 3. Price */}
          <Section title={analysis.item ? `Fair price for a ${analysis.item.label.toLowerCase()}` : "Fair price"}>
            <PriceRange low={analysis.price.low} high={analysis.price.high} price={price} />
            <p className="mt-3 text-xs leading-relaxed text-muted">{analysis.price.basis}.</p>
            <p className={cn("mt-1.5 text-sm font-medium", VERDICT_TEXT[analysis.price.verdict].tone)}>
              {VERDICT_TEXT[analysis.price.verdict].text}
            </p>
            {price !== analysis.price.suggested && (
              <button
                type="button"
                onClick={() => onUsePrice(analysis.price.suggested)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ai/12 px-3 py-1.5 text-xs font-semibold text-ai hover:bg-ai/20"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Use {formatRM(analysis.price.suggested)}
              </button>
            )}
          </Section>

          {/* 4. Impact */}
          <Section title="If it sells">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-muted">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              {analysis.impact.kgCO2e > 0 || analysis.impact.kgMaterial > 0 ? (
                <span>
                  About <strong className="text-fg">{analysis.impact.kgMaterial} kg</strong> stays in use and roughly{" "}
                  <strong className="text-fg">{analysis.impact.kgCO2e} kg CO₂e</strong> is avoided. It counts toward the
                  campus total when you mark it sold.
                </span>
              ) : (
                <span>
                  {analysis.effectiveCategory === "TICKETS"
                    ? "A resold seat doesn't go to waste. Tickets don't add to the material total."
                    : "Services don't add to the material total, but they keep money circulating on campus."}
                </span>
              )}
            </p>
          </Section>

          {/* 5. Checks */}
          {analysis.flags.length > 0 && (
            <Section title="Before you post">
              <ul className="space-y-2">
                {analysis.flags.map((f) => (
                  <li key={f.message} className="flex items-start gap-2 text-sm leading-relaxed">
                    {f.level === "warn" ? (
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-reserved" aria-hidden />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
                    )}
                    <span className={f.level === "warn" ? "text-fg" : "text-muted"}>{f.message}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </GlassCard>
  );
}

/** Range bar with the seller's own price marked on it. */
function PriceRange({ low, high, price }: { low: number; high: number; price: number | null }) {
  const min = low * 0.5;
  const max = high * 1.5;
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="tabular font-display text-2xl font-extrabold tracking-tight text-fg">
          {formatRM(low)}–{formatRM(high).replace("RM ", "")}
        </span>
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-line">
        <span
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
          style={{ left: pos(low), width: `calc(${pos(high)} - ${pos(low)})` }}
        />
        {price != null && price > 0 && (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-strong bg-fg shadow transition-[left] duration-300"
            style={{ left: pos(price) }}
            title={`Your price: ${formatRM(price)}`}
          />
        )}
      </div>
      {price != null && price > 0 && <p className="mt-2 text-xs text-muted">Dot shows your price: {formatRM(price)}</p>}
    </div>
  );
}
