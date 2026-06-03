# PRD — Whop Marketplace (V1)

**Status:** Ready for build · **Owner:** Aman · **Date:** 2026-06-03
**One-liner:** A two-sided, task-based services marketplace for the creator economy — buyers post work, sellers compete with AI-matched offers, deals close through escrow. Built in Whop's visual language.

> Note: this repo has no issue tracker configured, so the PRD lives here as the source-of-truth scope doc for the V1 build. Each "Module" below maps to a build task in the task list.

---

## Problem Statement

Creators and the people who serve them (community managers, course builders, bot developers, designers, marketers) have no focused place to transact on **custom work**. Generic freelance sites (Fiverr/Upwork) aren't built for the creator economy, and Whop today is great at selling *pre-packaged* digital products but not *bespoke services*.

From the **buyer's** perspective: "I have a specific job — set up my paid Discord, build me a trading bot, edit my YouTube videos — and I don't know who's good, who's available, or what a fair price is. Browsing endless listings and vetting strangers is slow and risky. I want the right seller to come to me, and I want my money protected until the work is delivered."

From the **seller's** perspective: "I have skills the creator economy needs, but finding qualified buyers, standing out, and getting paid reliably is hard. I want to discover relevant open work, pitch with confidence, and build a reputation that compounds."

## Solution

A **hybrid marketplace** that combines two discovery models on one platform, themed in Whop's dark/orange brand:

1. **Browse gigs** (Fiverr-style supply-first): sellers publish productized **services** with tiered packages; buyers browse, filter, and buy off the shelf.
2. **Post a task** (Upwork/TaskRabbit-style demand-first): buyers post a **task** with a brief and budget; the platform surfaces **AI-matched sellers** (a transparent compatibility score with reasons); sellers send competing **offers**; the buyer accepts one.

Either path converges on a single trusted fulfillment loop: **Order → Escrow (Held → In Progress → Delivered → Released) → in-order chat → mutual review**. A one-click **persona switcher** (Guest / Buyer / Seller) lets anyone experience both sides instantly, and sellers get an **analytics dashboard** that makes the supply side feel real.

**Why it wins:** the AI matching + escrow + dual-persona flow demonstrates a genuinely two-sided marketplace (not just a catalog) end-to-end, on-brand for Whop, in a single sitting.

---

## User Stories

### Discovery & browse (Buyer)
1. As a buyer, I want a landing page with a hero, search, and category pills, so that I immediately understand what the marketplace offers and where to start.
2. As a buyer, I want to browse a grid of featured creator-service gigs, so that I can discover sellers without knowing exactly who I need.
3. As a buyer, I want to filter gigs by category, price, and rating, so that I can narrow to relevant, trustworthy options.
4. As a buyer, I want to search by keyword/intent ("set up my Discord"), so that I can find matching services fast.
5. As a buyer, I want each gig card to show thumbnail, title, seller avatar, level badge, rating score **and** count, starting price, and delivery time, so that I can judge fit at a glance without clicking.
6. As a buyer, I want a graceful zero-results state that suggests broadening filters or posting a task, so that a dead end becomes a path forward.

### Gig detail & direct purchase (Buyer)
7. As a buyer, I want a gig detail page with description, gallery, seller info, and reviews, so that I can evaluate before buying.
8. As a buyer, I want Basic / Standard / Premium packages with the middle anchored, so that I can pick the scope that fits my budget.
9. As a buyer, I want a checkout summary showing price + platform fee + total and an escrow-protection note, so that I trust the transaction and know the full cost.
10. As a buyer, I want buying a gig to instantly create an order I can track, so that I feel the platform "works."

### Post a task & receive offers (Buyer)
11. As a buyer, I want to post a task on one screen (title, category, description, budget range), so that requesting custom work is fast.
12. As a buyer, I want the platform to recommend best-matched sellers with a compatibility % and a one-line reason, so that I don't have to vet strangers from scratch.
13. As a buyer, I want sellers to send offers (price, delivery time, pitch) on my task, so that I can compare competing bids.
14. As a buyer, I want each offer to show the seller's match %, rating, level, and price, so that I can choose confidently.
15. As a buyer, I want to accept exactly one offer, which creates an order and moves funds into escrow, so that the deal is locked and protected.

### Selling (Seller)
16. As a seller, I want to switch into seller mode, so that I see seller-specific surfaces (open tasks, my offers, orders, dashboard).
17. As a seller, I want to browse open buyer tasks filtered to my categories, so that I can find relevant work.
18. As a seller, I want to submit an offer on a task (price, delivery days, message), so that I can win work.
19. As a seller, I want to see how I rank against other sellers for a task (my match %), so that I know where I stand.
20. As a seller, I want a service listing with tiered packages, so that buyers can buy from me off the shelf.
21. As a seller, I want a reputation/level badge driven by completed orders and ratings, so that my track record attracts buyers.

