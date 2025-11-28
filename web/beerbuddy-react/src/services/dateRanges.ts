/**
 * Returns ISO boundaries for the current calendar month along with a human-friendly label.
 */
export function getCurrentMonthRange() {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });

  return {
    fromIso: rangeStart.toISOString(),
    toIso: rangeEnd.toISOString(),
    label: `${formatter.format(rangeStart)} – ${formatter.format(rangeEnd)}`,
  };
}
