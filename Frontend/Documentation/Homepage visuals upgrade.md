# Homepage visuals upgrade – Brew Buddy Dashboard

This document refines the Home page visuals while staying fully consistent with:

- `Frontend/Documentation/Codex briefing.md`
- `Frontend/Documentation/Branding guidelines/Style guide.md`

All changes keep the existing **warm, friendly, premium** feel, reuse the defined **tokens and components** (Card, Button, AlertBanner, StockColumn), and do not introduce new colours, fonts, or layout systems beyond what those documents specify.

---

## 1. Goals

- Reduce clutter and redundant text so the Home page is calm and scannable.
- Make the dashboard feel more like a polished product and less like a prototype.
- Preserve the warm, social, premium personality from the Style guide.
- Keep the overall layout structure from the Codex brief (Welcome → Alerts → Stock Overview) but refine what appears in each block.

---

## 2. Guardrails from Codex brief & Style guide

These constraints must not be violated:

- **Layout**
  - Keep the macro layout from the brief:
    - Top: full-width **Welcome card**.
    - Middle: **Alerts section** with stacked `AlertBanner`s inside Cards.
    - Bottom: **Stock Overview** with multiple `StockColumn` components in a clean grid.
  - Use the spacing rules from the Style guide:
    - 32px (`--space-6`) between major sections.
    - 16px (`--space-4`) between cards within a section.
    - 8–12px (`--space-2`/`--space-3`) between text elements inside a Card.

- **Visual language**
  - Use the existing **colour tokens** only (`--color-amber-ale`, `--color-bottle-green`, `--color-bg-main`, `--color-bg-card`, `--color-border-subtle`, etc.).
  - Use **Karla** with the defined type scale; no new fonts.
  - Use existing components and patterns: `Button`, `Card`, `AlertBanner`, `StockColumn`, sidebar navigation.
  - Maintain rounded shapes, soft shadows, and warm off-white backgrounds.

- **Stock visualisation**
  - Keep the `StockColumn` concept as described:
    - Card with title, subtitle, and a **tall vertical bar** (~180–220px height, ~32–40px width).
    - Track: light neutral background, pill radius.
    - Fill: vertical bar rising from bottom, using a brand accent colour and rounded top.
  - We will refine its details and behaviour but not change it to a completely different chart type.

---

## 3. Mandatory content & copy changes

These are product decisions and **must** be implemented:

1. **Remove homepage buttons**
   - Remove `Log new round` from the Home page.
   - Remove `View activity` from the Home page.
   - If these actions are still needed, surface them via:
     - Navigation (e.g. separate `History`/`Activity` page), or
     - Smaller, secondary links within relevant tiles (see Section 6).

2. **Remove top “category labels” from tiles**
   - For all tiles/cards, remove the extra line above the main title (e.g. `Safety & updates`, `Household flow`).
   - Each tile should have:
     - **Title** (single, clear line, H2/H3 style).
     - Optional **short description** directly under the title (1 sentence max).
     - **Content** (meters, lists, alerts, numbers).

3. **Remove marketing tagline from the Home page**
   - Remove: `Brew buddy, shared fridge home base`.
   - The Home page should feel like an **operational dashboard**, not a marketing landing page.
   - The welcome card can still greet the user, but copy should be concise and functional (see Section 5.1).

4. **Clean up duplicate stock labels**
   - On stock tiles/meters, remove duplicate labels such as `45% full` when `45% stocked` is already shown.
   - Keep one consistent phrasing, e.g. `45% stocked`.

---

## 4. Layout and hierarchy refinement

### 4.1 Overall structure (keeps the Codex brief)

Home page vertical structure:

1. **Welcome card** (full-width `Card`)
2. **Alerts section** (stack of `AlertBanner`s inside one or more Cards)
3. **Stock Overview** (`StockColumn` grid in one or more Cards)

We keep this structure but refine what goes **inside** each section:

- **Primary vs secondary information**
  - The most critical “at-a-glance” statuses (overall stock, active alerts) should be readable within **1–2 seconds** at the top and middle.
  - Behavioural details (rounds history, deeper analytics) should move to dedicated pages or appear as **small secondary links**.

### 4.2 Tile/card grid

- Use a **consistent grid** for cards within each section:
  - Align card widths where possible.
  - Keep equal gaps vertically and horizontally using the spacing tokens.
- Group related information into a single card rather than many small ones, to reduce fragmentation:
  - Example: Instead of separate tiny cards for “Critical alerts”, “Warnings”, and “Info”, use one **Alerts card** that contains an ordered list of `AlertBanner`s.

