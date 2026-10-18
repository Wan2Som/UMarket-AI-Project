/**
 * Evaluates the listing categoriser on the held-out test set.
 *   npm run eval:ai
 * Prints accuracy, per-class precision/recall/F1 and a confusion matrix,
 * ready to paste into the coursework report.
 */
import { classifyListing } from "../src/lib/ai/categorizer";
import { LABELS } from "../src/lib/ai/categorizer";
import { TRAINING_CORPUS } from "../src/lib/ai/corpus";
import { TEST_SET } from "./classifier-testset";
import type { Category } from "../src/lib/types";

const confusion: Record<Category, Record<Category, number>> = Object.fromEntries(
  LABELS.map((a) => [a, Object.fromEntries(LABELS.map((b) => [b, 0]))]),
) as Record<Category, Record<Category, number>>;

const misses: string[] = [];
let correct = 0;

for (const [label, title, description] of TEST_SET) {
  const p = classifyListing(title, description);
  confusion[label][p.category]++;
  if (p.category === label) correct++;
  else misses.push(`  ✗ "${title}" — expected ${label}, got ${p.category} (${(p.confidence * 100).toFixed(0)}%)`);
}

const pad = (s: string | number, n = 10) => String(s).padStart(n);
console.log(`\nPasarUTP categoriser — Multinomial Naive Bayes`);
console.log(`Training examples: ${TRAINING_CORPUS.length}   Held-out test examples: ${TEST_SET.length}\n`);
console.log(`Accuracy: ${((correct / TEST_SET.length) * 100).toFixed(1)}% (${correct}/${TEST_SET.length})\n`);

console.log(`${"".padEnd(10)}${pad("precision")}${pad("recall")}${pad("f1")}${pad("support")}`);
let macroF1 = 0;
for (const c of LABELS) {
  const tp = confusion[c][c];
  const predicted = LABELS.reduce((s, r) => s + confusion[r][c], 0);
  const actual = LABELS.reduce((s, p) => s + confusion[c][p], 0);
  const precision = predicted ? tp / predicted : 0;
  const recall = actual ? tp / actual : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  macroF1 += f1 / LABELS.length;
  console.log(`${c.padEnd(10)}${pad(precision.toFixed(2))}${pad(recall.toFixed(2))}${pad(f1.toFixed(2))}${pad(actual)}`);
}
console.log(`\nMacro F1: ${macroF1.toFixed(3)}\n`);

console.log("Confusion matrix (rows = actual, columns = predicted)");
console.log("".padEnd(10) + LABELS.map((l) => pad(l)).join(""));
for (const r of LABELS) console.log(r.padEnd(10) + LABELS.map((c) => pad(confusion[r][c])).join(""));

if (misses.length) console.log(`\nMisclassified:\n${misses.join("\n")}`);
