/**
 * Text preprocessing shared by the classifier, tagger and item detector.
 * Listings on the pasarUTP channel mix English, Malay and shorthand
 * ("jual", "murah", "PO", "nego"), so the normaliser expands common
 * abbreviations and removes filler words in both languages.
 */

const STOPWORDS = new Set([
  // English
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "at", "with", "is", "are",
  "it", "this", "that", "my", "your", "i", "we", "you", "me", "be", "can", "will", "just",
  "very", "so", "if", "any", "all", "from", "by", "as", "up", "pm", "dm", "pls", "please",
  "plz", "only", "still", "get", "got", "have", "has", "one", "per", "each", "also", "u",
  // Malay
  "dan", "yang", "untuk", "di", "ke", "dari", "ini", "itu", "saya", "aku", "nak", "ada",
  "boleh", "dengan", "pun", "je", "lah", "kat", "tak", "x", "dah", "akan", "atau", "sila",
  "pada", "juga", "lagi", "ni", "tu", "dia", "kami", "korang", "awak", "utk", "dgn", "yg",
  "nk", "sy", "ke", "mcm", "sbb", "kalau", "klau", "ya", "ok", "okay",
]);

/** Shorthand and spelling variants → canonical token. */
const SYNONYMS: Record<string, string> = {
  po: "preorder",
  "pre-order": "preorder",
  preoder: "preorder",
  tix: "ticket",
  tiket: "ticket",
  tickets: "ticket",
  bas: "bus",
  keretapi: "train",
  ktm: "train",
  ets: "train",
  buku: "book",
  books: "book",
  textbooks: "textbook",
  kalkulator: "calculator",
  calc: "calculator",
  lappy: "laptop",
  laptops: "laptop",
  fon: "phone",
  handphone: "phone",
  kasut: "shoes",
  shoe: "shoes",
  baju: "shirt",
  tshirt: "shirt",
  "t-shirt": "shirt",
  kipas: "fan",
  tilam: "mattress",
  meja: "table",
  kerusi: "chair",
  basikal: "bicycle",
  bike: "bicycle",
  makanan: "food",
  kuih: "kuih",
  kek: "cake",
  cakes: "cake",
  biskut: "cookies",
  cookie: "cookies",
  minuman: "drink",
  drinks: "drink",
  servis: "service",
  services: "service",
  tuition: "tutor",
  tutoring: "tutor",
  tutors: "tutor",
  repairs: "repair",
  baiki: "repair",
  repairing: "repair",
  cetak: "print",
  printing: "print",
  dobi: "laundry",
  hantar: "delivery",
  deliver: "delivery",
  murah: "cheap",
  nego: "negotiable",
  bnib: "new",
  baru: "new",
  terpakai: "used",
  secondhand: "used",
  "second-hand": "used",
  preloved: "used",
  concerts: "concert",
  konsert: "concert",
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/rm\s?\d+(?:[.,]\d+)?/g, " pricetoken ")
    .replace(/\d+(?:[.,]\d+)?\s?(gb|tb)\b/g, " storagetoken ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Unigrams (after stopword removal and synonym mapping). */
export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .map((t) => t.replace(/^-+|-+$/g, ""))
    .map((t) => SYNONYMS[t] ?? t)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

/** Unigrams plus adjacent bigrams ("nasi_lemak", "safety_boots"). */
export function features(text: string): string[] {
  const uni = tokenize(text);
  const bi: string[] = [];
  for (let i = 0; i < uni.length - 1; i++) bi.push(`${uni[i]}_${uni[i + 1]}`);
  return [...uni, ...bi];
}

/** Whole-word / phrase match on the normalised text. */
export function containsPhrase(normalizedText: string, phrase: string): boolean {
  const p = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${p}(\\s|$)`).test(normalizedText);
}

/** Canonical form of a text for phrase lookups: normalised, then synonyms applied per word. */
export function canonical(text: string): string {
  return normalize(text)
    .split(" ")
    .map((t) => SYNONYMS[t] ?? t)
    .join(" ");
}
