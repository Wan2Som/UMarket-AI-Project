import type { Category, Condition } from "../types";
import { CATEGORY_DEFAULTS, type CatalogItem, type Depreciation } from "./itemCatalog";

/**
 * Rule-based fair-price recommender for secondhand campus goods.
 *
 * PRELOVED: start from the new price (the seller's "price when new" if given,
 * otherwise the catalogue's typical retail range), then apply a resale band
 * for the condition and an adjustment for how fast that kind of item loses
 * value. FOOD and SERVICES: typical campus price per unit. TICKETS: anchored
 * to face value; asking for more than face value is flagged, to discourage
 * scalping inside the student community.
 */

/** Share of the new price a secondhand item typically fetches, by condition. */
export const CONDITION_BANDS: Record<Condition, [number, number]> = {
  new: [0.8, 0.92],
  like_new: [0.62, 0.78],
  good: [0.45, 0.6],
  fair: [0.28, 0.42],
  parts: [0.08, 0.18],
};

/** Electronics lose value faster; textbooks and clothes have thin resale markets. */
const DEPRECIATION_FACTOR: Record<Depreciation, number> = {
  electronics: 0.9,
  durable: 1,
  textbook: 0.85,
  apparel: 0.7,
};

export type PriceVerdict = "great_deal" | "fair" | "high" | "above_face_value" | "unknown";

export interface PriceRecommendation {
  low: number;
  high: number;
  suggested: number;
  unit: string;
  verdict: PriceVerdict;
  basis: string; // one-line explanation shown to the seller
}

export interface PriceInput {
  category: Category;
  item: CatalogItem | null;
  condition: Condition | null;
  originalPrice?: number | null;
  askingPrice?: number | null;
}

/** Round to prices people actually use at a pasar. */
export function friendlyRound(value: number): number {
  if (value < 10) return Math.max(1, Math.round(value * 2) / 2);
  if (value < 100) return Math.round(value);
  if (value < 1000) return Math.round(value / 5) * 5;
  return Math.round(value / 50) * 50;
}

export function judgePrice(asking: number | null | undefined, low: number, high: number): PriceVerdict {
  if (asking == null || !Number.isFinite(asking) || asking <= 0) return "unknown";
  if (asking < low * 0.9) return "great_deal";
  if (asking <= high * 1.1) return "fair";
  return "high";
}

export function recommendPrice({ category, item, condition, originalPrice, askingPrice }: PriceInput): PriceRecommendation {
  const defaults = CATEGORY_DEFAULTS[category];
  const range = item && item.category === category ? item.priceRange : defaults.priceRange;
  const unit = item && item.category === category ? item.unit : defaults.unit;
  const op = originalPrice && originalPrice > 0 ? originalPrice : null;

  if (category === "PRELOVED") {
    const cond = condition ?? "good";
    const [bandLo, bandHi] = CONDITION_BANDS[cond];
    const dep = DEPRECIATION_FACTOR[item?.depreciation ?? "durable"];
    const baseLo = op ?? range[0];
    const baseHi = op ?? range[1];
    const low = friendlyRound(baseLo * bandLo * dep);
    const high = Math.max(low, friendlyRound(baseHi * bandHi * dep));
    const suggested = friendlyRound((low + high) / 2);
    const what = item ? item.label.toLowerCase() : "item";
    const basis = op
      ? `${Math.round(bandLo * dep * 100)}–${Math.round(bandHi * dep * 100)}% of the RM ${op} new price for a ${what} in this condition`
      : `Typical resale for a ${what} in this condition, from a new price of RM ${range[0]}–${range[1]}`;
    return { low, high, suggested, unit, verdict: judgePrice(askingPrice, low, high), basis };
  }

  if (category === "TICKETS" && op) {
    const low = friendlyRound(op * 0.75);
    const high = friendlyRound(op);
    const verdict: PriceVerdict =
      askingPrice != null && askingPrice > op ? "above_face_value" : judgePrice(askingPrice, low, high);
    return { low, high, suggested: high, unit, verdict, basis: `At or below the RM ${op} face value` };
  }

  const [low, high] = range;
  const label = item ? item.label.toLowerCase() : category.toLowerCase();
  return {
    low,
    high,
    suggested: friendlyRound((low + high) / 2),
    unit,
    verdict: judgePrice(askingPrice, low, high),
    basis: `Usual campus price for ${label}`,
  };
}
