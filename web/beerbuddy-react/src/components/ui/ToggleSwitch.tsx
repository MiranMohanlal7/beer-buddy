import * as Switch from "@radix-ui/react-switch";
import type { ComponentProps } from "react";

export interface ToggleSwitchProps extends Omit<ComponentProps<typeof Switch.Root>, "asChild"> {
  label?: string;
  description?: string;
  align?: "left" | "right";
}

export function ToggleSwitch({ label, description, align = "left", ...props }: ToggleSwitchProps) {
  const hasText = Boolean(label || description);
  return (
    <label className={`toggle-switch ${align === "right" ? "toggle-switch--right" : ""}`}>
      <div className="toggle-switch__control">
        <Switch.Root className="toggle-switch__root" {...props}>
          <Switch.Thumb className="toggle-switch__thumb" />
        </Switch.Root>
      </div>
      {hasText ? (
        <div className="toggle-switch__text">
          {label ? <span className="toggle-switch__label">{label}</span> : null}
          {description ? <span className="toggle-switch__description">{description}</span> : null}
        </div>
      ) : null}
    </label>
  );
}
