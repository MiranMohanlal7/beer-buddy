import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Brand-styled button with a small set of variants.
 */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`btn btn--${variant} ${className}`.trim()} {...props} />;
}
