# UMarket — campus circular market

An AI-assisted marketplace for Universiti Teknologi PETRONAS (UTP) and Seri Iskandar Town. It replaces the crowded
pasarUTP Telegram channel's text-only listings with a live feed where availability is always current, listings are
categorised and priced with help from an on-device AI assistant, and every sale adds to a campus-wide estimate of
waste and emissions avoided.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Firebase (Auth, Firestore, Storage) · Vercel

---

## 1. Problem and how the app answers it

| Bottleneck on the Telegram channel | What PasarUTP does |
| --- | --- |
| Buyers keep asking about items that are already sold | Sellers flip **Available / Reserved / Sold** in one tap; the feed updates instantly through Firestore `onSnapshot`. Sold items are greyed out with a *HABIS* stamp and the chat button is disabled. |
| Expired food pre-orders and past bus/train tickets clutter the feed | Listings carry an end time; they drop out of the market automatically once it passes (TTL filter re-checked every 30 s). |
| Miscategorised and spammy posts | An NLP categoriser picks the category as you type and warns when a post is filed under the wrong one; quality checks flag links, phone numbers, all-caps and repeated characters. |
| Sellers guess prices, unsold items get thrown away | A fair-price recommender suggests a range from item type, condition and (optionally) the price when new, so usable goods sell instead of being dumped. |
| Contact friction | Every card has a Telegram deep link (`t.me/username`); a ready-made "Is it still available?" message is copied to the clipboard. |
| Sustainability benefit is invisible | The impact tracker sums kg of material kept in use and kg CO₂e avoided across every listing marked Sold. |

## 2. The AI components

All AI runs in the browser (`src/lib/aiService.ts` is the single entry point). No API keys, no per-request cost, and
suggestions update while the seller types.

