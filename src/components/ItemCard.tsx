"use client";

import Image from "next/image";
import { Clock, MapPin, Send, Sparkles } from "lucide-react";
import { CATEGORY_BY_ID, CONDITION_LABEL } from "@/lib/constants";
import { cn, timeAgo, timeLeft } from "@/lib/format";
import { inquiryMessage, telegramLink } from "@/lib/telegram";
import { judgePrice } from "@/lib/aiService";
import type { Listing } from "@/lib/types";
import { StatusPill } from "./ui/StatusPill";
import { useToast } from "./ui/Toast";
import { buttonClasses } from "./ui/Button";
import { CategoryIcon } from "./CategoryIcon";
import { PriceTag } from "./PriceTag";

const PRICE_BADGE = {
  great_deal: { label: "Below usual price", className: "text-accent" },
  fair: { label: "Fair price", className: "text-cyan" },
} as const;

export function ItemCard({ listing, now, priority }: { listing: Listing; now: number; priority?: boolean }) {
  const toast = useToast();
  const meta = CATEGORY_BY_ID[listing.category];
  const sold = listing.status === "sold";
  const left = timeLeft(listing.expiresAt, now);
  const verdict =
    listing.ai?.priceLow != null && listing.ai?.priceHigh != null
      ? judgePrice(listing.price, listing.ai.priceLow, listing.ai.priceHigh)
      : "unknown";
  const badge = verdict === "great_deal" || verdict === "fair" ? PRICE_BADGE[verdict] : null;

  async function copyInquiry() {
    try {
      await navigator.clipboard.writeText(inquiryMessage(listing.title));
      toast("Message copied. Paste it in the Telegram chat.", "info");
    } catch {
      /* Clipboard can be blocked; the link still opens the chat. */
    }
  }

  return (
    <article
      data-cursor
      className={cn(
        "group glass gradient-ring relative flex flex-col overflow-hidden rounded-3xl shadow-card",
        "transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-float",
        sold && "hover:translate-y-0",
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt=""
            fill
            priority={priority}
            unoptimized={listing.imageUrl.startsWith("data:")}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.04]",
              sold && "grayscale opacity-60 group-hover:scale-100",
            )}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 grid place-items-center bg-gradient-to-br",
              meta.placeholder,
              sold && "grayscale opacity-60",
            )}
          >
            <CategoryIcon category={listing.category} className="h-14 w-14 text-fg/25" strokeWidth={1.25} />
          </div>
        )}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="glass rounded-full px-2.5 py-1 font-display text-[11px] font-bold tracking-tight text-fg">
            {meta.hashtag}
          </span>
          <StatusPill status={listing.status} />
        </div>

        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-bg/30">
            <div className="stamp animate-stamp-in" role="img" aria-label="Sold out">
              <span className="block text-3xl tracking-[0.12em]">HABIS</span>
              <span className="block text-[10px] font-bold tracking-[0.3em]">SOLD OUT</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <PriceTag price={listing.price} unit={listing.priceUnit} muted={sold} />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-snug tracking-tight text-fg">
            {listing.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{listing.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
          {listing.condition && <span className="font-medium text-fg/80">{CONDITION_LABEL[listing.condition]}</span>}
          {listing.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {listing.location}
            </span>
          )}
          {left && !sold && (
            <span className="inline-flex items-center gap-1 text-reserved">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {left}
            </span>
          )}
          {badge && !sold && (
            <span className={cn("inline-flex items-center gap-1 font-medium", badge.className)}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {badge.label}
            </span>
          )}
        </div>

        {listing.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {listing.tags.slice(0, 4).map((t) => (
              <li key={t} className="rounded-md bg-line px-1.5 py-0.5 text-xs text-muted">
                #{t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {listing.sellerPhoto ? (
              <Image
                src={listing.sellerPhoto}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 text-xs font-bold text-white">
                {listing.sellerName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-medium text-fg">{listing.sellerName}</p>
              <p className="text-xs text-muted">{timeAgo(listing.createdAt, now)}</p>
            </div>
          </div>

          {sold ? (
            <span className={buttonClasses("telegram", "sm", "pointer-events-none !bg-line !text-muted !shadow-none")}>
              Sold out
            </span>
          ) : (
            <a
              href={telegramLink(listing.sellerTelegram)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={copyInquiry}
              data-magnetic
              aria-label={`Chat with ${listing.sellerName} on Telegram about ${listing.title}`}
              className={buttonClasses("telegram", "sm")}
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              {listing.status === "reserved" ? "Join queue" : "Chat"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