---

## 5. Hero / Welcome card

### 5.1 Content

Replace marketing-style copy with concise operational content:

- Title example:
  - `Fridge overview`
  - or `Hi, Sam – here’s your fridge`
- Subtitle (optional, one line, lighter colour):
  - `All good. You’re well stocked for tonight.`
  - or `Time to restock 2 compartments soon.`
- Optional small, friendly metric or badge:
  - `Overall: 78% stocked`
  - `No alerts right now`

Avoid slogans and explanations of what Brew Buddy is; users already know this by the time they’re on the dashboard.

### 5.2 Visual design

- Use the **Card** component:
  - `--color-bg-card` background.
  - `--radius-lg` corner radius.
  - `--shadow-soft` for depth.
- Inside the card:
  - Left: title + subtitle + 1–2 key metrics.
  - Right: small decorative illustration or icon cluster that matches the Style guide (simple shapes, warm palette).
  - Limit icons to the existing Bottle Green / Amber Ale accents; no new colour families.

---

## 6. Alerts section upgrades

### 6.1 Structure

- Use one **Alerts card** under the welcome card:
  - Card title: `Alerts`.
  - Optional subtitle: `Things you should know about your fridge.` (can be shortened further if needed).
  - Inside: a vertical stack of `AlertBanner` components.

### 6.2 AlertBanner usage

- Stick to the Style guide variants:
  - `severity="critical"` → strong icon, red semantic cues (based on existing tokens).
  - `severity="warning"` → Amber-themed backgrounds/borders.
  - `severity="info"` → neutral card background with Bottle Green border or icon.
- Limit visible alerts to the **top 3–4**, ordered by severity and recency.
  - If there are more, show a small link at the bottom: `View all alerts`.
- When there are no alerts:
  - Show a friendly empty state:
    - Example: `No alerts right now. Enjoy your evening 🍺` (emoji optional, controlled by product decision).

This keeps the section visually clean and aligned with defined components.

---

## 7. Stock Overview – visual and behavioural changes

The Stock Overview remains a grid of `StockColumn` components inside one or more Cards, but with these refinements:

### 7.1 Shape and meter behaviour

- **Track** (outer bar):
  - Vertical rectangle with **rounded corners** (as in the Style guide).
  - Height: ~180–220px; width: ~32–40px (exact values from the Style guide).
  - Background colour:
    - Use a light neutral already in the palette (e.g. Toasted Brown-inspired neutral or `--color-bg-card` variant).
    - Do not introduce new greys outside the token system.

- **Fill** (inner bar):
  - Originates from the **bottom** of the track and scales to the correct percentage.
  - Uses a single accent colour per meter:
    - Default: a brand-accent token (e.g. `--color-amber-ale` or `--color-bottle-green`), chosen for contrast.
  - Ensure:
    - No visual gap at the bottom: the fill should sit flush with the base.
    - Rounded top corners to match the pill shape.

### 7.2 Labels and copy

- Above each meter:
  - Title: category/compartment name (e.g. `Bavaria`, `Specials`).
  - Optional subtitle in lighter text:
    - Example: `Target: 24 bottles`.
    - Or behavioural hint: `Fan favourite this week`.
- Below or inside the bar:
  - **Single percentage label** per compartment:
    - Example: `45% stocked`.
  - No duplicated wording (`45% full` is removed).

### 7.3 Grouping and ordering

- Group compartments logically:
  - Example groups:
    - `Core beers`
    - `Specials`
    - `Mixed drinks`
  - These groups can be represented as headings inside the Stock Overview card or as separate rows of cards.
- Order categories by **urgency** (lowest stock first) to draw the eye where action is needed.

---

## 8. Buttons and micro-interactions

### 8.1 Button presence on Home

- Remove the large primary `Log new round` and `View activity` buttons from the Home page.
- Replace them with:
  - Navigation items in the sidebar (e.g. `Rounds`, `History`).
  - Small **secondary** or **ghost** buttons inside relevant cards when necessary:
    - Example in the Stock Overview card footer: `View full inventory`.
    - Example in a separate analytics card: `Open history`.
- All buttons should follow the Style guide:
  - Primary: `--color-amber-ale` background, white text, pill shape, hover state.
  - Secondary/Ghost: transparent background, subtle border (`--color-border-subtle`), hover tint.

### 8.2 Hover and focus states

