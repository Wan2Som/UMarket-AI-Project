import type { Category } from "../types";
import type { CategoryPrediction } from "./categorizer";
import { CATEGORY_BY_ID } from "../constants";

export interface QualityFlag {
  level: "warn" | "info";
  message: string;
}

/**
 * Listing quality checks: catches the miscategorised and spammy posts that
 * clutter the Telegram channel, before they are published.
 */
export function qualityChecks(
  title: string,
  description: string,
  chosen: Category | null,
  prediction: CategoryPrediction,
): QualityFlag[] {
  const flags: QualityFlag[] = [];
  const all = `${title} ${description}`;

  if (chosen && prediction.informative && chosen !== prediction.category && prediction.confidence >= 0.7) {
    flags.push({
      level: "warn",
      message: `This reads like ${CATEGORY_BY_ID[prediction.category].hashtag}, but it's filed under ${CATEGORY_BY_ID[chosen].hashtag}. Buyers filter by category, so it may be missed.`,
    });
  }

  const letters = title.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 8 && letters === letters.toUpperCase()) {
    flags.push({ level: "info", message: "The title is all capitals. Sentence case is easier to scan in the feed." });
  }

  const emoji = all.match(/\p{Extended_Pictographic}/gu)?.length ?? 0;
  if (emoji > 6) flags.push({ level: "info", message: "Lots of emoji can hide the details. Keep two or three." });

  if (/(.)\1{4,}/.test(all) || /!{3,}/.test(all)) {
    flags.push({ level: "info", message: "Repeated characters look like spam to buyers." });
  }

  if (/https?:\/\/|www\.|bit\.ly/i.test(all)) {
    flags.push({ level: "warn", message: "Links are hidden from buyers. Put details in the description; buyers reach you on Telegram." });
  }

  if (/\b(\+?6?01\d[-\s]?\d{3,4}[-\s]?\d{4})\b/.test(all)) {
    flags.push({ level: "info", message: "Phone numbers are public here. Your Telegram button is already on the listing." });
  }

  if (title.trim().length > 0 && description.trim().length < 15) {
    flags.push({ level: "info", message: "Add a line on condition or pickup. Listings with details get fewer repeat questions." });
  }

  return flags;
}
