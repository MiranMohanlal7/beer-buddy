import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { useSettings, type RestockMode } from "../../state/SettingsContext";
import { useApi } from "../../api/ApiProvider";
import type { DashboardSummary } from "../../domain/types";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";

export function SettingsPage() {
  const { settings, setShowHomeMessages, setRestockMode, setPermission } = useSettings();
  const api = useApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.getDashboardSummary(controller.signal),
      api.getLeaderboard({ signal: controller.signal }),
    ])
      .then(([dashboard, leaderboard]) => {
        if (controller.signal.aborted) return;
        setSummary(dashboard);
        setUsers(leaderboard.map((entry) => entry.username));
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load settings data.");
      });

    return () => controller.abort();
  }, [api]);

  const drinks = useMemo(() => {
    return (summary?.compartments ?? []).map((slot) => slot.title);
  }, [summary]);

  const restockModes: { value: RestockMode; label: string; description: string }[] = [
    { value: "consumption", label: "Based on consumption", description: "Assign duty to whoever drank the most this month." },
    { value: "schedule", label: "Set schedule", description: "Follow a repeating monthly rotation you define." },
    { value: "wheel", label: "Wheel of fortune", description: "Pick at random with the spin wheel." },
  ];

  return (
    <div className="page settings-page">
      <PageHeader title="Settings" subtitle="Personalise your experience" />

      {error ? (
        <AlertBanner severity="critical" title="Settings may be out of date" description={error} />
      ) : null}

      <Card className="settings-card settings-card--slim settings-card--standalone">
        <div className="settings-card__header settings-card__header--inline">
          <div>
            <p className="eyebrow">Notifications</p>
            <h2>Home screen messages</h2>
            <p className="settings__muted">
              Toggle fridge alerts and messages on the home screen. This only affects your device.
            </p>
          </div>
          <ToggleSwitch
            checked={settings.showHomeMessages}
            onCheckedChange={(value) => setShowHomeMessages(Boolean(value))}
            aria-label="Toggle home screen messages"
            align="right"
          />
        </div>
      </Card>

      <div className="settings-grid">
        <Card className="settings-card">
          <div className="settings-card__header">
            <div>
              <p className="eyebrow">Restock duty</p>
              <h2>Selection method</h2>
              <p className="settings__muted">
                Choose how to decide who restocks next. Applies across the Finance page and future features.
              </p>
            </div>
          </div>
          <div className="settings-options">
            {restockModes.map((mode) => (
              <label
                key={mode.value}
                className={`settings-option ${
                  settings.restockMode === mode.value ? "is-active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="restock-mode"
                  value={mode.value}
                  checked={settings.restockMode === mode.value}
                  onChange={() => setRestockMode(mode.value)}
                />
                <div>
                  <p className="settings-option__label">{mode.label}</p>
                  <p className="settings__muted">{mode.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card className="settings-card">
          <div className="settings-card__header">
            <div>
              <p className="eyebrow">Permissions</p>
              <h2>Drink access (Beta)</h2>
              <p className="settings__muted">
                Prep for future access control. Assign who can take each drink. Notifications are not active yet while hardware support is in progress.
              </p>
            </div>
            <span className="pill pill--accent">Beta</span>
          </div>

          {drinks.length === 0 ? (
            <p className="settings__muted">Waiting for drink list from the fridge…</p>
          ) : (
            <div className="settings-permissions">
              {drinks.map((drink) => {
                const current = settings.permissions[drink] ?? "everyone";
                const options = ["everyone", ...users];
                return (
                  <div key={drink} className="settings-permission-row">
                    <div>
                      <p className="settings-permission__label">{drink}</p>
                      <p className="settings__muted">Who can take this?</p>
                    </div>
                    <select
                      value={current}
                      onChange={(event) => setPermission(drink, event.target.value)}
                      className="settings-select"
                    >
                      {options.map((user) => (
                        <option key={`${drink}-${user}`} value={user}>
                          {user === "everyone" ? "Everyone" : user}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
