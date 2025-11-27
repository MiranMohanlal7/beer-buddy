import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic elevated container for grouping related content.
 */
export function Card({ children, className = "" }: CardProps) {
  const classes = ["card", className].filter(Boolean).join(" ");
  return <section className={classes}>{children}</section>;
}