### Fulfillment: orders, escrow, chat (Both)
22. As a buyer, I want an Orders page listing my active and past orders with status, so that I can track everything in one place.
23. As a seller, I want an Orders page of work I've won with status controls, so that I can manage delivery.
24. As a user, I want a visual escrow stepper (Funds Held → In Progress → Delivered → Released), so that I always know the state of the deal.
25. As a seller, I want to mark an order delivered, so that the buyer is prompted to review and release funds.
26. As a buyer, I want to approve delivery to release escrow to the seller, so that I stay in control until the work is done.
27. As a user, I want an in-order chat thread scoped to a task/order, so that buyer and seller can coordinate without leaving the platform.
28. As a user, I want toast notifications on key events (offer received, offer accepted, delivered, paid), so that the app feels alive and responsive.

### Trust, reputation & profiles (Both)
29. As a buyer, I want to leave a 1–5 star review with a comment after completion, so that I help the community and reward good sellers.
30. As a seller, I want to review the buyer, so that reputation is two-directional.
31. As a user, I want public profile pages showing rating, completed work, and reviews, so that I can vet anyone before transacting.
32. As a user, I want verification/level badges (e.g., New → Level 1 → Level 2 → Top Rated), so that trust signals are visible everywhere.

### Seller analytics (Seller)
33. As a seller, I want a dashboard with earnings, active orders, conversion, and a rating/revenue trend chart, so that I can understand and grow my business.

### Platform / cross-cutting
34. As any visitor, I want a one-click persona switcher (Guest / Buyer / Seller), so that I can experience both sides of the marketplace without signing up.
35. As a user, I want the entire app to feel on-brand with Whop (dark UI, orange accent, Geist, pill buttons), so that it's credible as a Whop product.
36. As a user, I want smooth micro-interactions and transitions, so that the product feels polished and premium.

---

## Implementation Decisions

