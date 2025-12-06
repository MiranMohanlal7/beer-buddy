import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type RestockMode = "consumption" | "schedule" | "wheel";

export interface BrewBuddySettings {
  showHomeMessages: boolean;
  restockMode: RestockMode;
  restockScheduleOrder: string[];
  permissions: Record<string, string>;
}

interface SettingsContextValue {
  settings: BrewBuddySettings;
  setShowHomeMessages: (value: boolean) => void;
  setRestockMode: (mode: RestockMode) => void;
  setPermission: (drinkName: string, value: string) => void;
  setRestockScheduleOrder: (order: string[]) => void;
}

const STORAGE_KEY = "brew-buddy-settings";

const defaultSettings: BrewBuddySettings = {
  showHomeMessages: true,
  restockMode: "wheel",
  restockScheduleOrder: [],
  permissions: {},
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): BrewBuddySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<BrewBuddySettings>;
    return {
      ...defaultSettings,
      ...parsed,
      restockScheduleOrder: Array.isArray(parsed.restockScheduleOrder)
        ? parsed.restockScheduleOrder.filter((name): name is string => typeof name === "string")
        : [],
      permissions: parsed.permissions ?? {},
    };
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BrewBuddySettings>(() => loadSettings());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setShowHomeMessages = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, showHomeMessages: value }));
  }, []);

  const setRestockMode = useCallback((mode: RestockMode) => {
    setSettings((prev) => ({ ...prev, restockMode: mode }));
  }, []);

  const setPermission = useCallback((drinkName: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [drinkName]: value },
    }));
  }, []);

  const setRestockScheduleOrder = useCallback((order: string[]) => {
    setSettings((prev) => ({
      ...prev,
      restockScheduleOrder: order,
    }));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      setShowHomeMessages,
      setRestockMode,
      setPermission,
      setRestockScheduleOrder,
    }),
    [settings, setShowHomeMessages, setRestockMode, setPermission, setRestockScheduleOrder],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
