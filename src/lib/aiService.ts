/**
 * AI service facade: the only module the UI talks to for AI features.
 *
 *   1. Categoriser  — Multinomial Naive Bayes over EN/BM listing text (lib/ai/categorizer.ts)
 *   2. Tagger       — catalogue item detection + signal tags (lib/ai/tagger.ts)
 *   3. Price advisor — condition/depreciation rules per item type (lib/ai/pricing.ts)
 *   4. Impact model — kg material and kg CO2e kept in use when sold (lib/ai/impact.ts)
 *   5. Quality checks — miscategorisation and spam signals (lib/ai/quality.ts)
 *
 * Everything runs in the browser: no API keys, no per-request cost, and the
 * seller sees suggestions as they type.
 */
import type { Category, Condition, ListingAIMeta, ListingImpact } from "./types";
import { classifyListing, type CategoryPrediction } from "./ai/categorizer";
import { detectItem, suggestTags } from "./ai/tagger";
import { recommendPrice, type PriceRecommendation } from "./ai/pricing";
import { estimateImpact } from "./ai/impact";
import { qualityChecks, type QualityFlag } from "./ai/quality";
import type { CatalogItem } from "./ai/itemCatalog";

export { classifyListing } from "./ai/categorizer";
export { recommendPrice, judgePrice } from "./ai/pricing";
export { estimateImpact, aggregateImpact } from "./ai/impact";
export type { CategoryPrediction } from "./ai/categorizer";
export type { PriceRecommendation, PriceVerdict } from "./ai/pricing";
export type { QualityFlag } from "./ai/quality";
export type { ImpactTotals } from "./ai/impact";

export interface ListingDraft {
  title: string;
  description: string;
  /** The category the seller picked, if they overrode the suggestion. */
  category: Category | null;
  condition: Condition | null;
  price: number | null;
  originalPrice: number | null;
}

export interface ListingAnalysis {
  prediction: CategoryPrediction;
  /** Category the rest of the analysis is based on (seller's choice wins). */
  effectiveCategory: Category;
  item: CatalogItem | null;
  tags: string[];
  price: PriceRecommendation;
  impact: ListingImpact;
  flags: QualityFlag[];
}

export function analyzeListing(draft: ListingDraft): ListingAnalysis {
  const prediction = classifyListing(draft.title, draft.description);
  const effectiveCategory = draft.category ?? prediction.category;
  const match = detectItem(draft.title, draft.description, effectiveCategory);
  const item = match && match.item.category === effectiveCategory ? match.item : null;

  return {
    prediction,
    effectiveCategory,
    item,
    tags: suggestTags(draft.title, draft.description, item),
    price: recommendPrice({
      category: effectiveCategory,
      item,
      condition: effectiveCategory === "PRELOVED" ? draft.condition : null,
      originalPrice: draft.originalPrice,
      askingPrice: draft.price,
    }),
    impact: estimateImpact(effectiveCategory, item),
    flags: qualityChecks(draft.title, draft.description, draft.category, prediction),
  };
}

/** The compact record stored on the listing document. */
export function toAIMeta(a: ListingAnalysis): ListingAIMeta {
  return {
    suggestedCategory: a.prediction.category,
    confidence: Math.round(a.prediction.confidence * 1000) / 1000,
    itemType: a.item?.id ?? null,
    priceLow: a.price.low,
    priceHigh: a.price.high,
  };
}
