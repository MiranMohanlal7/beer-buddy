# Goal
Deliver hover-driven contextual zoom on the History page chart so that closely spaced stock events become readable (e.g., points a few minutes apart should expand to show clear separation), while non-clustered points keep the full-range view. Interaction should feel smooth, reversible on mouse leave, and avoid accidental jumps.

# Proposed steps
- Inspect chart data granularity: confirm timestamp resolution (seconds/minutes) and ordering; ensure we use sorted data for domain calculations.
- Instrument hover events: log/inspect Recharts `Tooltip`/`onMouseMove` payloads to confirm active point timestamps and neighbor gaps; add a temporary badge/dev overlay to visualize detected window.
- Define zoom heuristics: compute nearest-neighbor gaps, cap zoom window (e.g., min 2–5 minutes, max 30–60 minutes), and choose padding multiplier that scales with gap size; set a reasonable “cluster” threshold to trigger zoom.
- Permit off-screen points during zoom: allow the window to focus on the hovered cluster even if it hides far-apart points; they can fade/slide out to avoid limiting the zoom depth.
- Apply animated domain updates: update `XAxis` domain from hover handler with a short transition (e.g., use state + `setTimeout` or CSS transition wrapper) so zoom feels smooth.
- Handle exit/reset: on mouse leave (or when hover target is not clustered), restore full domain; debounce to avoid flicker.
- Add accessibility/UX guardrails: keep dots active for easier hover; ensure tooltip stays aligned after domain changes; prevent zoom when data length < 2.
- Clean up instrumentation and keep the feature toggleable (easy to remove by deleting the zoom hook and domain state).

# Risks / mitigations
- **Hover payload not firing**: confirm event handlers on `AreaChart` vs `Tooltip`; fallback to `onMouseEnter`/`onMouseMove` on `ResponsiveContainer`.
- **Jitter/flicker**: debounce hover domain updates and avoid zooming when gap/threshold not met.
- **Over-zoom on sparse data**: clamp to max window (e.g., 30–60 minutes) and skip zoom if neighbors are far apart.
- **Inconsistent timezones/parse errors**: use numeric timestamps and guard against invalid dates before computing gaps.
