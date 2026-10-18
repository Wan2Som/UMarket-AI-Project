import type { Category, ListingImpact } from "../types";
import { CATEGORY_DEFAULTS, type CatalogItem } from "./itemCatalog";

/**
 * Sustainability impact estimator.
 *
 * When a preloved item is sold, it stays in use instead of going to landfill,
 * and the buyer usually skips buying a new one. Not every resale replaces a
 * new purchase, so the avoided manufacturing emissions are scaled by a
 * displacement rate. 0.7 is an assumption for this prototype; published
 * estimates vary widely by product type, so state it in any report.
 *
 * Food pre-orders count the surplus avoided by cooking to order. Tickets
 * count nothing physical. Repair services count part of the product's
 * embodied emissions, because a repair delays a replacement.
 */
export const DISPLACEMENT_RATE = 0.7;

/** Average petrol car, kg CO2e per km (UK DEFRA 2024 conversion factors, rounded). */
export const KG_CO2E_PER_KM_DRIVEN = 0.17;

export function estimateImpact(category: Category, item: CatalogItem | null): ListingImpact {
  const src = item && item.category === category ? item : CATEGORY_DEFAULTS[category];
  const factor = category === "PRELOVED" ? DISPLACEMENT_RATE : 1;
  return {
    kgMaterial: round(src.kgMaterial),
    kgCO2e: round(src.kgCO2e * factor),
  };
}

export interface ImpactTotals {
  itemsRehomed: number;
  kgMaterial: number;
  kgCO2e: number;
  kmNotDriven: number;
}

export function aggregateImpact(listings: Array<{ status: string; impact?: ListingImpact | null }>): ImpactTotals {
  let itemsRehomed = 0;
  let kgMaterial = 0;
  let kgCO2e = 0;
  for (const l of listings) {
    if (l.status !== "sold") continue;
    itemsRehomed++;
    kgMaterial += l.impact?.kgMaterial ?? 0;
    kgCO2e += l.impact?.kgCO2e ?? 0;
  }
  return {
    itemsRehomed,
    kgMaterial: round(kgMaterial),
    kgCO2e: round(kgCO2e),
    kmNotDriven: Math.round(kgCO2e / KG_CO2E_PER_KM_DRIVEN),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
