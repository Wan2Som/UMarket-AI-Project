import type { Category, Condition, ListingStatus } from "./types";

export interface CategoryMeta {
  id: Category;
  hashtag: string;
  name: string;
  blurb: string;
  /** Tailwind gradient classes for listings without a photo. */
  placeholder: string;
  /** Whether listings in this category must carry an expiry time. */
  requiresExpiry: boolean;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "PRELOVED",
    hashtag: "#PRELOVED",
    name: "Preloved",
    blurb: "Textbooks, electronics, hostel gear, clothes",
    placeholder: "from-emerald-500/30 via-teal-500/15 to-cyan-500/25",
    requiresExpiry: false,
  },
  {
    id: "FOOD",
    hashtag: "#FOOD",
    name: "Food",
    blurb: "Pre-orders and homemade food",
    placeholder: "from-amber-400/30 via-orange-500/15 to-rose-500/25",
    requiresExpiry: true,
  },
  {
    id: "TICKETS",
    hashtag: "#TICKETS",
    name: "Tickets",
    blurb: "Bus, train and event tickets",
    placeholder: "from-violet-500/30 via-indigo-500/15 to-sky-500/25",
    requiresExpiry: true,
  },
  {
    id: "SERVICES",
    hashtag: "#SERVICES",
    name: "Services",
    blurb: "Tutoring, repairs, printing, runners",
    placeholder: "from-cyan-500/30 via-sky-500/15 to-emerald-500/25",
    requiresExpiry: false,
  },
];

export const CATEGORY_BY_ID: Record<Category, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category, CategoryMeta>;

export const CONDITIONS: { id: Condition; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Unused, may be unboxed" },
  { id: "like_new", label: "Like new", hint: "Used a few times, no marks" },
  { id: "good", label: "Good", hint: "Normal wear, works perfectly" },
  { id: "fair", label: "Fair", hint: "Visible wear or small faults" },
  { id: "parts", label: "For parts", hint: "Broken, useful for repair" },
];

export const CONDITION_LABEL: Record<Condition, string> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c.label]),
) as Record<Condition, string>;

export const STATUSES: { id: ListingStatus; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "reserved", label: "Reserved" },
  { id: "sold", label: "Sold" },
];

/** Suggestions for the pickup field; sellers can still type anything. */
export const PICKUP_SUGGESTIONS = [
  "Village 1",
  "Village 2",
  "Village 3",
  "Village 4",
  "Village 5",
  "Village 6",
  "Main campus",
  "Seri Iskandar town",
  "Delivery to your village",
];

export const MAX_TAGS = 6;
