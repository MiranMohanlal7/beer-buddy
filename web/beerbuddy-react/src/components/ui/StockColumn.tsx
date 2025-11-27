import type { ReactNode } from "react";
import { UiIcon } from "./Icon";
import type { UiIconName } from "./Icon";

export interface StockColumnProps {
  title: string;
  status: string;
  percentage: number;
  icon?: ReactNode;
  iconName?: UiIconName;
}

/**
 * Tall compartment card that visualises how full a fridge slot is.
 */
export function StockColumn({ title, status, percentage, icon, iconName = "stock" }: StockColumnProps) {
  const safePercentage = Math.max(0, Math.min(percentage, 100));

  return (
    <article className="stock-column">
      <div className="stock-column__header">
        <div className="stock-column__icon" aria-hidden="true">
          {icon ?? <UiIcon name={iconName} size={18} variant="subtle" />}
        </div>
        <div className="stock-column__title-group">
          <p className="stock-column__title">{title}</p>
          <p className="stock-column__status">{status}</p>
        </div>
      </div>

      <div
        className="stock-column__meter"
        role="img"
        aria-label={`${title} ${safePercentage}% stocked`}
      >
        <div className="stock-column__bar">
          <div className="stock-column__fill" style={{ height: `${safePercentage}%` }} />
        </div>
      </div>

      <div className="stock-column__meta">
        <span className="stock-column__percentage">{safePercentage}% stocked</span>
        <p className="stock-column__status stock-column__status--muted">
          Live updates arrive once sensors sync.
        </p>
      </div>
    </article>
  );
}