### Stack
- **Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui** (Whop's actual stack family). Brand match via shadcn's CSS-variable theme — we override the theme **index** (`app/globals.css` `:root`/`.dark` tokens) to Whop's palette so all components inherit it.
- **State/data:** in-memory **seed data** + **Zustand** store (no database). Synchronous reads = no spinners, instant "it works" feel, zero setup risk. Mutations (post task, submit offer, accept, deliver, release, review, message) update the store and fire `sonner` toasts.
- **Auth:** mocked **persona switcher** (Guest/Buyer/Seller) in Zustand — demoable and risk-free. Production note: would be NextAuth/Clerk + middleware.
- **Polish libs:** framer-motion (transitions), recharts (dashboard), lucide-react (icons), sonner (toasts).

### Brand tokens (from Whop's live CSS)
- Accent `#FA4616` (hover `#EB3600`); secondary "lemon" `#DBF505`.
- Surfaces: bg `#111111`, panel `#191919`, hover `#222222`, border `#3A3A3A`/`#484848`.
- Text: primary `#EEEEEE`, muted `#B4B4B4`. Font: Geist. Pill buttons; card radius 8–12px.

### Core domain model (≈8 entities)
- **User** — id, name, avatar, bio, role-capabilities (buyer & seller), isVerified, sellerLevel, ratingAvg, ratingCount, skills[], categories[].
- **Category** — id, name, slug, icon. Seeded: Community Setup, Course Creation, Trading Bots, Growth & Marketing, AI Agents, Brand/Design, Video Editing (+others).
- **Service (gig)** — id, sellerId, categoryId, title, description, images[], packages {basic, standard, premium} (price, deliveryDays, features[]), ratingAvg, ratingCount.
- **Task (request)** — id, buyerId, categoryId, title, description, budgetMin, budgetMax, status (open | assigned | in_progress | completed | cancelled), skills[], createdAt.
- **Offer (bid)** — id, taskId, sellerId, price, deliveryDays, message, matchScore, status (pending | accepted | declined | withdrawn).
- **Order** — id, buyerId, sellerId, source (offer | gig), refId (offerId/serviceId), title, amount, platformFee, status (held | in_progress | delivered | released | cancelled), createdAt.
- **Review** — id, orderId, raterId, rateeId, rating (1–5), comment, direction (of_seller | of_buyer).
- **Message** — id, orderId, senderId, body, createdAt.

**Relationships:** User 1—N Task; Task 1—N Offer; User(seller) 1—N Offer; Task 1—1 Order (via accepted offer); Service 1—N Order (direct buy); Order 1—N Review (one each direction); Order 1—N Message; Category 1—N Task/Service.

### Modules (deep modules with testable interfaces)
1. **`match` engine** (`lib/match.ts`) — *deep module, prime test target.* Pure function: `scoreMatch(task, seller|service) → { score: 0–100, reasons: string[] }`. Deterministic, weighted blend of category match, skill overlap, budget fit, rating, recency/availability. No React, no I/O → trivially unit-testable. Also exposes `rankSellersForTask(task, sellers)`.
2. **`store`** (`lib/store.ts`) — Zustand store holding all entities + persona, plus action creators (`postTask`, `submitOffer`, `acceptOffer`, `buyGig`, `markDelivered`, `releaseEscrow`, `addReview`, `sendMessage`, `setPersona`). Order/escrow transitions encapsulated here as a small state machine.
3. **`seed`** (`lib/data/seed.ts`) — typed, realistic Whop-flavored seed data (users, categories, services, tasks, offers, a couple of in-flight orders, reviews).
4. **`format` utils** (`lib/format.ts`) — currency, relative time, level → badge mapping. Pure, testable.
5. **UI primitives** (`components/ui/*`) — shadcn components, Whop-themed.
6. **Composite components** — Header+PersonaSwitcher, GigCard, TaskCard, OfferCard, MatchBadge, EscrowStepper, StarRating, ChatThread, CategoryPills, SearchBar.
7. **Routes** (`app/*`) — `/` (home/browse), `/gig/[id]`, `/tasks`, `/task/[id]`, `/post`, `/orders`, `/dashboard`, `/profile/[id]`.

### Escrow state machine (encoded decision)
`held → in_progress → delivered → released` (forward only for V1), with `cancelled` reachable from `held`/`in_progress`. `markDelivered` (seller) does `in_progress → delivered`; `releaseEscrow` (buyer) does `delivered → released` and credits seller balance + unlocks review. Accepting an offer / buying a gig creates the order at `held` then auto-advances to `in_progress`.

### Match score (encoded decision)
`score = round( 100 * (0.35·categoryMatch + 0.25·skillOverlap + 0.20·budgetFit + 0.15·ratingNorm + 0.05·recency) )`, clamped 60–99 for demo readability, with human-readable `reasons` derived from the top contributing factors.

---

## Testing Decisions

Good tests here exercise **external behavior of the deep, pure modules**, not React internals or implementation details. We avoid snapshot/DOM tests for V1 (low value under time pressure) and concentrate on logic that would actually break silently.

- **`match` engine — primary test target.** Assert: same-category + skill overlap scores higher than unrelated; budget within range beats budget far outside; higher-rated seller ranks above lower-rated when else equal; output always clamped to [60, 99]; `reasons` are non-empty and reference real contributing factors; `rankSellersForTask` returns a stable, descending-by-score ordering.
- **`store` order/escrow state machine.** Assert: `acceptOffer` creates exactly one order in `held`→`in_progress`, marks the task `assigned`, and declines sibling offers; `markDelivered` only advances from `in_progress`; `releaseEscrow` only from `delivered`, credits seller balance, and unlocks review; illegal transitions are no-ops.
- **`format` utils.** Currency and relative-time formatting edge cases; level→badge mapping boundaries.

Prior art: none in this fresh repo — these establish the testing pattern (pure-function unit tests, no DOM). Runner: V1 may ship without a wired test runner if time-constrained; the modules are authored to be test-ready (pure, dependency-free) so tests can be added with Vitest at any point.

---

## Out of Scope (V1)

- Real authentication, accounts, or sessions (persona switcher mocks this).
- Real payments / a real escrow ledger (escrow is a simulated state machine + balance).
- A real database or persistence across reloads (in-memory seed; refresh resets).
- A real LLM call for matching (V1 uses the deterministic `match` engine; a Claude-backed path is a documented future toggle).
- Disputes/refunds, withdrawals/payouts, messaging outside an order, file delivery/attachments.
- Affiliate program, multi-currency, taxes, admin/moderation tooling.
- Mobile-native app (responsive web only), email/push notifications (in-app toasts only).
- Full accessibility/i18n audit and automated e2e tests.

---

## Further Notes

- **Demo script (both sides in <2 min):** Guest browses gigs → switch to **Buyer**, post a task → see AI-matched sellers with % badges → switch to **Seller**, submit an offer on that task → back to **Buyer**, accept the offer → watch escrow advance, chat, mark delivered (Seller) → release + review (Buyer) → **Seller** dashboard shows the earnings tick up.
- **Brand-match is a feature, not a detail** — the interview is *for Whop*, so pixel-closeness to their dark/orange system is part of the bar.
- **Build order favors always-demoable increments:** theme → data layer → header/persona → browse → task+offers (the wow) → orders/escrow/chat → dashboard/profiles → polish. If time runs out, the loop is already shippable after the orders/escrow step.
- **Future-ready seams:** `match` engine interface is shaped so a Claude API ranker can drop in behind it; store actions are isolated so a real API/DB layer can replace them without touching components.
