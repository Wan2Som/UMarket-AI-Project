/**
 * Telegram usernames: 5–32 characters, letters, digits and underscores,
 * starting with a letter. Sellers often paste "@name" or a full t.me link,
 * so normalise first.
 */
const HANDLE_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

export function normalizeTelegramHandle(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(t|telegram)\.me\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
}

export function isValidTelegramHandle(handle: string): boolean {
  return HANDLE_RE.test(handle);
}

export function telegramLink(handle: string): string {
  return `https://t.me/${encodeURIComponent(handle)}`;
}

/** The opening message we copy to the buyer's clipboard before opening Telegram. */
export function inquiryMessage(title: string): string {
  return `Hi! I saw "${title}" on PasarUTP. Is it still available?`;
}
