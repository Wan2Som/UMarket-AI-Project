import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeListing, classifyListing, recommendPrice, aggregateImpact } from "../src/lib/aiService";
import { detectItem } from "../src/lib/ai/tagger";
import { CATALOG_BY_ID } from "../src/lib/ai/itemCatalog";
import { normalizeTelegramHandle, isValidTelegramHandle } from "../src/lib/telegram";

test("classifies typical posts from each category", () => {
  assert.equal(classifyListing("Casio fx-570 calculator", "used one sem").category, "PRELOVED");
  assert.equal(classifyListing("Nasi lemak PO Jumaat", "hantar ke village").category, "FOOD");
  assert.equal(classifyListing("Tiket bas ke KL", "Friday 3pm from Seri Iskandar").category, "TICKETS");
  assert.equal(classifyListing("Calculus tutor", "1 to 1 classes at night").category, "SERVICES");
});

test("probabilities sum to 1 and explain the decision", () => {
  const p = classifyListing("Engineering textbook", "buku terpakai");
  const sum = Object.values(p.probabilities).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.ok(p.evidence.length > 0);
});

test("unknown text is marked uninformative", () => {
  assert.equal(classifyListing("zzqx", "").informative, false);
});

test("detects catalogue items from title", () => {
  assert.equal(detectItem("Selling my Lenovo laptop", "")?.item.id, "laptop");
  assert.equal(detectItem("Safety boots size 9", "")?.item.id, "safety_boots");
  assert.equal(detectItem("Tilam single", "")?.item.id, "bedding");
});

test("price falls with condition", () => {
  const item = CATALOG_BY_ID.calculator;
  const likeNew = recommendPrice({ category: "PRELOVED", item, condition: "like_new" });
  const fair = recommendPrice({ category: "PRELOVED", item, condition: "fair" });
  assert.ok(likeNew.low > fair.low && likeNew.high > fair.high);
});

test("uses the seller's original price when given", () => {
  const r = recommendPrice({ category: "PRELOVED", item: CATALOG_BY_ID.calculator, condition: "good", originalPrice: 100 });
  assert.equal(r.low, 45);
  assert.equal(r.high, 60);
});

test("tickets above face value are flagged", () => {
  const r = recommendPrice({ category: "TICKETS", item: CATALOG_BY_ID.bus_ticket, condition: null, originalPrice: 40, askingPrice: 55 });
  assert.equal(r.verdict, "above_face_value");
});

test("full analysis warns when the chosen category disagrees", () => {
  const a = analyzeListing({
    title: "Nasi lemak ayam preorder",
    description: "delivery to all villages on Friday morning",
    category: "TICKETS",
    condition: null,
    price: 8,
    originalPrice: null,
  });
  assert.ok(a.flags.some((f) => f.level === "warn" && f.message.includes("#FOOD")));
});

test("impact only counts sold listings", () => {
  const totals = aggregateImpact([
    { status: "sold", impact: { kgMaterial: 2, kgCO2e: 10 } },
    { status: "available", impact: { kgMaterial: 5, kgCO2e: 50 } },
  ]);
  assert.equal(totals.itemsRehomed, 1);
  assert.equal(totals.kgCO2e, 10);
});

test("telegram handles are normalised and validated", () => {
  assert.equal(normalizeTelegramHandle("https://t.me/ali_utp/"), "ali_utp");
  assert.equal(normalizeTelegramHandle("@ali_utp"), "ali_utp");
  assert.ok(isValidTelegramHandle("ali_utp"));
  assert.ok(!isValidTelegramHandle("ab"));
  assert.ok(!isValidTelegramHandle("1abcde"));
});
