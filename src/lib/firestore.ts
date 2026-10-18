import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Listing, ListingStatus, NewListingInput, UserProfile } from "./types";

/**
 * Firestore data layer. Collections:
 *   listings/{listingId}  public marketplace listings
 *   users/{uid}           seller profile (display name, photo, Telegram handle)
 *
 * The security rules in firestore.rules mirror the shapes written here.
 */
const FEED_LIMIT = 150;

function requireDb() {
  if (!db) throw new Error("Firebase is not configured. Add your keys to .env.local.");
  return db;
}

function toDate(v: unknown): Date | null {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return null;
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Listing {
  // "estimate" fills in pending server timestamps locally, so a brand-new
  // listing sorts to the top immediately instead of showing a null date.
  const d = snap.data({ serverTimestamps: "estimate" });
  return {
    id: snap.id,
    title: d.title ?? "",
    description: d.description ?? "",
    category: d.category,
    tags: Array.isArray(d.tags) ? d.tags : [],
    condition: d.condition ?? null,
    price: Number(d.price ?? 0),
    priceUnit: d.priceUnit ?? "per item",
    originalPrice: d.originalPrice ?? null,
    imageUrl: d.imageUrl ?? null,
    location: d.location ?? "",
    status: d.status ?? "available",
    sellerId: d.sellerId,
    sellerName: d.sellerName ?? "Student",
    sellerPhoto: d.sellerPhoto ?? null,
    sellerTelegram: d.sellerTelegram ?? "",
    expiresAt: toDate(d.expiresAt),
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
    soldAt: toDate(d.soldAt),
    ai: d.ai ?? null,
    impact: d.impact ?? { kgMaterial: 0, kgCO2e: 0 },
  };
}

type OnData = (listings: Listing[]) => void;
type OnError = (error: Error) => void;

/** Live feed of the newest listings (all statuses; the UI decides what to hide). */
export function subscribeToListings(onData: OnData, onError: OnError): Unsubscribe {
  const q = query(collection(requireDb(), "listings"), orderBy("createdAt", "desc"), limit(FEED_LIMIT));
  return onSnapshot(q, (snap) => onData(snap.docs.map(fromDoc)), onError);
}

/**
 * One seller's listings. Sorted client-side so no composite index is needed.
 */
export function subscribeToSellerListings(uid: string, onData: OnData, onError: OnError): Unsubscribe {
  const q = query(collection(requireDb(), "listings"), where("sellerId", "==", uid));
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs
          .map(fromDoc)
          .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)),
      ),
    onError,
  );
}

/** Every sold listing, for the community impact counter. */
export function subscribeToSoldListings(onData: OnData, onError: OnError): Unsubscribe {
  const q = query(collection(requireDb(), "listings"), where("status", "==", "sold"), limit(1000));
  return onSnapshot(q, (snap) => onData(snap.docs.map(fromDoc)), onError);
}

export async function createListing(seller: UserProfile, input: NewListingInput): Promise<string> {
  if (!seller.telegram) throw new Error("Add your Telegram username before posting.");
  const ref = await addDoc(collection(requireDb(), "listings"), {
    ...input,
    expiresAt: input.expiresAt ? Timestamp.fromDate(input.expiresAt) : null,
    status: "available" satisfies ListingStatus,
    sellerId: seller.uid,
    sellerName: seller.displayName,
    sellerPhoto: seller.photoURL,
    sellerTelegram: seller.telegram,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    soldAt: null,
  });
  return ref.id;
}

export async function updateListingStatus(id: string, status: ListingStatus): Promise<void> {
  await updateDoc(doc(requireDb(), "listings", id), {
    status,
    updatedAt: serverTimestamp(),
    soldAt: status === "sold" ? serverTimestamp() : null,
  });
}

export async function deleteListing(id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), "listings", id));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(requireDb(), "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    displayName: d.displayName ?? "Student",
    photoURL: d.photoURL ?? null,
    telegram: d.telegram ?? null,
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(
    doc(requireDb(), "users", profile.uid),
    {
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      telegram: profile.telegram,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
