"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, X } from "lucide-react";
import { analyzeListing, toAIMeta } from "@/lib/aiService";
import { useAuth } from "@/lib/AuthProvider";
import { createListing } from "@/lib/firestore";
import { isFirebaseConfigured } from "@/lib/firebase";
import { uploadListingImage } from "@/lib/imageService";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { CATEGORIES, CATEGORY_BY_ID, CONDITIONS, MAX_TAGS, PICKUP_SUGGESTIONS } from "@/lib/constants";
import { toDatetimeLocal } from "@/lib/format";
import type { Category, Condition } from "@/lib/types";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { AccountModal } from "@/components/AccountModal";
import { BrandMark } from "@/components/BrandMark";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";

type Errors = Partial<Record<"title" | "description" | "price" | "expiresAt" | "photo", string>>;

function parseMoney(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function PostItemPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("PRELOVED");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [condition, setCondition] = useState<Condition>("good");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [location, setLocation] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = CATEGORY_BY_ID[category];
  const priceNum = parseMoney(price);
  const originalNum = parseMoney(originalPrice);

  // ── AI assistant: re-run on a short debounce as the seller types ──
  const liveDraft = useMemo(
    () => ({ title, description, condition, price: priceNum, originalPrice: originalNum, category, categoryTouched }),
    [title, description, condition, priceNum, originalNum, category, categoryTouched],
  );
  const draft = useDebouncedValue(liveDraft, 220);
  const analysis = useMemo(() => {
    if (draft.title.trim().length < 3) return null;
    return analyzeListing({
      title: draft.title,
      description: draft.description,
      category: draft.categoryTouched ? draft.category : null,
      condition: draft.condition,
      price: draft.price,
      originalPrice: draft.originalPrice,
    });
  }, [draft]);

  // Follow the AI's category until the seller picks one themselves.
  useEffect(() => {
    if (!categoryTouched && analysis?.prediction.informative) setCategory(analysis.prediction.category);
  }, [analysis, categoryTouched]);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function addTag(raw: string) {
    const t = raw.toLowerCase().replace(/^#/, "").replace(/[^a-z0-9-]/g, "").slice(0, 24);
    if (!t || tags.includes(t) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, t]);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (title.trim().length < 3) e.title = "Give it a title of at least 3 characters.";
    else if (title.length > 80) e.title = "Keep the title under 80 characters.";
    if (description.length > 1000) e.description = "Keep the description under 1,000 characters.";
    if (priceNum == null || priceNum < 0) e.price = "Enter a price in ringgit. Use 0 to give it away.";
    else if (priceNum > 100000) e.price = "That price looks too high. Check the number.";
    if (meta.requiresExpiry) {
      if (!expiresAt) e.expiresAt = `${meta.name} listings need an end time so they disappear once they've passed.`;
      else if (new Date(expiresAt).getTime() <= Date.now()) e.expiresAt = "Choose a time in the future.";
    }
    return e;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      toast("Some details need fixing before you publish.", "error");
      return;
    }
    if (!user || !profile) {
      setAccountOpen(true);
      return;
    }
    if (!profile.telegram) {
      toast("Add your Telegram username so buyers can reach you.", "info");
      setAccountOpen(true);
      return;
    }

    const final = analyzeListing({
      title,
      description,
      category,
      condition: category === "PRELOVED" ? condition : null,
      price: priceNum,
      originalPrice: originalNum,
    });

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        const up = await uploadListingImage(photo, user.uid);
        imageUrl = up.url;
      }
      await createListing(profile, {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        condition: category === "PRELOVED" ? condition : null,
        price: priceNum!,
        priceUnit: final.price.unit,
        originalPrice: originalNum,
        imageUrl,
        location: location.trim(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        ai: toAIMeta(final),
        impact: final.impact,
      });
      toast("Listing published. It's live in the market now.");
      router.push("/my-listings");
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Couldn't publish. Check your connection and try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const minExpiry = useMemo(() => toDatetimeLocal(new Date()), []);
  const originalLabel = category === "TICKETS" ? "Face value (optional)" : "Price when new (optional)";

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between py-5">
        <BrandMark />
      </header>

      <div className="pb-6 pt-2">
        <h1 className="font-display text-4xl font-black tracking-[-0.03em] text-fg sm:text-5xl">Post an item</h1>
        <p className="mt-2 max-w-[60ch] text-muted">
          Describe what you&apos;re selling. The assistant fills in the category, suggests tags and checks your price
          against what similar things usually go for.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <GlassCard className="space-y-7 p-5 sm:p-7">
          {/* Photo */}
          <Field label="Photo" htmlFor="photo" hint="Optional. Resized on your phone before upload, so it's quick on campus Wi-Fi.">
            {preview ? (
              <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-line">
                <Image src={preview} alt="Selected photo" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="glass absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-fg"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className="flex aspect-[4/3] w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong text-sm text-muted transition-colors hover:border-accent/60 hover:text-fg"
              >
                <ImagePlus className="h-8 w-8" aria-hidden />
                Add a photo
              </label>
            )}
            <input
              ref={fileRef}
              id="photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </Field>

          {/* Title & description */}
          <Field label="Title" htmlFor="title" error={errors.title} aside={<span className="tabular text-xs text-muted">{title.length}/80</span>}>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Casio fx-570EX calculator"
              maxLength={80}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description} hint="Condition, what's included, when you can meet.">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Used for one semester, all functions work. Comes with the hard cover. Pickup at Village 4 after 5 pm."
              maxLength={1000}
              aria-invalid={!!errors.description}
            />
          </Field>

          {/* Category */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-fg" id="category-label">
              Category
              {!categoryTouched && analysis?.prediction.informative && (
                <span className="ml-2 text-xs font-medium text-ai">picked by the assistant</span>
              )}
            </p>
            <Segmented<Category>
              label="Category"
              value={category}
              onChange={(c) => {
                setCategory(c);
                setCategoryTouched(true);
              }}
              options={CATEGORIES.map((c) => ({
                value: c.id,
                label: (
                  <>
                    <CategoryIcon category={c.id} className="h-4 w-4" />
                    <span className="font-display tracking-tight">{c.hashtag}</span>
                  </>
                ),
              }))}
            />
            <p className="text-sm text-muted">{meta.blurb}</p>
          </div>

          {category === "PRELOVED" && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-fg">Condition</p>
              <Segmented<Condition>
                label="Condition"
                size="sm"
                value={condition}
                onChange={setCondition}
                options={CONDITIONS.map((c) => ({ value: c.id, label: c.label }))}
              />
              <p className="text-sm text-muted">{CONDITIONS.find((c) => c.id === condition)?.hint}</p>
            </div>
          )}

          {/* Price */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your price (RM)" htmlFor="price" error={errors.price}>
              <Input
                id="price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={analysis ? String(analysis.price.suggested) : "0"}
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-error" : undefined}
              />
            </Field>
            {(category === "PRELOVED" || category === "TICKETS") && (
              <Field label={originalLabel} htmlFor="original" hint="Makes the price suggestion more accurate.">
                <Input
                  id="original"
                  inputMode="decimal"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 110"
                />
              </Field>
            )}
          </div>

          {/* Pickup & expiry */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Pickup or delivery" htmlFor="location">
              <Input
                id="location"
                list="pickup-suggestions"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Village 4"
                maxLength={60}
              />
              <datalist id="pickup-suggestions">
                {PICKUP_SUGGESTIONS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
            <Field
              label={meta.requiresExpiry ? "Listing ends" : "Listing ends (optional)"}
              htmlFor="expires"
              error={errors.expiresAt}
              hint={category === "FOOD" ? "When pre-orders close." : category === "TICKETS" ? "Departure or event time." : "Hidden from the market after this."}
            >
              <Input
                id="expires"
                type="datetime-local"
                min={minExpiry}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                aria-invalid={!!errors.expiresAt}
                aria-describedby={errors.expiresAt ? "expires-error" : undefined}
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags" htmlFor="tag-input" hint={`Up to ${MAX_TAGS}. Press Enter to add, or tap a suggestion.`}>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-strong/70 p-2">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent/12 py-1 pl-2.5 pr-1 text-xs font-medium text-accent">
                  #{t}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                    aria-label={`Remove tag ${t}`}
                    className="rounded-full p-0.5 hover:bg-accent/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                    setTagInput("");
                  } else if (e.key === "Backspace" && !tagInput && tags.length) {
                    setTags((prev) => prev.slice(0, -1));
                  }
                }}
                disabled={tags.length >= MAX_TAGS}
                placeholder={tags.length >= MAX_TAGS ? "Tag limit reached" : "Add a tag"}
                className="h-8 min-w-28 flex-1 bg-transparent px-2 text-sm text-fg outline-none placeholder:text-muted/70"
              />
            </div>
          </Field>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {!isFirebaseConfigured
                ? "Demo mode: publishing turns on once Firebase is connected."
                : !user
                  ? "You'll sign in with Google before publishing."
                  : `Buyers will message @${profile?.telegram ?? "your-username"} on Telegram.`}
            </p>
            <Button type="submit" size="lg" loading={submitting} disabled={!isFirebaseConfigured} magnetic>
              Publish listing
            </Button>
          </div>
        </GlassCard>

        <div className="lg:sticky lg:top-6">
          <AIAssistantPanel
            analysis={analysis}
            chosenCategory={category}
            categoryFollowsAI={!categoryTouched}
            tags={tags}
            price={priceNum}
            onUseCategory={(c) => {
              setCategory(c);
              setCategoryTouched(false);
            }}
            onAddTag={addTag}
            onUsePrice={(p) => setPrice(String(p))}
          />
        </div>
      </form>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </main>
  );
}
