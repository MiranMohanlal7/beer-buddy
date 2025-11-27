import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Beer,
  Boxes,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  History,
  Home,
  Mail,
  MessageCircle,
  Phone,
  Refrigerator,
  Settings,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export type UiIconName =
  | "alert"
  | "beer"
  | "chat"
  | "costs"
  | "email"
  | "fridge"
  | "history"
  | "home"
  | "housemates"
  | "leaderboard"
  | "phone"
  | "settings"
  | "stats"
  | "stock"
  | "success"
  | "support";

export interface UiIconProps {
  name: UiIconName;
  size?: number;
  variant?: "default" | "active" | "subtle";
  strokeWidth?: number;
  className?: string;
}

const ICON_MAP: Record<UiIconName, LucideIcon> = {
  alert: AlertCircle,
  beer: Beer,
  chat: MessageCircle,
  costs: DollarSign,
  email: Mail,
  fridge: Refrigerator,
  history: History,
  home: Home,
  housemates: Users,
  leaderboard: Trophy,
  phone: Phone,
  settings: Settings,
  stats: TrendingUp,
  stock: Boxes,
  success: CheckCircle2,
  support: HelpCircle,
};

const VARIANT_TO_COLOR: Record<NonNullable<UiIconProps["variant"]>, string> = {
  default: "var(--color-toasted-brown)",
  active: "var(--color-amber-ale)",
  subtle: "var(--color-bottle-green)",
};

/**
  * Semantic icon wrapper that maps domain-friendly names to Lucide icons
  * and enforces consistent sizing, stroke, and theme-driven colours.
  */
export function UiIcon({
  name,
  size = 22,
  variant = "default",
  strokeWidth = 1.75,
  className = "",
}: UiIconProps) {
  const IconComponent = ICON_MAP[name] ?? ICON_MAP.home;
  const color = VARIANT_TO_COLOR[variant] ?? VARIANT_TO_COLOR.default;

  return (
    <IconComponent
      aria-hidden="true"
      focusable="false"
      className={`ui-icon ${className}`.trim()}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
    />
  );
}
