export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertBannerProps {
  title: string;
  description: string;
  severity?: AlertSeverity;
  onClose?: () => void;
}

/**
 * Communicates warnings, info, or critical alerts to the user.
 */
export function AlertBanner({ title, description, severity = "info", onClose }: AlertBannerProps) {
  const label =
    severity === "critical" ? "Critical" : severity === "warning" ? "Warning" : "Info";

  return (
    <div className={`alert-banner alert-banner--${severity}`}>
      <span className="alert-banner__badge">{label}</span>
      <div className="alert-banner__content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      {onClose ? (
        <button
          type="button"
          className="alert-banner__close"
          aria-label="Dismiss alert"
          onClick={onClose}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