| Component | File | Technique |
| --- | --- | --- |
| Categoriser | `lib/ai/categorizer.ts`, `lib/ai/naiveBayes.ts`, `lib/ai/corpus.ts` | Multinomial Naive Bayes (Laplace smoothing, α = 0.5) over unigram + bigram features. Bilingual preprocessing in `lib/ai/text.ts`: English and Malay stopwords, shorthand expansion (*PO → preorder, tiket → ticket, kasut → shoes*), title words weighted ×2. Confidences are temperature-scaled by text length so they don't saturate at 100 %. Explains each prediction with the words that drove it (log-likelihood ratio). |
| Tagger / item detector | `lib/ai/tagger.ts`, `lib/ai/itemCatalog.ts` | Weighted keyword and phrase matching against a catalogue of ~45 item types common at UTP (lab coats, safety boots, fx-570 calculators, rice cookers, bus tickets…), biased toward the predicted category. |
| Fair-price recommender | `lib/ai/pricing.ts` | Resale bands by condition (e.g. *Good* = 45–60 % of new), adjusted by depreciation class (electronics, textbooks, apparel). Tickets are anchored to face value and anything above it is flagged to discourage scalping. |
| Impact estimator | `lib/ai/impact.ts` | Item mass and embodied CO₂e from the catalogue × a 0.7 displacement rate for preloved goods (not every resale replaces a new purchase). Repairs earn a partial credit; tickets count zero. |
| Quality checks | `lib/ai/quality.ts` | Miscategorisation warning (model confidence ≥ 70 % disagreeing with the seller's choice) plus spam heuristics. |

### Evaluation

`npm run eval:ai` scores the categoriser on a **held-out** set (`scripts/classifier-testset.ts`) that shares no
examples with the training corpus. Current result (118 training examples, 42 test examples):

```
Accuracy: 95.2% (40/42)          Macro F1: 0.950

           precision    recall        f1   support
PRELOVED        0.92      1.00      0.96        12
FOOD            1.00      1.00      1.00        10
TICKETS         0.91      1.00      0.95        10
SERVICES        1.00      0.80      0.89        10
```

The two misses ("Sew and alter clothes" → Preloved, "Carpool to Ipoh" → Tickets) are genuinely ambiguous and show
where more training data would help. The test set is small, so treat the number as indicative. To improve the model,
add anonymised real posts to `lib/ai/corpus.ts` (never to the test set) and re-run the evaluation.

`npm test` runs unit tests for the categoriser, item detection, pricing rules, impact totals and Telegram handle
validation.

### Impact methodology (for the report)

Item masses and embodied emissions in `itemCatalog.ts` are rounded indicative figures in line with published product
lifecycle studies and manufacturer product reports (e.g. a laptop ≈ 300 kg CO₂e to manufacture, a smartphone
≈ 65 kg). The 0.7 displacement rate is a stated assumption of this prototype; published estimates vary by product.
The driving equivalent uses ≈ 0.17 kg CO₂e per km for an average petrol car. These are awareness estimates, not
certified carbon accounting, and the app says so in its "How this is estimated" note.

---

## 3. Project structure

```
src/
├── app/
│   ├── layout.tsx              Fonts, theme, cursor, floating dock
│   ├── page.tsx                Marketplace home: hero search, impact counter, live feed
│   ├── post-item/page.tsx      Seller form with the live AI assistant panel
│   ├── my-listings/page.tsx    Seller dashboard: one-tap status toggle, delete
│   └── icon.svg
├── components/
│   ├── ui/                     Button, GlassCard, Input/Field, Modal, Segmented, StatusPill, Toast, Skeleton
│   ├── ThemeToggle.tsx         Light/dark switch
│   ├── CustomCursor.tsx        Trailing glow + magnetic ring (desktop only, respects reduced motion)
│   ├── ItemCard.tsx            Listing card: price tag, status pill, SOLD stamp, Telegram link
│   ├── CategoryFilter.tsx      #PRELOVED #FOOD #TICKETS #SERVICES pills with counts
│   ├── ImpactCounter.tsx       Circular-economy metrics
│   ├── AIAssistantPanel.tsx    Category bars, tags, price range, impact, quality checks
│   ├── FloatingDock.tsx        Bottom navigation
│   ├── AccountModal.tsx        Google sign-in and Telegram username
│   └── …
├── lib/
│   ├── firebase.ts             SDK initialisation (demo mode when keys are missing)
│   ├── firestore.ts            Real-time queries and CRUD
│   ├── imageService.ts         In-browser photo compression and upload
│   ├── aiService.ts            AI facade → lib/ai/*
│   ├── ai/                     Categoriser, corpus, catalogue, pricing, impact, quality
│   ├── AuthProvider.tsx        Auth + profile context
│   ├── ThemeProvider.tsx       next-themes wrapper (dark by default)
│   └── hooks/                  useListings, useNow (TTL clock), useDebouncedValue
└── styles/globals.css          Theme tokens, mesh gradient, glass, price tag, stamp, cursor
firestore.rules · storage.rules · firebase.json
tests/ai.test.ts · scripts/evaluate-classifier.ts
```

## 4. Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local     # then fill in the Firebase values (section 5)
npm run dev                    # http://localhost:3000
```

Without Firebase keys the app starts in **demo mode**: sample listings, a working AI assistant on the Post page,
and a banner explaining how to connect Firebase. Useful for a first look or a presentation fallback.

---

## 5. Firebase setup

### 5.1 Create the project and web app

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Create a project** (e.g. `pasarutp`).
   Google Analytics is optional.
2. On the project overview, click the **Web** icon (`</>`) to add a web app. Name it `PasarUTP`; you don't need
   Firebase Hosting (Vercel hosts the app).
3. Copy the `firebaseConfig` values into `.env.local`:

   | `firebaseConfig` key | Environment variable |
   | --- | --- |
   | `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
   | `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
   | `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

   These keys identify your project to the browser; they are not secrets. Your data is protected by the security
   rules below, which is why deploying them matters.

### 5.2 Google sign-in

1. **Build → Authentication → Get started → Sign-in method → Google → Enable**. Choose a support email and save.
2. **Authentication → Settings → Authorized domains**: `localhost` is already there. After your first Vercel deploy,
   add your production domain, e.g. `ai-project-xyz.vercel.app`. Sign-in fails with `auth/unauthorized-domain`
   until you do.

### 5.3 Firestore

1. **Build → Firestore Database → Create database**. Choose **production mode** and the location
   **asia-southeast1 (Singapore)**, closest to Perak. The location can't be changed later.
2. Open the **Rules** tab, replace everything with the contents of [`firestore.rules`](./firestore.rules), and
   click **Publish**.
3. No composite indexes are needed: the seller dashboard sorts on the client to avoid one.

**What the rules guarantee**

- Anyone can read listings (browsing doesn't need an account).
- Creating a listing requires sign-in, `sellerId` must equal the signer's UID, it must start as `available`, and
  every field is type- and size-checked.
- **Only the original seller can update a listing** — including changing its status to Sold — or delete it.
  `sellerId` and `createdAt` can never be changed.
- Users can only read and write their own profile, and the Telegram handle must be a valid username.
- Every other path is closed.

Test them in the console's **Rules Playground**: try an `update` on `listings/x` as a different UID and it is denied.

### 5.4 Storage (listing photos)

Cloud Storage for Firebase now requires the pay-as-you-go **Blaze** plan for new projects. Blaze still includes a
no-cost usage tier, and you can set a budget alert in Google Cloud so you're warned well before any charge. You have
two options:

- **Use Storage (recommended for production):** upgrade to Blaze, then **Build → Storage → Get started**, pick a
  location, open **Rules**, paste [`storage.rules`](./storage.rules) and **Publish**. Keep
  `NEXT_PUBLIC_IMAGE_MODE=storage`.
- **Stay on the free Spark plan:** set `NEXT_PUBLIC_IMAGE_MODE=inline`. Photos are shrunk to a small thumbnail
  (under ~130 KB) and stored inside the listing document. Everything else works the same.

In `storage` mode, if an upload ever fails the app automatically falls back to an inline thumbnail rather than
losing the listing.

### 5.5 Deploying rules from the command line (optional)

```bash
npx firebase-tools login
npx firebase-tools use --add          # pick your project
npx firebase-tools deploy --only firestore:rules,storage
```

### 5.6 Optional: automatic deletion of old expired listings

Expired listings are already hidden by the app. To also delete them from the database, add a Firestore **TTL
policy** on the `expiresAt` field of the `listings` collection group (Firestore → TTL). Deleted listings no longer
count toward the impact total, so leave this off if you want sold food orders to keep counting.

---

## 6. Deploy on Vercel

### 6.1 Push the code to GitHub

From this folder:

```bash
git init
git add .
git commit -m "UMarket: AI-assisted campus marketplace"
git branch -M main
git remote add origin https://github.com/Wan2Som/AI-Project.git
git push -u origin main
```

If the repository already has commits (for example a README created on GitHub), run
`git pull origin main --allow-unrelated-histories` before the push and keep this project's files when resolving any
conflict.

### 6.2 Import the repository into Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New… → Project → Import Git Repository**. If `Wan2Som/AI-Project` isn't listed, choose **Adjust GitHub
   App Permissions** and grant Vercel access to it.
3. Vercel detects **Next.js** automatically. Leave the build command (`next build`) and output settings as they are.

### 6.3 Add the environment variables

Before clicking **Deploy**, expand **Environment Variables** (or later: **Project → Settings → Environment
Variables**) and add each of these, ticking **Production**, **Preview** and **Development**:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_IMAGE_MODE            (storage or inline)
```

Tip: you can paste the whole contents of `.env.local` into the first key field and Vercel splits it into separate
variables.

`NEXT_PUBLIC_*` values are baked in at build time, so **after changing any variable, redeploy** (Deployments → ⋯ →
Redeploy) for it to take effect.

### 6.4 Continuous deployment

Once imported, the GitHub integration handles CI/CD:

- Every push to `main` builds and deploys to production.
- Every other branch and every pull request gets its own **Preview** deployment with a unique URL, commented on the PR.
- A failed build never replaces the live site.

Remember to add the production domain to Firebase **Authorized domains** (section 5.2). Preview URLs change per
deployment; add one there too if you need to test sign-in on a preview.

---

## 7. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Banner says *Demo mode* on Vercel | Environment variables are missing or were added after the build. Add them and redeploy. |
| `auth/unauthorized-domain` | Add the site's domain under Authentication → Settings → Authorized domains. |
| Sign-in popup does nothing inside Telegram's in-app browser | The app falls back to a redirect; if it still fails, open the link in Chrome or Safari. |
| "The database refused the request" | `firestore.rules` hasn't been published, or a field doesn't pass validation. |
| Photos don't upload | Storage isn't enabled (needs Blaze). Set `NEXT_PUBLIC_IMAGE_MODE=inline` or enable Storage. |

## 8. Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm test` | AI unit tests |
| `npm run eval:ai` | Categoriser accuracy, per-class F1 and confusion matrix |
