import type { Category } from "../types";
import { ITEM_CATALOG, type CatalogItem } from "./itemCatalog";
import { canonical, containsPhrase } from "./text";

export interface ItemMatch {
  item: CatalogItem;
  score: number;
}

/**
 * Finds the catalogue item a listing is about. Matches in the title count
 * three times as much as matches in the description, longer phrases beat
 * single words, and items in the predicted category get a tie-breaking bonus.
 */
export function detectItem(title: string, description: string, category?: Category): ItemMatch | null {
  const t = canonical(title);
  const d = canonical(description);
  let best: ItemMatch | null = null;

  for (const item of ITEM_CATALOG) {
    let score = 0;
    for (const kw of item.keywords) {
      const weight = kw.includes(" ") ? 1.5 : 1;
      if (containsPhrase(t, kw)) score += 3 * weight;
      else if (containsPhrase(d, kw)) score += 1 * weight;
    }
    if (score === 0) continue;
    if (category && item.category === category) score += 1.5;
    if (!best || score > best.score) best = { item, score };
  }
  return best;
}

/** Extra tags we can infer from wording, independent of item type. */
const SIGNAL_TAGS: Array<[string, string[]]> = [
  ["preorder", ["preorder", "order before", "open order"]],
  ["homemade", ["homemade", "home made", "air tangan"]],
  ["halal", ["halal"]],
  ["delivery", ["delivery", "deliver", "hantar"]],
  ["negotiable", ["negotiable"]],
  ["moving-out", ["moving out", "graduating", "clearance", "pindah"]],
  ["fyp", ["fyp", "final year"]],
  ["like-new", ["like new", "new", "unused"]],
  ["cheap", ["cheap", "letgo", "let go"]],
];

export function suggestTags(title: string, description: string, item: CatalogItem | null, limit = 5): string[] {
  const text = canonical(`${title} ${description}`);
  const tags = new Set<string>(item?.tags ?? []);
  for (const [tag, phrases] of SIGNAL_TAGS) {
    if (phrases.some((p) => containsPhrase(text, p))) tags.add(tag);
  }
  return Array.from(tags).slice(0, limit);
}
