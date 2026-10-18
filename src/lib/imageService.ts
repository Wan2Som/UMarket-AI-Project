import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { imageMode, storage } from "./firebase";

/**
 * Listing photos. Every photo is resized in the browser before it leaves the
 * phone: smaller uploads, faster feeds and less data on campus Wi-Fi.
 *
 * "storage" mode uploads a 1280px WebP to Cloud Storage. If that fails (for
 * example the project is on the free Spark plan, which has no Storage bucket),
 * or "inline" mode is set, a ~560px thumbnail is stored as a data URL inside
 * the listing document instead.
 */
const INLINE_MAX_CHARS = 180_000; // keep in sync with firestore.rules

async function resize(file: File, maxDim: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the photo in this browser.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const blob = (await toBlob("image/webp")) ?? (await toBlob("image/jpeg"));
  if (!blob) throw new Error("Couldn't compress the photo.");
  return blob;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function toInlineDataUrl(file: File): Promise<string> {
  for (const [dim, q] of [
    [560, 0.7],
    [440, 0.6],
    [320, 0.55],
  ] as const) {
    const url = await blobToDataUrl(await resize(file, dim, q));
    if (url.length <= INLINE_MAX_CHARS) return url;
  }
  throw new Error("This photo is too detailed to store. Try a different one.");
}

export interface UploadResult {
  url: string;
  mode: "storage" | "inline";
}

export async function uploadListingImage(file: File, uid: string): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file (JPG, PNG or WebP).");

  if (imageMode === "storage" && storage) {
    try {
      const blob = await resize(file, 1280, 0.82);
      const path = `listings/${uid}/${Date.now()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
      const snap = await uploadBytes(ref(storage, path), blob, {
        contentType: blob.type,
        cacheControl: "public, max-age=31536000, immutable",
      });
      return { url: await getDownloadURL(snap.ref), mode: "storage" };
    } catch (err) {
      console.warn("Storage upload failed, storing an inline thumbnail instead.", err);
    }
  }
  return { url: await toInlineDataUrl(file), mode: "inline" };
}
