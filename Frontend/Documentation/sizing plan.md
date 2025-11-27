# Brew Buddy Responsive Sizing Plan

This plan describes how every current UI element should respond to different viewport widths and heights. It focuses on practical changes we can implement without altering the visual brand language defined in `theme.css`.

## Breakpoints & Layout Tokens

| Label | Width Range | Usage |
| --- | --- | --- |
| `mobile` | 0 – 599px | Single-column stack; sidebar collapses, cards span full width. |
| `tablet` | 600 – 1023px | Sidebar becomes slide-in drawer, content uses 12-column fluid grid with min 280px cards. |
| `desktop` | 1024 – 1439px | Current layout; sidebar fixed width, content constrained to 1200px max-width. |
| `large desktop` | 1440px+ | Increase max-width to 1440px, limit line length to 60ch. |

Spacing tokens (`--space-*`) stay consistent; we will scale gutters using `clamp()` to avoid cramped or oversized padding.

## Global Containers

- **`<body>` / `.app-layout`**: Switch to column layout under `768px`, putting the sidebar (collapsed) above the page content. Add `max-width: 1440px; margin: 0 auto; padding: clamp(16px, 4vw, 40px)`.
- **`.app-layout__content`**: Use `width: 100%` and `max-width` constraints to prevent extra-wide paragraphs. Apply `gap: var(--space-5)` between stacked sections.
- **`.page` blocks (used across Finance, Stock, History, Leaderboard, Settings, Support)**: Add `padding-block: clamp(16px, 4vw, 32px)` so text isn’t flush with viewport edges on mobile.

## Sidebar (`Sidebar.tsx`)

| State | Behavior |
| --- | --- |
| Desktop | Keep 240px width, floating card style, `position: sticky`. Ensure `min-height: calc(100vh - padding)` so it reaches the bottom. Support link anchored with `margin-top: auto`. |
| Tablet | Reduce width to 200px, maintain sticky behavior. |
| Mobile | Convert to slide-in sheet triggered by a hamburger button in `AppLayout`. Sidebar becomes `position: fixed; inset: 0 auto auto 0; width: min(80vw, 320px); height: 100vh`. Background scrim closes it. Nav items become larger tap targets (min 48px height). |

Decorative avatar remains but scales via `transform: scale(.85)` on small screens to save space.

## UI Components

- **`Card`**: Use `padding: clamp(16px, 3vw, 32px)` and `border-radius: clamp(12px, 2vw, 18px)`. Allow cards to stretch to `width: 100%` on mobile. Add `max-width: 100%` to prevent overflow from nested grids.
- **`PageHeader`**: Use `text-align: center` on small screens, returning to left align from tablet up. Provide `gap: var(--space-1)` at mobile to tighten the layout.
- **`AlertBanner`**: Stack close button below the text on `mobile` to avoid squeezing the message. Let severity background colors stay; adjust padding via `clamp(12px, 3vw, 20px)`.
- **`StockColumn`**: Switch from vertical columns to horizontal cards on `mobile` (bar becomes horizontal progress element). Keep tall columns from tablet upwards by limiting grid columns to `repeat(auto-fit, minmax(180px, 1fr))`. Icons shrink to 28px squares on mobile.
- **`ProgressBar`**: Introduce `--progress-height` custom property and set to `8px` on small screens, `12px` on desktop.
- **`Button` (if used later)**: Use `min-height: 44px` and responsive padding `clamp(12px, 2vw, 16px)`; allow full-width buttons on mobile using `.btn--block` modifier.
- **`Badge`**: Scale font-size with `clamp(0.75rem, 2vw, 0.85rem)`; keep inline but wrap when container shrinks.
- **`DrinkList`**: Replace inline styles with a responsive grid: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4);`. Images become `width: clamp(48px, 10vw, 72px)` and text wraps below image at <480px.

## Page-Specific Plans

### Home Page

1. **Welcome Card**: Stays full width; on `mobile`, reduce font sizes slightly via `clamp`. Add `display: grid` with `gap: var(--space-3)` so dynamic data lines wrap gracefully.
2. **Alerts Section**: On `mobile`, show a subtle heading + collapsible list (accordion). On `desktop`, maintain vertical stack with `max-width: 720px` for readability.
3. **Stock Overview**: Implement CSS grid with `auto-fit` columns, but at <600px switch to horizontal scroll snapping for the tall columns so we keep the fridge-column feel without shrinking too much. Provide `min-height: 260px` for columns on desktop, `180px` on tablet.

### Stock / History / Finance / Leaderboard / Settings / Support Pages

Currently placeholder text. Apply shared `.page` container rules plus optional `content-grid` helper when tables/charts are added. Reserve `min-height: 60vh` for upcoming tables so the layout doesn’t collapse on small screens.

### Drink List Page

Add `padding-inline: clamp(16px, 4vw, 32px)` and ensure each entry uses CSS grid (`grid-template-columns: auto 1fr`) so images and text realign fluidly.

## Implementation Checklist

1. Introduce `@media` queries for the breakpoints above inside `globals.css`.
2. Convert hard-coded pixel paddings/margins to `clamp` expressions where appropriate.
3. Refactor `app-layout` to switch to column stacking on mobile and restore row layout from `tablet` up.
4. Build a `SidebarToggle` button rendered inside `AppLayout` for mobile viewports.
5. Update each component listed to respect the sizing guidance (padding, font sizes, layout modes).
6. Test using Chrome DevTools device emulation for iPhone SE, iPad, and 1440px desktop widths.

Following this plan will make Brew Buddy adaptable across phones, tablets, laptops, and large monitors without sacrificing the existing warm aesthetic.
