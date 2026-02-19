# ScoutAgent Design System

Quick-reference for all UI decisions. Consult before writing any new UI code.

---

## Color Tokens

Defined in `app/globals.css` under `@theme`.

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0A0A0A` | Page background |
| `--color-surface` | `#111111` | Cards, panels, inputs |
| `--color-surface-elevated` | `#1A1A1A` | Hover states, nested surfaces |
| `--color-surface-glass` | `rgba(255,255,255,0.03)` | Frosted glass cards (alpha cards, preview) |
| `--color-border` | `#222222` | All borders |
| `--color-text` | `#E0E0E0` | Primary text |
| `--color-text-muted` | `#666666` | Secondary text, labels, captions |
| `--color-accent-green` | `#00FF88` | Primary accent, CTAs, success |
| `--color-accent-red` | `#FF3366` | Errors, danger, falling momentum |
| `--color-accent-amber` | `#FFB800` | Warnings, stable momentum |
| `--color-accent-blue` | `#00AAFF` | Info, links, momentum shift category |

---

## Typography

Fonts loaded via `next/font/google` in `app/layout.tsx`:
- **Sans:** Inter (`font-sans`)
- **Mono:** JetBrains Mono (`font-mono`)

| Role | Classes |
|---|---|
| Page title | `text-2xl font-bold` |
| Section heading | `text-lg font-semibold mb-3` |
| Card title | `text-lg font-semibold` |
| Body | `text-sm text-text-muted` |
| Caption | `text-xs text-text-muted` |
| Overline | `text-xs font-mono uppercase tracking-wider` |

---

## Spacing Rules

| Context | Value |
|---|---|
| Card padding (compact) | `p-4` — stat boxes, evidence items, inner cards |
| Card padding (default) | `p-5` — alpha cards, skeletons, general cards |
| Card padding (spacious) | `p-6` — settings sections, pricing, feature cards, auth forms |
| Section gap | `space-y-6` |
| Between cards | `gap-4` |
| Heading → content | `mb-3` |

---

## Opacity Scale

| Opacity | Usage |
|---|---|
| `/5` | Subtle background tint (e.g. `bg-accent-green/5`) |
| `/10` | Tint background (badge bg, status bg) |
| `/20` | Active/hover background |
| `/30` | Colored borders |
| `/40` | Muted colored borders, focus rings |
| `/60` | Muted text variants |
| `opacity-50` | Disabled state |

---

## Border Radius

| Token | Value | Class | Usage |
|---|---|---|---|
| `--radius-sm` | `6px` | `rounded-sm` | Badges (tag shape), small chips |
| `--radius-DEFAULT` | `8px` | `rounded` | Buttons, inputs, filter pills, toasts |
| `--radius-lg` | `12px` | `rounded-lg` | Cards, sections, modals |
| `--radius-full` | `9999px` | `rounded-full` | Avatars, pill badges, icon circles |

---

## Shadows

| Token | Class | Usage |
|---|---|---|
| `--shadow-subtle` | `shadow-subtle` | Subtle depth |
| `--shadow-elevated` | `shadow-elevated` | Toasts, dropdowns, popovers |
| `--shadow-glow` | `shadow-glow` | Highlighted pricing card |

---

## Z-Index Layers

| Token | Value | Class | Usage |
|---|---|---|---|
| `--z-index-sticky` | `30` | `z-sticky` | Sticky header |
| `--z-index-overlay` | `40` | `z-overlay` | Backdrop overlays |
| `--z-index-modal` | `50` | `z-modal` | Modals, drawers |
| `--z-index-toast` | `60` | `z-toast` | Toast notifications |

---

## Components

All UI primitives live in `components/ui/`.

### Button (`components/ui/button.tsx`)

```tsx
import { Button, ButtonLink } from "@/components/ui/button";

<Button variant="primary" size="md">Click</Button>
<ButtonLink href="/signup" variant="primary" size="lg">Sign Up</ButtonLink>
```

| Variant | Visual |
|---|---|
| `primary` | Green bg, dark text |
| `secondary` | Surface bg, border, hover elevated |
| `ghost` | No bg, muted text, hover text |

| Size | Padding |
|---|---|
| `sm` | `px-3 py-1.5 text-xs` |
| `md` | `px-6 py-2 text-sm` |
| `lg` | `px-8 py-3 text-lg` |

### Card (`components/ui/card.tsx`)

```tsx
import { Card } from "@/components/ui/card";

<Card variant="default" padding="default">Content</Card>
<Card variant="glass" padding="compact">Frosted content</Card>
```

| Variant | Visual |
|---|---|
| `default` | Surface bg, border |
| `glass` | Frosted glass bg, backdrop-blur, border |

| Padding | Value | Usage |
|---|---|---|
| `compact` | `p-4` | Stat boxes, evidence, inner cards |
| `default` | `p-5` | Alpha cards, skeletons |
| `spacious` | `p-6` | Settings, pricing, features, auth |

### Badge (`components/ui/badge.tsx`)

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success" shape="pill">Rising</Badge>
<Badge variant="default" shape="tag">drizzle-orm</Badge>
```

| Variant | Color |
|---|---|
| `default` | Muted (surface-elevated bg) |
| `success` | Green |
| `warning` | Amber |
| `danger` | Red |
| `info` | Blue |

| Shape | Radius |
|---|---|
| `pill` | `rounded-full` |
| `tag` | `rounded-sm` |

### Input (`components/ui/input.tsx`)

```tsx
import { Input } from "@/components/ui/input";

<Input placeholder="Search..." />
<Input icon={<Search className="size-4" />} placeholder="Search..." />
```

---

## Animation

Import presets from `lib/motion.ts`. Never write raw `{ opacity: 0, y: 20 }` objects.

```tsx
import { fadeInUp, staggerContainer, staggerItem, viewportFadeIn, DURATION, EASE } from "@/lib/motion";

// Enter animation
<motion.div {...fadeInUp}>

// Staggered list
<motion.div variants={staggerContainer} initial="hidden" animate="show">
  <motion.div variants={staggerItem}>Item</motion.div>
</motion.div>

// Scroll-triggered
<motion.div {...viewportFadeIn(0.1)}>

// Custom with tokens
transition={{ duration: DURATION.normal, ease: EASE.out }}
```

| Preset | Usage |
|---|---|
| `fadeInUp` | Single element enter |
| `staggerContainer` + `staggerItem` | Lists, hero sections |
| `viewportFadeIn(delay?)` | Scroll-triggered sections |

| Duration | Value | Usage |
|---|---|---|
| `fast` | 0.15s | Micro-interactions, hover |
| `normal` | 0.2s | Default transitions |
| `slow` | 0.4s | Page-level animations |

---

## Focus States

All interactive elements should use `focus-visible:focus-ring` (defined as `@utility` in globals.css) which renders a 2px green outline with 2px offset.

---

## Adding New Components

1. Check this doc first — the token/pattern you need likely exists
2. Use `components/ui/` primitives (Button, Card, Badge, Input)
3. Use tokens from `@theme` — never hardcode colors, radius, or shadows
4. Use animation presets from `lib/motion.ts` — never write raw motion objects
5. Use semantic z-index classes (`z-sticky`, `z-overlay`, `z-modal`, `z-toast`)
