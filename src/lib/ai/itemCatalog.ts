import type { Category } from "../types";

/**
 * Reference catalogue of things commonly traded around UTP.
 *
 * - priceRange: typical price in MYR. For PRELOVED it is the *new retail*
 *   price, which the price recommender depreciates by condition. For FOOD,
 *   TICKETS and SERVICES it is the typical campus price per unit.
 * - kgMaterial / kgCO2e: rough mass of the item and the emissions embodied in
 *   making a new one (cradle-to-gate). These are indicative figures rounded
 *   from published lifecycle studies and manufacturer product reports; they
 *   are for awareness, not certified carbon accounting. See README → "Impact
 *   methodology".
 * - keywords: canonical words/phrases (after synonym mapping in text.ts).
 */
export type Depreciation = "electronics" | "durable" | "textbook" | "apparel";

export interface CatalogItem {
  id: string;
  label: string;
  category: Category;
  keywords: string[];
  priceRange: [number, number];
  unit: string;
  depreciation?: Depreciation;
  kgMaterial: number;
  kgCO2e: number;
  tags: string[];
}

export const ITEM_CATALOG: CatalogItem[] = [
  // ── PRELOVED: study ───────────────────────────────────────
  { id: "textbook", label: "Textbook", category: "PRELOVED", keywords: ["textbook", "book", "edition", "novel"], priceRange: [60, 220], unit: "per item", depreciation: "textbook", kgMaterial: 1.0, kgCO2e: 2.7, tags: ["textbook", "study"] },
  { id: "notes", label: "Printed notes", category: "PRELOVED", keywords: ["notes", "past year", "tutorial"], priceRange: [10, 40], unit: "per set", depreciation: "textbook", kgMaterial: 0.4, kgCO2e: 0.9, tags: ["notes", "study"] },
  { id: "calculator", label: "Scientific calculator", category: "PRELOVED", keywords: ["calculator", "casio", "fx-570", "fx570"], priceRange: [70, 130], unit: "per item", depreciation: "durable", kgMaterial: 0.15, kgCO2e: 4, tags: ["calculator", "study"] },
  { id: "lab_coat", label: "Lab coat", category: "PRELOVED", keywords: ["lab coat", "labcoat"], priceRange: [35, 70], unit: "per item", depreciation: "apparel", kgMaterial: 0.5, kgCO2e: 9, tags: ["lab", "engineering"] },
  { id: "safety_boots", label: "Safety boots", category: "PRELOVED", keywords: ["safety boots", "safety shoes", "boots"], priceRange: [90, 220], unit: "per pair", depreciation: "apparel", kgMaterial: 1.5, kgCO2e: 20, tags: ["workshop", "engineering"] },
  { id: "drawing_tools", label: "Drawing tools", category: "PRELOVED", keywords: ["drawing", "t-square", "compass", "drafting"], priceRange: [30, 90], unit: "per set", depreciation: "durable", kgMaterial: 0.6, kgCO2e: 3, tags: ["engineering", "study"] },
  { id: "electronics_kit", label: "Electronics kit", category: "PRELOVED", keywords: ["arduino", "raspberry", "breadboard", "sensor", "sensors", "multimeter"], priceRange: [60, 250], unit: "per set", depreciation: "electronics", kgMaterial: 0.4, kgCO2e: 12, tags: ["electronics", "fyp"] },
  { id: "stationery", label: "Stationery", category: "PRELOVED", keywords: ["stationery", "pen", "file", "highlighter"], priceRange: [5, 40], unit: "per set", depreciation: "durable", kgMaterial: 0.2, kgCO2e: 0.8, tags: ["stationery"] },

  // ── PRELOVED: electronics ─────────────────────────────────
  { id: "laptop", label: "Laptop", category: "PRELOVED", keywords: ["laptop", "macbook", "notebook", "ideapad", "thinkpad", "vivobook", "zenbook"], priceRange: [2200, 5000], unit: "per item", depreciation: "electronics", kgMaterial: 2.0, kgCO2e: 300, tags: ["electronics", "laptop"] },
  { id: "tablet", label: "Tablet", category: "PRELOVED", keywords: ["tablet", "ipad", "galaxy tab", "tab"], priceRange: [900, 3500], unit: "per item", depreciation: "electronics", kgMaterial: 0.5, kgCO2e: 100, tags: ["electronics", "tablet"] },
  { id: "phone", label: "Smartphone", category: "PRELOVED", keywords: ["phone", "iphone", "samsung galaxy", "xiaomi", "redmi", "oppo", "vivo", "realme"], priceRange: [800, 4500], unit: "per item", depreciation: "electronics", kgMaterial: 0.2, kgCO2e: 65, tags: ["electronics", "phone"] },
  { id: "audio", label: "Earbuds or headphones", category: "PRELOVED", keywords: ["earbuds", "earphones", "headphones", "headset", "airpods", "speaker"], priceRange: [80, 700], unit: "per item", depreciation: "electronics", kgMaterial: 0.25, kgCO2e: 10, tags: ["electronics", "audio"] },
  { id: "monitor", label: "Monitor", category: "PRELOVED", keywords: ["monitor", "screen 24", "display"], priceRange: [400, 1200], unit: "per item", depreciation: "electronics", kgMaterial: 4.5, kgCO2e: 230, tags: ["electronics", "monitor"] },
  { id: "peripherals", label: "Keyboard or mouse", category: "PRELOVED", keywords: ["keyboard", "mouse", "mechanical"], priceRange: [50, 350], unit: "per item", depreciation: "electronics", kgMaterial: 0.7, kgCO2e: 12, tags: ["electronics", "gaming"] },

  // ── PRELOVED: hostel life ─────────────────────────────────
  { id: "fan", label: "Fan", category: "PRELOVED", keywords: ["fan", "standing fan", "table fan"], priceRange: [60, 200], unit: "per item", depreciation: "durable", kgMaterial: 3.0, kgCO2e: 25, tags: ["hostel", "appliance"] },
  { id: "rice_cooker", label: "Rice cooker", category: "PRELOVED", keywords: ["rice cooker", "periuk nasi", "cooker"], priceRange: [70, 250], unit: "per item", depreciation: "durable", kgMaterial: 2.5, kgCO2e: 35, tags: ["hostel", "kitchen"] },
  { id: "kettle", label: "Kettle", category: "PRELOVED", keywords: ["kettle", "jug", "jug elektrik"], priceRange: [40, 130], unit: "per item", depreciation: "durable", kgMaterial: 1.0, kgCO2e: 15, tags: ["hostel", "kitchen"] },
  { id: "mini_fridge", label: "Mini fridge", category: "PRELOVED", keywords: ["fridge", "mini fridge", "peti sejuk"], priceRange: [400, 900], unit: "per item", depreciation: "durable", kgMaterial: 18, kgCO2e: 200, tags: ["hostel", "appliance"] },
  { id: "small_appliance", label: "Small appliance", category: "PRELOVED", keywords: ["iron", "seterika", "hair dryer", "air fryer", "toaster", "blender"], priceRange: [50, 250], unit: "per item", depreciation: "durable", kgMaterial: 1.5, kgCO2e: 18, tags: ["appliance"] },
  { id: "table", label: "Study table", category: "PRELOVED", keywords: ["table", "desk", "study table"], priceRange: [120, 400], unit: "per item", depreciation: "durable", kgMaterial: 15, kgCO2e: 50, tags: ["hostel", "furniture"] },
  { id: "chair", label: "Chair", category: "PRELOVED", keywords: ["chair", "office chair", "stool"], priceRange: [80, 350], unit: "per item", depreciation: "durable", kgMaterial: 7, kgCO2e: 35, tags: ["hostel", "furniture"] },
  { id: "storage", label: "Shelf or rack", category: "PRELOVED", keywords: ["shelf", "bookshelf", "rack", "rak", "ampaian", "drawer", "storage box"], priceRange: [40, 200], unit: "per item", depreciation: "durable", kgMaterial: 6, kgCO2e: 20, tags: ["hostel", "furniture"] },
  { id: "bedding", label: "Mattress or bedding", category: "PRELOVED", keywords: ["mattress", "pillow", "bantal", "bedsheet", "cadar", "comforter", "blanket"], priceRange: [60, 500], unit: "per item", depreciation: "durable", kgMaterial: 8, kgCO2e: 45, tags: ["hostel", "bedding"] },
  { id: "bicycle", label: "Bicycle", category: "PRELOVED", keywords: ["bicycle", "mountain bike", "scooter"], priceRange: [300, 1200], unit: "per item", depreciation: "durable", kgMaterial: 14, kgCO2e: 100, tags: ["transport", "bicycle"] },

  // ── PRELOVED: fashion & sport ─────────────────────────────
  { id: "clothing", label: "Clothing", category: "PRELOVED", keywords: ["shirt", "hoodie", "jacket", "dress", "kurung", "baju kurung", "blouse", "tudung", "jersey", "clothes"], priceRange: [30, 150], unit: "per item", depreciation: "apparel", kgMaterial: 0.4, kgCO2e: 10, tags: ["fashion", "clothing"] },
  { id: "trousers", label: "Jeans or trousers", category: "PRELOVED", keywords: ["jeans", "seluar", "pants", "trousers"], priceRange: [60, 250], unit: "per item", depreciation: "apparel", kgMaterial: 0.6, kgCO2e: 25, tags: ["fashion", "clothing"] },
  { id: "shoes", label: "Shoes", category: "PRELOVED", keywords: ["shoes", "sneakers", "sandals", "running shoes"], priceRange: [100, 450], unit: "per pair", depreciation: "apparel", kgMaterial: 0.9, kgCO2e: 14, tags: ["fashion", "shoes"] },
  { id: "bag", label: "Bag", category: "PRELOVED", keywords: ["bag", "backpack", "tote", "luggage"], priceRange: [60, 300], unit: "per item", depreciation: "apparel", kgMaterial: 0.9, kgCO2e: 15, tags: ["bag"] },
  { id: "sports", label: "Sports gear", category: "PRELOVED", keywords: ["racket", "badminton", "football", "futsal", "ball", "dumbbell", "yoga mat", "jersey"], priceRange: [60, 400], unit: "per item", depreciation: "durable", kgMaterial: 1.0, kgCO2e: 10, tags: ["sports"] },

  // ── FOOD (price per unit; impact = surplus avoided by pre-ordering) ─
  { id: "rice_meal", label: "Rice or noodle meal", category: "FOOD", keywords: ["nasi", "nasi lemak", "rice", "mee", "bihun", "noodle", "spaghetti", "kerabu", "chicken rice", "lasagna", "bubur", "porridge"], priceRange: [5, 14], unit: "per pack", kgMaterial: 0.1, kgCO2e: 0.25, tags: ["meal", "preorder"] },
  { id: "kuih_snack", label: "Kuih or snacks", category: "FOOD", keywords: ["kuih", "karipap", "kerepek", "snack", "snacks", "ayam gunting", "roti john", "murtabak", "dumpling"], priceRange: [3, 15], unit: "per set", kgMaterial: 0.05, kgCO2e: 0.1, tags: ["snack", "preorder"] },
  { id: "bakery", label: "Cakes and bakes", category: "FOOD", keywords: ["cake", "cheesecake", "brownies", "cookies", "muffin", "bread", "banana bread", "kek batik", "puding", "tart"], priceRange: [12, 70], unit: "per box", kgMaterial: 0.1, kgCO2e: 0.3, tags: ["dessert", "homemade"] },
  { id: "drink", label: "Drinks", category: "FOOD", keywords: ["drink", "teh", "tea", "coffee", "kopi", "milk", "susu", "juice", "sirap", "cendol", "balang"], priceRange: [3, 12], unit: "per bottle", kgMaterial: 0.05, kgCO2e: 0.08, tags: ["drink"] },
  { id: "dessert", label: "Dessert cup", category: "FOOD", keywords: ["dessert", "sago", "pudding", "bubur cha cha", "sushi"], priceRange: [4, 15], unit: "per cup", kgMaterial: 0.05, kgCO2e: 0.1, tags: ["dessert"] },
  { id: "condiment", label: "Sambal or frozen food", category: "FOOD", keywords: ["sambal", "frozen", "sejuk beku", "paste"], priceRange: [8, 25], unit: "per jar", kgMaterial: 0.05, kgCO2e: 0.1, tags: ["homemade"] },

  // ── TICKETS (resold seats: no material saved, but nothing is wasted) ─
  { id: "bus_ticket", label: "Bus ticket", category: "TICKETS", keywords: ["bus", "tbs", "amanjaya", "terminal", "express"], priceRange: [15, 70], unit: "per ticket", kgMaterial: 0, kgCO2e: 0, tags: ["bus", "travel"] },
  { id: "train_ticket", label: "Train ticket", category: "TICKETS", keywords: ["train", "kl sentral", "butterworth", "padang besar"], priceRange: [20, 90], unit: "per ticket", kgMaterial: 0, kgCO2e: 0, tags: ["train", "travel"] },
  { id: "flight_ferry", label: "Flight or ferry", category: "TICKETS", keywords: ["flight", "airasia", "ferry", "pangkor"], priceRange: [30, 400], unit: "per ticket", kgMaterial: 0, kgCO2e: 0, tags: ["travel"] },
  { id: "event_ticket", label: "Event ticket", category: "TICKETS", keywords: ["concert", "event", "festival", "show", "theatre", "movie", "match", "stadium", "pass", "conference", "theme park", "bib"], priceRange: [20, 350], unit: "per ticket", kgMaterial: 0, kgCO2e: 0, tags: ["event"] },

  // ── SERVICES (repairs extend product life, so they earn a credit) ─
  { id: "tutoring", label: "Tutoring", category: "SERVICES", keywords: ["tutor", "class", "lessons", "coaching", "exam prep"], priceRange: [15, 45], unit: "per hour", kgMaterial: 0, kgCO2e: 0, tags: ["tutor", "study"] },
  { id: "device_repair", label: "Device repair", category: "SERVICES", keywords: ["repair", "format", "screen replacement", "battery change", "upgrade ssd"], priceRange: [20, 150], unit: "per job", kgMaterial: 0.5, kgCO2e: 15, tags: ["repair", "electronics"] },
  { id: "tailoring", label: "Tailoring or shoe care", category: "SERVICES", keywords: ["jahit", "sewing", "alteration", "hem", "shoe cleaning", "sneaker wash"], priceRange: [10, 50], unit: "per item", kgMaterial: 0.4, kgCO2e: 5, tags: ["repair", "fashion"] },
  { id: "printing", label: "Printing and binding", category: "SERVICES", keywords: ["print", "binding", "photocopy", "laminate"], priceRange: [2, 25], unit: "per job", kgMaterial: 0, kgCO2e: 0, tags: ["print", "study"] },
  { id: "laundry", label: "Laundry", category: "SERVICES", keywords: ["laundry", "wash and fold", "ironing service"], priceRange: [5, 20], unit: "per load", kgMaterial: 0, kgCO2e: 0, tags: ["laundry", "hostel"] },
  { id: "runner", label: "Runner or transport", category: "SERVICES", keywords: ["runner", "delivery", "errand", "carpool", "car rental", "transfer", "moving help", "van"], priceRange: [5, 60], unit: "per trip", kgMaterial: 0, kgCO2e: 0, tags: ["runner", "transport"] },
  { id: "creative", label: "Creative services", category: "SERVICES", keywords: ["photography", "photo", "video editing", "graphic design", "poster", "logo", "makeup", "henna", "website"], priceRange: [30, 250], unit: "per session", kgMaterial: 0, kgCO2e: 0, tags: ["creative"] },
  { id: "personal_care", label: "Haircut or cleaning", category: "SERVICES", keywords: ["haircut", "gunting rambut", "cleaning", "room cleaning"], priceRange: [8, 40], unit: "per session", kgMaterial: 0, kgCO2e: 0, tags: ["hostel"] },
];

/** Fallbacks when no catalogue item matches. */
export const CATEGORY_DEFAULTS: Record<Category, Omit<CatalogItem, "id" | "label" | "keywords" | "category" | "tags">> = {
  PRELOVED: { priceRange: [30, 250], unit: "per item", depreciation: "durable", kgMaterial: 1.0, kgCO2e: 10 },
  FOOD: { priceRange: [4, 20], unit: "per pack", kgMaterial: 0.05, kgCO2e: 0.15 },
  TICKETS: { priceRange: [15, 150], unit: "per ticket", kgMaterial: 0, kgCO2e: 0 },
  SERVICES: { priceRange: [10, 60], unit: "per job", kgMaterial: 0, kgCO2e: 0 },
};

export const CATALOG_BY_ID: Record<string, CatalogItem> = Object.fromEntries(ITEM_CATALOG.map((i) => [i.id, i]));
