# KadanBook brand assets

The KadanBook brand mark is the **shopkeeper's tally** — four vertical strokes
plus a diagonal slash (the universal Indian glyph for "5", used by every
kirana / chai-shop owner to mark debts in a ledger). Rendered in white on a
warm orange gradient (`#FF6B00 → #FF8C38`) matching the AMOLED brand palette
in `src/theme/palettes/amoled.ts`.

Why the tally: it says *what the product does* in one glyph — "I keep track of
your kadan" — and it's culturally rooted without being language-specific
(works for Tamil, Hindi, English speakers alike). It also sidesteps the
generic K-in-a-square fintech-starter look (Klarna, Kuda, Kraken, Klook).

## In-app (already wired)

- `src/components/brand/LogoMark.tsx` — vector square mark, theme-aware
- `src/components/brand/LogoWordmark.tsx` — horizontal/stacked lockup with optional Tamil tagline

Use these inside the app — they render via `react-native-svg` and scale crisply
at any size. The native splash + cold-start icon still need PNGs (below).

## Source SVGs (commit these)

| File | Purpose | Canvas |
| --- | --- | --- |
| `icon.svg` | iOS / store app icon | 1024 × 1024 |
| `adaptive-icon.svg` | Android adaptive foreground (background `#000000` from `app.json`) | 1024 × 1024 |
| `splash-icon.svg` | Native cold-start splash icon (background `#000000`) | 400 × 400 |
| `favicon.svg` | Web favicon | 100 × 100 |

## Exporting to PNG

Expo / Android / iOS still require raster PNGs. Pick any of these — outputs go
next to the SVGs.

**Option A — Inkscape (free, scriptable):**

```sh
inkscape assets/icon.svg          --export-type=png --export-filename=assets/icon.png          -w 1024 -h 1024
inkscape assets/adaptive-icon.svg --export-type=png --export-filename=assets/adaptive-icon.png -w 1024 -h 1024
inkscape assets/splash-icon.svg   --export-type=png --export-filename=assets/splash-icon.png   -w 400  -h 400
inkscape assets/favicon.svg       --export-type=png --export-filename=assets/favicon.png       -w 48   -h 48
```

**Option B — `sharp` (Node, no system deps):**

```sh
npx sharp-cli -i assets/icon.svg          -o assets/icon.png          resize 1024 1024
npx sharp-cli -i assets/adaptive-icon.svg -o assets/adaptive-icon.png resize 1024 1024
npx sharp-cli -i assets/splash-icon.svg   -o assets/splash-icon.png   resize 400  400
npx sharp-cli -i assets/favicon.svg       -o assets/favicon.png       resize 48   48
```

**Option C — Figma / Affinity:** open the SVG, export at the exact pixel dim.

Then reference the PNGs in `app.json` (`icon`, `android.adaptiveIcon.foregroundImage`,
the `expo-splash-screen` plugin's `image`, and `web.favicon`).

## Lottie animations (placeholders — drop in when designed)

Referenced in code under `assets/lottie/`:

- `onboarding-1.json` — Notebook → digital ledger morph
- `onboarding-2.json` — WhatsApp bubble with reminder
- `onboarding-3.json` — Cash + UPI converging
- `success-check.json` — Green check burst (post-payment)
- `confetti.json` — Confetti particles (kadan cleared)
- `empty-customers.json` — Empty state illustration

Source from LottieFiles or commission a designer using the same brand palette.
