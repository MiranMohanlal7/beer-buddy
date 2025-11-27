import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { BrewBuddyApi } from "./client";
import { placeholderApiClient } from "./placeholderApiClient";

const ApiContext = createContext<BrewBuddyApi | null>(null);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  return <ApiContext.Provider value={placeholderApiClient}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
