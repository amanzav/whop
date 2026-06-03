---
name: nextjs16-conventions
description: Next.js 16 App Router conventions/gotchas for the Whop marketplace repo
metadata:
  type: project
---

Whop marketplace runs Next.js 16.2.7 + React 19.2.4, fully client-side in-memory app (Zustand store, localStorage persist, no backend). Conventions verified against `node_modules/next/dist/docs/`:

- All feature pages are Client Components (`'use client'`) because they read/mutate the Zustand store and use browser APIs.
- Dynamic route `params` is a `Promise`. In client components unwrap with `const { id } = use(params)` (`import { use } from 'react'`). `params: Promise<{ id: string }>`.
- `useRouter`, `usePathname`, `useSearchParams` import from `next/navigation`.
- Fonts via `next/font/google` (Geist) in `app/layout.tsx`.
- `unstable_instant` / Cache Components / `use cache` do NOT apply here — those are for server components doing async data fetching. The docs index/linking pages hint at it aggressively but it's irrelevant to this client-side architecture. Do not add it.
- Brand theming is CSS-variable-only in `app/globals.css` (`.dark` is the active mode); never inline hex values. shadcn components inherit automatically.
