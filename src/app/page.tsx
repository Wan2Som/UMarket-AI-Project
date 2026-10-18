"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useListings, useSoldListings } from "@/lib/hooks/useListings";
import { useNow } from "@/lib/hooks/useNow";
import { cn, isExpired } from "@/lib/format";
import { CATEGORY_BY_ID } from "@/lib/constants";
import type { Listing } from "@/lib/types";
import { BrandMark } from "@/components/BrandMark";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { ImpactCounter } from "@/components/ImpactCounter";
import { ItemCard } from "@/components/ItemCard";
import { SetupBanner } from "@/components/SetupBanner";
import { ItemCardSkeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";

type Sort = "newest" | "price_low" | "price_high";

function matches(l: Listing, q: string): boolean {
  if (!q) return true;
  const hay = `${l.title} ${l.description} ${l.tags.join(" ")} ${l.location} ${l.sellerName}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

export default function MarketplaceHome() {
  const { listings, loading, error, demo } = useListings();
  const sold = useSoldListings();
  const now = useNow();
  const [category, setCategory] = useState<CategoryFilterValue>("ALL");
  const [query, setQuery] = useState("");
  const [showSold, setShowSold] = useState(true);
  const [sort, setSort] = useState<Sort>("newest");

  // TTL: expired food pre-orders and tickets drop out of the feed automatically.
  const live = useMemo(() => listings.filter((l) => !isExpired(l.expiresAt, now)), [listings, now]);

  const searched = useMemo(() => live.filter((l) => matches(l, query) && (showSold || l.status !== "sold")), [live, query, showSold]);

  const counts = useMemo(() => {
    const c: Partial<Record<CategoryFilterValue, number>> = { ALL: searched.length };
    for (const l of searched) c[l.category] = (c[l.category] ?? 0) + 1;
    return c;
  }, [searched]);

  const visible = useMemo(() => {
    const list = searched.filter((l) => category === "ALL" || l.category === category);
    const rank = (l: Listing) => (l.status === "sold" ? 1 : 0); // sold items sink below live ones
    return [...list].sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (sort === "price_low") return a.price - b.price;
      if (sort === "price_high") return b.price - a.price;
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
  }, [searched, category, sort]);

  const availableCount = live.filter((l) => l.status === "available").length;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between py-5">
        <BrandMark />
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className={cn("absolute h-full w-full rounded-full", demo ? "bg-reserved" : "bg-accent animate-live-ping")} />
            <span className={cn("relative h-2 w-2 rounded-full", demo ? "bg-reserved" : "bg-accent")} />
          </span>
          {demo ? "Sample data" : "Live"}
        </span>
      </header>

      {/* Hero: the search box is the first thing you can use. */}
      <section className="grid gap-6 pb-8 pt-4 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-10 lg:pt-10">
        <div className="animate-rise">
          <h1 className="max-w-[16ch] font-display text-[2.6rem] font-black leading-[1.02] tracking-[-0.035em] text-fg sm:text-6xl lg:text-7xl">
            The UTP pasar, minus the scroll.
          </h1>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">
            Preloved goods, food pre-orders, tickets and services from students around UTP and Seri Iskandar. When a
            seller marks something sold, it changes here instantly, so you only message about things you can still get.
          </p>
          <label className="relative mt-7 block max-w-xl">
            <span className="sr-only">Search listings</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try calculator or nasi lemak"
              aria-describedby="available-count"
              className="glass h-14 w-full rounded-full pl-13 pr-12 text-base text-fg shadow-card outline-none transition-shadow placeholder:text-muted/80 focus:shadow-[0_0_0_4px_rgb(var(--cursor-rgb)/0.18)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted hover:bg-line hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <p id="available-count" className="mt-3 pl-5 text-sm text-muted">
            {loading ? "Loading listings…" : `${availableCount} available right now`}
          </p>
        </div>
        <div className="animate-rise [animation-delay:120ms]">
          <ImpactCounter soldListings={sold} />
        </div>
      </section>

      {demo && (
        <div className="mb-6">
          <SetupBanner />
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-transparent bg-bg/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter value={category} onChange={setCategory} counts={counts} />
          <div className="flex items-center gap-2 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-muted backdrop-blur-md hover:text-fg">
              <input
                type="checkbox"
                checked={showSold}
                onChange={(e) => setShowSold(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Show sold
            </label>
            <label className="sr-only" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-[38px] rounded-full border border-line bg-surface-strong px-3.5 text-muted outline-none hover:text-fg"
            >
              <option value="newest">Newest first</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-2xl border border-sold/30 bg-sold/10 px-4 py-3 text-sm text-fg">
          {error}
        </p>
      )}

      {/* Feed */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((l, i) => (
            <ItemCard key={l.id} listing={l} now={now || Date.now()} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="glass mx-auto max-w-md rounded-3xl px-6 py-12 text-center">
          <p className="font-display text-xl font-bold text-fg">
            {query ? `Nothing matches "${query}"` : "Nothing here yet"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {query
              ? "Try a shorter word, or check another category."
              : `Be the first to post in ${category === "ALL" ? "the market" : CATEGORY_BY_ID[category].hashtag}.`}
          </p>
          <Link href="/post-item" className={buttonClasses("primary", "md", "mt-6")}>
            Post an item
          </Link>
        </div>
      )}
    </main>
  );
}
