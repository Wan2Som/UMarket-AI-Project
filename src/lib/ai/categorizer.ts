import type { Category } from "../types";
import { TRAINING_CORPUS } from "./corpus";
import { MultinomialNaiveBayes } from "./naiveBayes";
import { features } from "./text";

export const LABELS: Category[] = ["PRELOVED", "FOOD", "TICKETS", "SERVICES"];

export interface CategoryPrediction {
  category: Category;
  confidence: number;
  probabilities: Record<Category, number>;
  /** Words that drove the decision, for the explanation line. */
  evidence: string[];
  /** False when the text shares no vocabulary with the training data. */
  informative: boolean;
}

/** Title words count double: sellers put the item name in the title. */
function listingFeatures(title: string, description: string): string[] {
  const t = features(title);
  return [...t, ...t, ...features(description)];
}

let model: MultinomialNaiveBayes<Category> | null = null;

function getModel(): MultinomialNaiveBayes<Category> {
  if (model) return model;
  const m = new MultinomialNaiveBayes<Category>(LABELS, 0.5);
  for (const [label, text] of TRAINING_CORPUS) {
    const [title, description = ""] = text.split("|");
    m.train(label, listingFeatures(title, description));
  }
  model = m;
  return m;
}

export function classifyListing(title: string, description = ""): CategoryPrediction {
  const m = getModel();
  const tokens = listingFeatures(title, description);
  const { probabilities, known } = m.predict(tokens);
  const category = LABELS.reduce((best, l) => (probabilities[l] > probabilities[best] ? l : best), LABELS[0]);
  return {
    category,
    confidence: probabilities[category],
    probabilities,
    evidence: m.evidence(category, tokens),
    informative: known.length > 0,
  };
}
