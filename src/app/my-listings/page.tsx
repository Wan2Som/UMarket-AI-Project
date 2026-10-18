"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { useSellerListings } from "@/lib/hooks/useListings";
import { useNow } from "@/lib/hooks/useNow";
import { deleteListing, updateListingStatus } from "@/lib/firestore";
import { isFirebaseConfigured } from "@/lib/firebase";
import { CATEGORY_BY_ID } from "@/lib/constants";
import { cn, isExpired, timeAgo, timeLeft } from "@/lib/format";
import type { Listing, ListingStatus } from "@/lib/types";
import { AccountModal } from "@/components/AccountModal";
import { BrandMark } from "@/components/BrandMark";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ImpactCounter } from "@/components/ImpactCounter";
import { PriceTag } from "@/components/PriceTag";
import { StatusToggle } from "@/components/StatusToggle";
import { Button, buttonClasses } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const STATUS_TOAST: Record<ListingStatus, string> = {
  available: "Marked available. Buyers can message you again.",
  reserved: "Marked reserved. Buyers will see it's on hold.",
  sold: "Marked sold. It's greyed out for buyers and added to the impact total.",
};

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { listings, loading, error } = useSellerListings(user?.uid ?? null);
  const now = useNow();
  const toast = useToast();
  const [pending, setPending] = useState<Record<string, ListingStatus>>({});
  const [toDelete, setToDelete] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  // Optimistic status: show the new state immediately, Firestore confirms a moment later.
  const shown = useMemo(
    () => listings.map((l) => (pending[l.id] ? { ...l, status: pending[l.id] } : l)),
    [listings, pending],
  );

  const counts = useMemo(() => {
    const c = { available: 0, reserved: 0, sold: 0 };
    for (const l of shown) c[l.status]++;
    return c;
  }, [shown]);

  async function changeStatus(l: Listing, status: ListingStatus) {
    setPending((p) => ({ ...p, [l.id]: status }));
    try {
      await updateListingStatus(l.id, status);
      toast(STATUS_TOAST[status]);
    } catch {
      toast("Couldn't update the status. Check your connection and try again.", "error");
    } finally {
      setPending((p) => {
        const { [l.id]: _done, ...rest } = p;
        return rest;
      });
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteListing(toDelete.id);
      toast("Listing deleted.");
      setToDelete(null);
    } catch {
      toast("Couldn't delete the listing. Try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const signedOut = !authLoading && !user;

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between py-5">
        <BrandMark />
      </header>

      <div className="flex flex-col gap-4 pb-6 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-black tracking-[-0.03em] text-fg sm:text-5xl">My stall</h1>
          <p className="mt-2 text-muted">
            {user
              ? `${counts.available} available, ${counts.reserved} reserved, ${counts.sold} sold. Change a status and buyers see it instantly.`
              : "Your listings and their status, in one place."}
          </p>
        </div>
        {user && (
          <Link href="/post-item" className={buttonClasses("primary", "md")} data-magnetic>
            Post an item
          </Link>
        )}
      </div>

      {signedOut ? (
        <GlassCard className="mx-auto max-w-md px-6 py-10 text-center">
          <p className="font-display text-xl font-bold text-fg">Sign in to see your stall</p>
          <p className="mt-2 text-sm text-muted">
            {isFirebaseConfigured
              ? "Use your Google account. Your listings and their status are kept here."
              : "Demo mode: sign-in turns on once Firebase is connected (see README)."}
          </p>
          <Button className="mt-6" onClick={() => setSignInOpen(true)} disabled={!isFirebaseConfigured} magnetic>
            Sign in with Google
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {counts.sold > 0 && <ImpactCounter soldListings={shown.filter((l) => l.status === "sold")} scope="you" />}

          {error && (
            <p role="alert" className="rounded-2xl border border-sold/30 bg-sold/10 px-4 py-3 text-sm text-fg">
              {error}
            </p>
          )}

          {loading || authLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-3xl" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <GlassCard className="mx-auto max-w-md px-6 py-10 text-center">
              <p className="font-display text-xl font-bold text-fg">Your stall is empty</p>
              <p className="mt-2 text-sm text-muted">
                That calculator from last semester could be someone&apos;s exam lifesaver.
              </p>
              <Link href="/post-item" className={buttonClasses("primary", "md", "mt-6")}>
                Post your first item
              </Link>
            </GlassCard>
          ) : (
            <ul className="space-y-3">
              {shown.map((l) => {
                const expired = isExpired(l.expiresAt, now);
                const left = timeLeft(l.expiresAt, now);
                return (
                  <li key={l.id}>
                    <GlassCard
                      className={cn(
                        "flex flex-col gap-4 p-4 transition-opacity sm:flex-row sm:items-center",
                        (l.status === "sold" || expired) && "opacity-75",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                          {l.imageUrl ? (
                            <Image
                              src={l.imageUrl}
                              alt=""
                              fill
                              sizes="80px"
                              unoptimized={l.imageUrl.startsWith("data:")}
                              className={cn("object-cover", l.status === "sold" && "grayscale")}
                            />
                          ) : (
                            <div className={cn("grid h-full w-full place-items-center bg-gradient-to-br", CATEGORY_BY_ID[l.category].placeholder)}>
                              <CategoryIcon category={l.category} className="h-7 w-7 text-fg/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <p className="truncate font-display font-bold tracking-tight text-fg">{l.title}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            <PriceTag price={l.price} unit={l.priceUnit} muted={l.status === "sold"} className="!text-sm" />
                            <span>{CATEGORY_BY_ID[l.category].hashtag}</span>
                            <span>Posted {timeAgo(l.createdAt, now || Date.now())}</span>
                            {expired ? (
                              <span className="font-medium text-sold">Expired, hidden from the market</span>
                            ) : (
                              left && (
                                <span className="inline-flex items-center gap-1 text-reserved">
                                  <Clock className="h-3 w-3" aria-hidden /> {left}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <StatusToggle
                          title={l.title}
                          value={l.status}
                          onChange={(s) => changeStatus(l, s)}
                          disabled={!!pending[l.id]}
                        />
                        <button
                          type="button"
                          onClick={() => setToDelete(l)}
                          aria-label={`Delete ${l.title}`}
                          className="rounded-full p-2.5 text-muted transition-colors hover:bg-sold/10 hover:text-sold"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </GlassCard>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this listing?"
        description={
          <>
            <strong className="text-fg">{toDelete?.title}</strong> will be removed from the market. If it sold, mark it
            Sold instead so it still counts toward the campus impact total.
          </>
        }
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setToDelete(null)}>
            Keep listing
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            Delete listing
          </Button>
        </div>
      </Modal>

      <AccountModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </main>
  );
}
