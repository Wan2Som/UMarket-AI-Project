export type Category = "PRELOVED" | "FOOD" | "TICKETS" | "SERVICES";
export type ListingStatus = "available" | "reserved" | "sold";
export type Condition = "new" | "like_new" | "good" | "fair" | "parts";

/** What the AI assistant recorded about a listing at the moment it was posted. */
export interface ListingAIMeta {
  suggestedCategory: Category;
  confidence: number; // 0–1
  itemType: string | null; // id from the item catalogue, e.g. "calculator"
  priceLow: number | null;
  priceHigh: number | null;
}

/** Estimated environmental benefit if the listing is sold (see lib/ai/impact.ts). */
export interface ListingImpact {
  kgMaterial: number;
  kgCO2e: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  condition: Condition | null;
  price: number;
  priceUnit: string;
  originalPrice: number | null;
  imageUrl: string | null;
  location: string;
  status: ListingStatus;
  sellerId: string;
  sellerName: string;
  sellerPhoto: string | null;
  sellerTelegram: string;
  expiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  soldAt: Date | null;
  ai: ListingAIMeta | null;
  impact: ListingImpact;
}

/** Fields the seller fills in on the Post item page. */
export interface NewListingInput {
  title: string;
  description: string;
  category: Category;
  tags: string[];
  condition: Condition | null;
  price: number;
  priceUnit: string;
  originalPrice: number | null;
  imageUrl: string | null;
  location: string;
  expiresAt: Date | null;
  ai: ListingAIMeta | null;
  impact: ListingImpact;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  telegram: string | null;
}
