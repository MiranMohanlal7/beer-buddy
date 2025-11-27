````markdown
# Brew Buddy – Branding Guidelines (Dev Version)

This document translates the Brew Buddy brand guidelines into a form you can use directly in code.

Use this file together with `src/styles/theme.css` as the **single source of truth** for visuals.  
Do not invent new colours, fonts, shadows, or ad-hoc styles unless explicitly instructed.

---

## 1. Brand overview

**Product**  
Brew Buddy is a shared smart fridge and dashboard for student houses and other shared homes.  
It tracks who drank what, keeps the fridge stocked, and helps split costs fairly.

**Audience**  
Students and young professionals (±18–35) living with roommates.

**Brand personality**  
Warm, social, relaxed, premium but playful.  
It should feel like a cosy student kitchen or craft beer bar, not a cold corporate IoT dashboard.

**Design goals**

- Warm and inviting, with soft backgrounds and rounded shapes.
- Data-driven but not “technical” in appearance.
- Clear hierarchy: headings and key numbers stand out; supporting text is calm and legible.
- Minimal but expressive: few colours, used consistently.

---

## 2. Colour system

### 2.1 Core palette (exact hex values)

These colours must be defined as CSS variables in `theme.css` and reused everywhere.

- **Foam Off-White** `#F7F2E9`  
  Main background, light surfaces.

- **Amber Ale** `#E39A41`  
  Primary buttons, key highlights, important accents.

- **Honey Top** `#F4C96A`  
  Secondary lighter accent, hover states.

- **Bottle Green** `#184734`  
  Logo, navigation background, strong headings, dark accents.

- **Toasted Brown** `#8A5A3C`  
  Icons, subtle dividers, supporting elements.

- **Dark Roast** `#241A16`  
  Primary body text, replacement for pure black.

### 2.2 Semantic tokens

In `theme.css`, map the core colours to semantic roles:

