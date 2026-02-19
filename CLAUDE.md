# ScoutAgent

Venture intelligence platform that scans thousands of conversations across Twitter/X, GitHub, HN, and Reddit to detect demand spikes, market gaps, and emerging opportunities — then delivers actionable business briefs ("Alpha Cards") before markets get crowded.

## Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm test             # Run unit tests (Vitest)
pnpm test:watch       # Run tests in watch mode
pnpm typecheck        # TypeScript type checking (tsc --noEmit)
pnpm test:e2e         # Playwright end-to-end tests
npx tsx scripts/setup-appwrite.ts  # Provision Appwrite collections
```

When done making changes, run `pnpm typecheck` and `pnpm test` to verify.
Prefer running a single test file (`pnpm vitest run path/to/file.test.ts`) over the full suite.

## Architecture

Three-layer refinery pipeline that persists after each layer (partial success model):

- **L1 Scrubber** (Claude Haiku) -- Noise filter + entity/friction extraction. Batches of 25 signals, concurrency 5.
- **L2 Delta Engine** -- Deviation-based anomaly detection against 7-day rolling baselines, friction clustering, signal scoring. No LLM call.
- **L3 Strategist** (Claude Sonnet) -- Synthesizes signals into Alpha Cards. Concurrency 3 via `p-limit`.

Pipeline uses an existence-based lock (Appwrite document create = lock, delete = unlock, 409 = already locked).

### Key directories

- `schemas/` -- Zod schemas are the single source of truth for all data shapes
- `types/index.ts` -- Re-exports `z.infer<>` types from schemas. Import types from `@/types`, not from schema files.
- `lib/refinery/` -- Pipeline layers (scrubber, pattern-matcher, strategist, baselines, freshness, gate)
- `lib/appwrite/` -- Admin client, session client, auth server actions, helpers
- `lib/stripe/` -- Stripe client + subscription helpers
- `components/ui/` -- Design system primitives (Button, Card, Badge, Input)

## Voice & Messaging

The full product marketing context lives in `.claude/product-marketing-context.md`. These are the hard rules:

**Audience:** Solo founders, indie hackers, and AI-native builders who ship products. NOT "developers" as primary framing. These people don't define themselves as coders — they're opportunity-seekers who happen to use AI to build.

**Core JTBD:** "Tell me what to build next." Not "track developer trends."

**Tone:** Sharp, direct, slightly irreverent. Like a smart friend who found a goldmine. Evidence-obsessed, no-bullshit. Confident but not arrogant.

**Words to use:** opportunity, build, ship, demand, signals, evidence, blueprint, founders, builders
**Words to avoid:** developer (as primary framing), code, technical, traction (developer-sense), pipeline, entities, anomalies, baselines

**Key framings:**
- Alpha Card = business opportunity brief (not tech trend report)
- "Market signals" not "developer signals"
- "Opportunity briefs" not "intelligence briefs"
- "Demand spikes" / "frustration clusters" not "GitHub stars" / "forks"
- "Know what to build" not "track what developers ship"
- 72-hour detection window is a core proof point — always keep it

**Anti-persona:** People who code for fun (not to ship products). Enterprise teams with market research departments. Anyone looking for technical trend reports rather than business opportunities.

## Code style

- File names: `kebab-case.ts`. Components: `PascalCase`. Functions/variables: `camelCase`.
- Imports use `@/` path alias exclusively (maps to project root).
- Use `import type` for type-only imports.
- Server components by default. Add `"use client"` only when needed.
- Named exports for everything except page components (default export).
- Always use design tokens from `globals.css` -- never hardcode hex colors.
- Use `cn()` from `@/lib/utils` for Tailwind class merging.
- Animation presets from `lib/motion.ts` -- never inline raw Framer Motion objects.
- Icons from `lucide-react` only.
- Reference `DESIGN_SYSTEM.md` for color palette, typography, spacing, and component patterns.

## Appwrite patterns

Auth is server actions only (no browser SDK). Cookie-based sessions via `scout_session`.

- `createAdminClient()` for server-side operations. `createSessionClient()` for user-scoped reads.
- `getLoggedInUser()` for auth checks. `getUserTier()` for tier checks.
- JSON columns stored as JSON strings -- always use `toJsonString()` / `fromJsonString()` from `@/lib/appwrite/helpers`.
- No upsert -- use try-update, catch 404, then create (or `listDocuments` + branch).
- Duplicate unique index returns error code 409 (not Postgres 23505).
- Required attributes CANNOT have default values in Appwrite -- use `required: false` with defaults.
- Attribute size: VARCHAR (`size <= 16381`) costs `size * 4` bytes against the 65535-byte row limit. Use `size > 16381` for large text fields (costs only 12 bytes as TEXT).
- Pagination: max 5000 per page. Use `Query.cursorAfter()` for full scans.

## Tier gating

`gateAlphaCard()` in `lib/refinery/gate.ts` -- server-side field nullification for free users. Used in both API routes and server components. Free tier sees: title, category, entities, signal_strength, direction, signal_count, thesis, and truncated evidence (2 items max). Pro fields are nullified, not omitted.

Client-side: `BlurGate` wraps pro content, `InlineUpgradeHint` shows upgrade CTA.

## Testing

Unit tests are co-located with source files (`*.test.ts` next to `*.ts`). E2E tests in `e2e/`.

- Anthropic SDK mocked via `vi.mock("@anthropic-ai/sdk")`.
- Appwrite mocked with inline factories (`createAdminClient` returning mock databases).
- Use `vi.resetModules()` in `beforeEach` for dynamic import mocking patterns.
- Fixture data lives in `__fixtures__/`.

## Environment

Copy `.env.example` to `.env.local`. Required variables: Appwrite (endpoint, project, API key, database ID), Anthropic API key, Stripe keys + webhook secret, HMAC secret (min 32 chars), pipeline bearer token.

## Things that will bite you

- **Anthropic client must be lazy-initialized** (not top-level `new Anthropic()`). Top-level instantiation crashes in the jsdom test environment. Same applies to Stripe and Appwrite admin clients.
- **Zod v4** is installed. API is largely compatible with v3 syntax for schemas used here, but check `zod` docs if adding new schema features.
- **Stripe SDK v20+**: `current_period_start`/`current_period_end` may not be direct properties on the Subscription type -- cast through `unknown` when accessing these.
- **Ingest webhook security**: HMAC-SHA256 + timestamp freshness (5 min) + nonce uniqueness. Nonces checked via Appwrite unique index (409 = replay attack). Rate limited to 60s between ingests per source feed.
- **Alpha Cards have a 72-hour TTL.** Freshness model: fresh (<12h) -> warm (12-48h) -> cold (48h-7d) -> archived (>7d). Cron cleanup handles expiry.
- **`node-appwrite` IndexType** is an enum, not a string literal -- import and use the enum directly.
- **Dark theme is always on** (`class="dark"` on `<html>`). Design tokens defined via CSS `@theme` in `globals.css`, not a Tailwind config file.