- Apply subtle, consistent hover behaviour:
  - Cards: slightly stronger `--shadow-soft` and/or tiny background tint.
  - Buttons: darker Amber Ale on hover, no harsh transitions.
- Ensure visible keyboard focus for accessibility, using an outline or underline that matches the existing palette.

---

## 9. Colour and typography refinement (within the Style guide)

### 9.1 Palette discipline

- Use the existing palette in a more restrained way:
  - Backgrounds:
    - `--color-bg-main` for page background.
    - `--color-bg-card` for all cards.
  - Accents:
    - `--color-amber-ale` and `--color-bottle-green` for primary metrics and important highlights.
  - Borders:
    - `--color-border-subtle` for card outlines/dividers.
- Avoid using many different accent colours on one screen. A compartment’s bar colour can vary by status (OK vs low) but should still come from the defined semantic palette.

### 9.2 Typography usage

- Stick to the type scale from the Style guide:
  - Page title (Welcome card): H1 or H2.
  - Card titles: H2/H3.
  - Descriptions: regular body text.
  - Small labels and captions: use the designated caption style.
- Limit heavy fonts:
  - Use **Karla 500/600** for titles and important labels.
  - Use **regular weight** for body copy to avoid visual heaviness.

---

## 10. Empty, loading, and edge states

- **Stock Overview empty state**:
  - If there is no stock data yet, show:
    - A simple illustration (optional), title (`No stock data yet`), and a one-line explanation.
  - Provide a small call-to-action: `Check sensor setup` or `View configuration` (link to configuration page).

- **Alerts empty state**:
  - `No alerts right now. Enjoy your evening.` with a calm icon.

- **Loading states**:
  - Use skeletons or soft placeholders that respect the card layout:
    - Skeleton bars where StockColumn meters will appear.
    - Grey lines where alert text will appear.

These states should use the existing neutral palette and avoid introducing harsh colours.

---

## 11. Implementation phases (for Codex)

To keep the changes controlled and consistent with existing code, implement in stages:

1. **Phase 1 – Content cleanup**
   - Remove:
     - `Log new round` and `View activity` buttons from the Home page.
     - All top-of-card category labels (e.g. `Safety & updates`, `Household flow`).
     - The tagline `Brew buddy, shared fridge home base`.
     - Duplicate stock labels (`45% full` when `45% stocked` already exists).
   - Adjust card titles and descriptions to be single, clear lines.

2. **Phase 2 – Layout & spacing alignment**
   - Ensure:
     - Welcome card → Alerts card(s) → Stock Overview card(s) vertical order.
     - 32px between these main sections, 16px between cards in a section.
     - Inside each card, apply consistent spacing between title, description, and content.

3. **Phase 3 – StockColumn visual fix**
   - Update the StockColumn implementation to:
     - Use the vertical pill bar defined in the Style guide.
     - Remove gaps at the bottom and fix fill behaviour.
     - Show only one percentage label (`X% stocked`).
   - Confirm the bar’s height and width match the design tokens.

4. **Phase 4 – Colour and typography polish**
   - Audit the Home page to ensure:
     - All colours are from the theme tokens.
     - Headings, body text, and captions use the defined type scale and weights.
   - Remove any ad-hoc colours or font sizes that drift from the Style guide.

5. **Phase 5 – Interaction & state polish**
   - Add consistent hover and focus states to:
     - Cards in the main content area.
     - Buttons and any interactive tags/links.
   - Implement refined empty and loading states for Alerts and Stock Overview.

6. **Phase 6 – Final consistency pass**
   - Check:
     - Alignment of cards and StockColumns on common baselines.
     - Consistent border-radius across cards, meters, and other components.
     - Icon style and size alignment with the Style guide.
   - Tweak microcopy to keep tone friendly, clear, and concise.

This plan stays within the constraints of the Codex brief and Style guide while significantly cleaning up the Home page, reducing clutter, and making the visuals feel deliberate, cohesive, and product-ready.

---

## 12. Icon library integration (project-wide)

To make icons feel consistent and “finished” across the project while respecting the Style guide (“simple line icons with rounded corners” using Toasted Brown / Bottle Green / Amber Ale), we will:

### 12.1 Library choice

- Use **Lucide React** as the base icon library:
  - It provides clean, 2D **line-art** icons.
  - Icons are easily styled via `stroke`, `strokeWidth`, and `className`.
  - The set covers our needs: beer, fridge, users/housemates, costs, stats, alert, success, stock, etc.
