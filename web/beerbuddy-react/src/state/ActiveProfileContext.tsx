import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ActiveProfileSource = "api" | "manual";

export interface ActiveProfile {
  userId: number | null;
  username: string;
  source: ActiveProfileSource;
}

export interface ActiveProfileInput {
  userId?: number | null;
  username: string;
}

interface ActiveProfileContextValue {
  activeProfile: ActiveProfile | null;
  selectProfile: (profile: ActiveProfileInput, source?: ActiveProfileSource) => void;
  clearProfile: () => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);

  const selectProfile = useCallback(
    (profile: ActiveProfileInput, source: ActiveProfileSource = "manual") => {
      const username = profile.username?.trim();
      if (!username) {
        return;
      }
      setActiveProfile((previous) => {
        if (
          previous &&
          previous.username === username &&
          previous.userId === (profile.userId ?? null) &&
          previous.source === source
        ) {
          return previous;
        }
        return {
          userId: profile.userId ?? null,
          username,
          source,
        };
      });
    },
    [],
  );

  const clearProfile = useCallback(() => setActiveProfile(null), []);

  const value = useMemo(
    () => ({
      activeProfile,
      selectProfile,
      clearProfile,
    }),
    [activeProfile, selectProfile, clearProfile],
  );

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error("useActiveProfile must be used within an ActiveProfileProvider");
  }
  return context;
}

export function useResolvedProfileName(fallbackName?: string) {
  const { activeProfile } = useActiveProfile();
  return activeProfile?.username ?? fallbackName ?? "Fridge buddy";
}
