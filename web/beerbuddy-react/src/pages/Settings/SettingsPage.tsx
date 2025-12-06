import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { useSettings, type RestockMode } from "../../state/SettingsContext";
import { useApi } from "../../api/ApiProvider";
import type { DashboardSummary } from "../../domain/types";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";

export function SettingsPage() {
  const {
    settings,
    setShowHomeMessages,
    setRestockMode,
    setPermission,
    setRestockScheduleOrder,
  } = useSettings();
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

  const scheduleOrder = useMemo(() => {
    const stored = settings.restockScheduleOrder.filter(Boolean);
    const uniqueStored: string[] = [];
    stored.forEach((name) => {
      if (!name) return;
      if (uniqueStored.includes(name)) return;
      uniqueStored.push(name);
    });
    const remainder = users.filter((user) => !uniqueStored.includes(user));
    return [...uniqueStored, ...remainder];
  }, [settings.restockScheduleOrder, users]);

  const moveScheduleUser = useCallback(
    (index: number, direction: -1 | 1) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= scheduleOrder.length) return;
      const nextOrder = [...scheduleOrder];
      const [moved] = nextOrder.splice(index, 1);
      nextOrder.splice(nextIndex, 0, moved);
      setRestockScheduleOrder(nextOrder);
    },
    [scheduleOrder, setRestockScheduleOrder],
  );

  const isScheduleModeActive = settings.restockMode === "schedule";

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
                Choose how to decide who restocks next. The selected method will appear on the finance page. 
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

        <Card className={`settings-card ${isScheduleModeActive ? "" : "settings-card--disabled"}`}>
          <div className="settings-card__header">
            <div>
              <p className="eyebrow">Restock duty</p>
              <h2>Schedule order</h2>
              <p className="settings__muted">
                Arrange the rotation for restock duty. We&apos;ll repeat the list every month.
              </p>
            </div>
            {!isScheduleModeActive ? (
              <span className="pill">Enable &ldquo;Set schedule&rdquo; to edit</span>
            ) : null}
          </div>
          {users.length === 0 ? (
            <p className="settings__muted">Waiting for the leaderboard to load…</p>
          ) : (
            <div className="settings-schedule">
              <div className="settings-schedule__list" aria-disabled={!isScheduleModeActive}>
                {scheduleOrder.map((user, index) => (
                  <div key={`${user}-${index}`} className="settings-permission-row">
                    <div>
                      <p className="settings-permission__label">
                        #{index + 1} · {user}
                      </p>
                      <p className="settings__muted">Order for monthly rotation</p>
                    </div>
                    <div className="settings-schedule__actions">
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => moveScheduleUser(index, -1)}
                        disabled={!isScheduleModeActive || index === 0}
                        aria-label={`Move ${user} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => moveScheduleUser(index, 1)}
                        disabled={!isScheduleModeActive || index === scheduleOrder.length - 1}
                        aria-label={`Move ${user} down`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="settings-card">
          <div className="settings-card__header">
            <div>
              <p className="eyebrow">Permissions</p>
              <h2>Drink access (Preview)</h2>
              <p className="settings__muted">
                Drink acces is a feature that allows you to control who is allowed to take specific drinks from the fridge. If an unauthorized user takes a drink, the owner will be notified. 
              </p>
            </div>
            <span className="pill pill--accent">Preview</span>
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
