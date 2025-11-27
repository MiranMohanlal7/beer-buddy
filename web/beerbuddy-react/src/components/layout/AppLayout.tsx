import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard shell that renders the persistent sidebar next to the page content.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__content">{children}</main>
    </div>
  );
}
