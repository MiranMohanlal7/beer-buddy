export interface ProgressBarProps {
  value: number;
  "aria-label"?: string;
}

/**
 * Horizontal percentage bar for stock levels and statuses.
 */
export function ProgressBar({ value, ...rest }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      {...rest}
    >
      <div className="progress-bar__fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