- Installation (for later implementation):
  - `npm install lucide-react`
  - Do this in the `web/beerbuddy-react` project when you are ready to wire icons into components.

This is an explicit, small extension to the stack and is allowed by the Codex brief because it is requested and does not change core technologies (React + TS + Vite + CSS).

### 12.2 `UiIcon` wrapper component

Create a reusable wrapper component `UiIcon` in `src/components/ui/Icon.tsx`:

- Responsibilities:
  - Map **semantic icon names** to Lucide icons (e.g. `beer`, `fridge`, `housemates`, `costs`, `stats`, `alert`, `success`, `stock`).
  - Apply **default sizing** and colour from the theme tokens.
  - Provide variants for standard vs active/highlighted states.

- Example props:
  - `name`: `"beer" | "fridge" | "housemates" | "costs" | "stats" | "alert" | "success" | "stock" | ...`
  - `size?: number` (defaults to 20–24px).
  - `variant?: "default" | "active" | "subtle"`.
  - `className?: string`.

- Colour mapping (using existing tokens):
  - Default / standard icons:
    - `stroke: var(--color-toasted-brown)` or equivalent token (the Toasted Brown hex from the Style guide).
    - Alternative default: `var(--color-bottle-green)` where appropriate.
  - Active or highlighted icons:
    - `stroke: var(--color-amber-ale)` for “selected” or “primary action” states.
  - Background tile behind icons:
    - Use a soft neutral from the palette (e.g. a light variant of `--color-bg-card`) with rounded corners to mimic the Style guide example tiles.

### 12.3 Semantic icon mapping (examples)

- `beer` → Lucide `Beer` icon.
- `fridge` → Lucide `Refrigerator` or closest equivalent; if not available, a simple rounded `Square` with a line to suggest a door.
- `housemates` → `Users` icon.
- `costs` → `DollarSign` (or `Euro` once available); label still “Costs” in UI.
- `stats` → `TrendingUp`.
- `alert` → `AlertCircle`.
- `success` → `CheckCircle2`.
- `stock` → `Cube` or `Boxes`.

If future pages need more icons (e.g. settings, support, history), extend the `name` union and mapping in `UiIcon` rather than importing Lucide icons ad hoc throughout the codebase.

### 12.4 Usage guidelines on the Home page

- **Sidebar navigation**
  - Use `UiIcon` before each nav label.
  - Default state: Toasted Brown or Bottle Green stroke on a subtle neutral background tile.
  - Active nav item:
    - Apply the existing active background pill (from the Style guide).
    - Switch icon variant to `active` (Amber Ale stroke) for a subtle highlight.

- **Welcome card**
  - Optional small illustration cluster using 1–3 icons (e.g. beer + users) inside a rounded neutral background tile.
  - Keep them small and unobtrusive to avoid clutter.

- **Alerts**
  - Use `UiIcon` with `alert` or severity-specific icons at the start of `AlertBanner`.
  - Use default (Toasted Brown/Bottle Green) stroke for info; use Amber Ale or red semantic colour (if defined) for stronger alerts.

- **Stock Overview**
  - Place a small `stock` or drink-specific icon near each compartment title (optional).
  - Ensure icons do not compete with the StockColumn meter; treat them as subtle labels.

### 12.5 Consistency and constraints

- All icons:
  - Remain **outline/line-art** only; no filled shapes or 3D skeuomorphism.
  - Use the same stroke width (e.g. `1.5` or `2`) for consistency.
  - Use rounded line caps/joins where possible to match the “rounded corners” requirement.
- Keep the icon palette limited to the existing colours:
  - Toasted Brown, Bottle Green, Amber Ale, and neutrals derived from the existing theme.
  - Do not invent new colour hex codes; always route through CSS variables declared in the theme.

This icon plan makes the project feel more cohesive and “complete”, while staying fully aligned with the existing Style guide and giving Codex a single, reusable way to add icons to any current or future page.

---

## 13. Visual direction derived from the marketing illustrations

Use the two provided hero illustrations as the qualitative north star for Beer Buddy. They communicate an analog, celebratory kitchen vibe that is warmer and more tactile than our current dashboard. The intent is not to recreate the illustrations verbatim in React, but to capture their **mood**, **palette discipline**, and **shape language**.

### 13.1 Mood cues to replicate