```css
:root {
  /* Brand colours */
  --color-foam-off-white: #F7F2E9;
  --color-amber-ale:      #E39A41;
  --color-honey-top:      #F4C96A;
  --color-bottle-green:   #184734;
  --color-toasted-brown:  #8A5A3C;
  --color-dark-roast:     #241A16;

  /* Semantic aliases */
  --color-bg-main: var(--color-foam-off-white);
  --color-bg-card: #F9F3EC;
  --color-text-main: var(--color-dark-roast);
  --color-text-muted: #5A4A3F;
  --color-accent-primary: var(--color-amber-ale);
  --color-accent-secondary: var(--color-honey-top);
  --color-nav-bg: var(--color-bottle-green);
  --color-border-subtle: #E0D2C3;
  --color-danger: #D9533F; /* warm warning colour */
}
````

**Rules**

* Use only these colours (directly or via semantic tokens) unless explicitly asked otherwise.
* For text, prefer `--color-text-main` and `--color-text-muted`; avoid pure white/black except on dark nav backgrounds.
* Background hierarchy:

  * Page background: `--color-bg-main`
  * Cards and panels: `--color-bg-card`
  * Nav/sidebar: `--color-nav-bg`

---

## 3. Typography

### 3.1 Font families

Define in `theme.css`:

```css
:root {
  --font-heading: "Rufina", serif;
  --font-body: "Karla", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

Global usage:

```css
body {
  font-family: var(--font-body);
  color: var(--color-text-main);
  background-color: var(--color-bg-main);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
}
```

### 3.2 Type scale (desktop baseline)

Use these sizes as a guideline; small variations are allowed but should be consistent.

* **H1** – Rufina Bold, 48px, line-height ~1.2
  Main page titles (e.g. “Welcome, User”).

* **H2** – Rufina Bold, 32–36px, line-height ~1.25
  Section headings (“Stock Overview”, “Alerts”).

* **H3** – Rufina Bold, 24px, line-height ~1.3
  Card titles and important labels.

* **Body** – Karla Regular, 16–18px, line-height ~1.5
  General descriptive text.

* **Caption / Meta** – Karla Regular, 14px, line-height ~1.4
  Supporting labels, timestamps, “Units info pending”.

**Rules**

* Headings use Rufina; everything else uses Karla.
* Do not mix other fonts.
* Use consistent sizes per role (don’t randomly pick 17px, 19px, etc.).

---

## 4. Spacing, radii, and shadows

These should also be defined as tokens in `theme.css`:

```css
:root {
  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.06);
}
```

**Usage**

* Page sections: use multiples of `--space-6` for vertical spacing between major blocks.
* Inside cards: `--space-4` or `--space-5` padding.
* Cards & major surfaces: `--radius-lg`, `--shadow-soft`.
* Inputs and small elements: `--radius-md`.

Avoid hard-coded spacing/radius values; always use these tokens.

---

## 5. Layout patterns

### 5.1 Global layout (AppLayout)

* Persistent left sidebar (Bottle Green background).
* Right side: main content column with max width around 1120px.
* Content column centered within the right area with horizontal padding (`--space-5`).

### 5.2 Vertical rhythm

Within the main content:

* 32px (`--space-6`) between major sections (Welcome, Alerts, Stock Overview, etc.).
* 16px (`--space-4`) between cards inside a section.
* 8–12px (`--space-2`/`--space-3`) between text elements inside a card.

### 5.3 Home page layout

* Top: full-width welcome card.
* Under that: alerts section with stacked alert banners.
* Bottom: Stock Overview with 3–4 “compartment” cards in a row on desktop.
* Cards should align in a neat grid; avoid irregular widths.

---

## 6. Core UI components

The goal is to express the Figma design as reusable components. Implement these in `src/components/ui/` and reuse them across pages.

### 6.1 Button

**Primary Button**

* Height: ~44px.
* Padding: `0` vertical, `20px` horizontal.
* Background: `--color-amber-ale`.
* Text: white.
* Font: Karla 500, 16px.
* Shape: pill (large radius, can use 9999px).
* Shadow: none by default.
* Hover: slightly darker Amber Ale + small shadow.
* Disabled: reduced opacity, no hover shadow.

**Secondary / Ghost Button** (if needed)

* Transparent background.
* Border: 1px `--color-border-subtle`.
* Text: `--color-text-main` or `--color-bottle-green`.
* Hover: subtle background (`--color-bg-card`).

### 6.2 Card

For dashboard panels, alerts containers, stock columns:

* Background: `--color-bg-card`.
* Padding: `--space-4` to `--space-5`.
* Border-radius: `--radius-lg`.
* Shadow: `--shadow-soft`.
* Optional border: `1px solid --color-border-subtle` for subtle separation.

### 6.3 AlertBanner

A horizontal banner for notifications/warnings.

**Structure**

* Layout: full-width bar, inside or outside a Card.
* Padding: `--space-4`.
* Left: optional icon or severity label.
* Middle: title + description.
* Right: optional close “X” icon.

**Variants**

* `severity = "warning"`

  * Background: very light Amber (e.g. mix `--color-honey-top` with white).
  * Border-left: 4px `--color-amber-ale`.
* `severity = "info"`

  * Background: `--color-bg-card`.
  * Border-left: 4px `--color-bottle-green` or `--color-border-subtle`.

Text uses Karla; title may be stronger weight.

### 6.4 StockColumn (compartment card)

Represents one fridge compartment/category.

**Layout**

* Fixed width ~220px on desktop.
* Card using Card styles above.
* Inside:

  * Title (H3 style): dynamic category name.

  * Small subtitle (e.g. “Stock information pending.”).

  * Tall vertical bar:

    * Container height ~180–220px.
    * Width ~32–40px.
    * Background: light neutral (desaturated Toasted Brown / `#E0D2C3`).
    * Border-radius: full pill.
    * Inner fill with height based on `percentage` prop:

      * Colour: `--color-accent-primary`.
      * Rounded top.

  * Optional small decorative icon near the title (e.g. a heart).

### 6.5 Sidebar navigation

* Background: `--color-nav-bg`.
* Text: off-white on default.
* Active item:

  * Background: lighter Bottle Green or semi-transparent Foam Off-White.
  * Text: `--color-bg-main` or pure white.
  * Rounded pill highlight.
* Font: Karla 500, 16px.

Include a **user profile block** at the top (avatar circle + user name) and place “Support” near the bottom.

---

## 7. Icons and illustration style

* Style: flat, minimal, slightly rounded corners.
* Colours: use Toasted Brown or Bottle Green as primary; accents in Amber Ale.
* No heavy outlines or high-saturation neon colours.
* Illustrations should evoke:

  * Shared moments, people together.
  * Beers, glasses, simple kitchen/house shapes.
* Use large, simple shapes with soft shadows if needed.

---

## 8. Tone of voice & microcopy

* Friendly and clear, not corporate.
* Short, direct sentences.
* Positive framing where possible.

**Examples**

* “Welcome, User. Your fridge is 80% stocked.”
* “Looks like it’s almost time to restock.”
* “No alerts right now. Enjoy your evening.”
* “Sam owes €12.40 this month.” (when real data exists)

Avoid jargon like “API error”; instead show user-friendly messages and log details elsewhere.

---

## 9. How Codex should use this document

When generating or modifying frontend code:

1. **Always** use the colours, typography, spacing, and component specs from this document and `theme.css`.
2. When you see a new visual pattern in requirements:

   * First decide whether it is an instance of an existing component (Button, Card, AlertBanner, StockColumn, etc.).
   * If not, propose a new reusable component, describe it in terms of these tokens, and then implement it.
3. Do not invent additional colours, font families, or random sizes.
   If a new shade is absolutely necessary, base it on one of the core palette colours and explain the choice.
4. Keep the UI feeling:

   * Warm (off-white backgrounds, soft shadows, rounded shapes).
   * Premium (consistent typography and spacing, no clutter).
   * Social and approachable (friendly wording, clear hierarchy).

This file defines how Brew Buddy should look and feel. All UI components and pages should align with it.

