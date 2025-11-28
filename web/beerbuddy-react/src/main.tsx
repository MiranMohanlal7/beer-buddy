import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { ApiProvider } from "./api/ApiProvider";
import { ActiveProfileProvider } from "./state/ActiveProfileContext";
import { SettingsProvider } from "./state/SettingsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApiProvider>
      <SettingsProvider>
        <ActiveProfileProvider>
          <App />
        </ActiveProfileProvider>
      </SettingsProvider>
    </ApiProvider>
  </StrictMode>,
);