- **Shared ritual energy** – the clinking glasses and communal fridge scene both feel like the calm moment right before friends arrive. The dashboard should echo that anticipation: calm surfaces with a single, confident highlight per block.
- **Soft craft sensibility** – nothing is harshly geometric. Corners are rounded, highlights are matte instead of glossy, and shadows are diffuse. Maintain pill shapes, organic spacing, and gentle drop shadows around every key surface.
- **Sunlit warmth** – backgrounds fade from pale cream to honey around focal points. Mimic this using subtle radial gradients (e.g., `radial-gradient(circle, rgba(247,242,233,1) 40%, rgba(245,226,196,1) 100%)`) layered behind hero content or section dividers.
- **Minimal colour stack** – each illustration uses three dominant hues (cream, amber, bottle green) plus one deeper brown for depth. The homepage should follow the same rule: one background tint, one highlight accent, one dark anchor.

### 13.2 Palette translation (no new hex codes required)

| Illustration cue | Approx hex | Theme token(s) to apply | Usage on Home |
| --- | --- | --- | --- |
| Cream paper background | `#F7E9D2` → already close to `--color-bg-main` | `--color-bg-main`, `--color-bg-card` with 4–6% amber tint | Page background, card fills, alert empty states |
| Glowing amber beer | `#F0B04D` / `#D9852F` | `--color-amber-ale` for highlights, `--color-honey-top` for lighter foam edges | Primary metric badges, StockColumn fills, warning accents |
| Deep bottle enamel | `#0F3F31` | `--color-bottle-green` plus `opacity:0.9` overlays | Sidebar, major headings, CTA copy, dark illustrations |
| Toasted shadow/bottle details | `#8E5C2A` | `--color-toasted-brown`, `--color-text-muted` | Icon strokes, dividers, descriptive text |
| Foamy whites | `#FFF6E5` | Use `--color-bg-card` lightened via `color-mix(in srgb, var(--color-bg-card) 80%, white)` | Highlight capsules behind icons or key numbers |

> If a lighter/darker variant is needed, derive it via `color-mix` or opacity rather than inventing a new hex code.

### 13.3 Homepage component guidance

- **Welcome card**
  - Background: `--color-bg-card` with a faint radial gradient anchored behind the hero metrics (think of the halo behind the clinking mugs). Keep gradients subtle (opacity ≤ 0.35) so text contrast stays WCAG compliant.
  - Copy: two lines max. Pair a bottle-green heading with amber numeric badges (e.g., pill showing `78% stocked`).
  - Illustration: reuse `UiIcon` clusters or a simple SVG referencing mugs/fridge silhouettes. Tuck them to the right with reduced opacity to mimic the illustration’s depth.

- **Alerts card**
  - Structure: stack banners inside a single card framed by a slightly darker cream background (`color-mix(..., var(--color-bg-card), var(--color-amber-ale) 7%)`) to hint at the fridge-door panel from the second illustration.
  - Icons: for warnings, color the `UiIcon` stroke `--color-amber-ale`; for info, keep `--color-bottle-green`. Keep icon backgrounds pill-shaped to echo the rounded notification bubbles in the fridge artwork.

- **Stock Overview**
  - Layout: treat each `StockColumn` like the jars on the fridge shelf—consistent width, aligned baselines, gentle lighting. Use a shared “shelf” background strip (a thin `--color-border-subtle` line with `opacity:0.4`) to ground the columns.
  - Fill logic: 0–30% → `--color-toasted-brown` (matches the darker bottles), 31–70% → `--color-amber-ale`, 71–100% → `--color-honey-top` with a white highlight strip using `linear-gradient()` to mimic foam glare.
  - Labels: uppercase `Karla 600` titles above each column, single `X% stocked` label below in muted text, mirroring the minimal text in the fridge illustration.

### 13.4 Implementation checklist

- Add a `body::before` or page-level wrapper that renders a massive, low-opacity radial gradient to emulate the paper texture glow (clip it so it never overlaps the sidebar).
- Use consistent **dual-tone shading** on custom illustrations: one base fill (`--color-amber-ale`) plus a darker overlay (`color-mix` with `--color-dark-roast` at 18%) for depth—exactly like the two-tone beer mugs.
- Round every inline icon container to at least `--radius-md` and keep padding generous (`--space-3`) so they feel like the chat bubbles floating around the illustrated fridge.
- Maintain plenty of breathing room: minimum `--space-5` padding inside hero cards and `--space-4` inside alerts/stock lists, mirroring the wide negative space in both visuals.

Following these cues ensures the homepage inherits the same intimate, premium energy as the provided marketing assets without diverging from the established design system.
