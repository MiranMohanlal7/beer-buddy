import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { StockColumn } from "../../components/ui/StockColumn";
import type { UiIconName } from "../../components/ui/Icon";
import { UiIcon } from "../../components/ui/Icon";
import { useApi } from "../../api/ApiProvider";
import type { DashboardSummary, FridgeNote } from "../../domain/types";

const noteCharacterLimit = 180;

/**
 * Presents the welcome hero, conditional alerts, notes, and compartment overview backed by live data.
 */
export function HomePage() {
  const api = useApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [notes, setNotes] = useState<FridgeNote[]>([]);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingSummary(true);
    api
      .getDashboardSummary(controller.signal)
      .then((result) => {
        setSummary(result);
        setSummaryError(null);
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setSummaryError(error.message ?? "Failed to load live dashboard data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingSummary(false);
        }
      });

    return () => controller.abort();
  }, [api]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingNotes(true);
    api
      .getNotes(controller.signal)
      .then((result) => {
        setNotes(result);
        setNotesError(null);
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setNotesError(error.message ?? "Failed to load fridge notes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingNotes(false);
        }
      });

    return () => controller.abort();
  }, [api]);

  const alerts = summary?.alerts ?? [];
  const compartments = summary?.compartments ?? [];
  const overallStock = summary?.overallStockPercentage ?? 0;
  const heroName = summary?.currentUserName ?? "Fridge buddy";
  const heroSummary =
    summary?.heroSummary ??
    (summaryError ? "We couldn’t load live fridge data just now." : "Fetching the latest fridge metrics…");
  const notificationCopy =
    summary?.notificationCopy ?? "Your fridge data is being fetched. This will update automatically.";

  const lowestCompartment = useMemo(() => {
    if (compartments.length === 0) {
      return undefined;
    }
    return compartments.reduce((lowest, slot) =>
      slot.percentage < lowest.percentage ? slot : lowest,
    );
  }, [compartments]);

  const highlightCards: { title: string; value: string; description: string; icon: UiIconName }[] =
    useMemo(() => {
      const fallbackDescription = isLoadingSummary
        ? "Loading live stats…"
        : "Awaiting data from the fridge sensors.";

      return [
        {
          title: "Fridge readiness",
          value: summary ? `${overallStock}%` : "--",
          description: summary ? "Live aggregate from every compartment." : fallbackDescription,
          icon: "stats",
        },
        {
          title: "Active alerts",
          value: summary ? `${alerts.length}` : "--",
          description:
            alerts.length > 0
              ? alerts[0].description
              : summary
                ? "All clear. Enjoy the calm fridge vibes."
                : fallbackDescription,
          icon: "alert",
        },
        {
          title: "Next top-up",
          value: summary?.nextTopUpCompartment ?? "--",
          description: lowestCompartment
            ? `${lowestCompartment.percentage.toFixed(0)}% stocked. Keep an eye on it.`
            : fallbackDescription,
          icon: "stock",
        },
      ];
    }, [alerts, lowestCompartment, overallStock, summary, isLoadingSummary]);

  const remainingCharacters = noteCharacterLimit - noteText.length;
  const fridgeMood = useMemo(() => {
    if (notes.length === 0) {
      return isLoadingNotes ? "Loading live notes…" : "The board is empty. Leave the first note!";
    }

    const latest = notes[0];
    return `Last update from ${latest.author || "someone mysterious"} ${
      formatNoteTimestamp(latest.createdAt) ?? "just now"
    }.`;
  }, [notes, isLoadingNotes]);

  async function handleSubmitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = noteText.trim();
    if (!trimmedText) {
      return;
    }

    const author = noteAuthor.trim() || "Anon";
    setIsSubmittingNote(true);

    try {
      const created = await api.createNote({ author, text: trimmedText });
      setNotes((prev) => [created, ...prev]);
      setNoteText("");
      setNotesError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create note.";
      setNotesError(message);
    } finally {
      setIsSubmittingNote(false);
    }
  }

  async function handleDeleteNote(noteId: number) {
    const previousNotes = [...notes];
    setNotes((prev) => prev.filter((note) => note.id !== noteId));

    try {
      await api.deleteNote(noteId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete note.";
      setNotesError(message);
      setNotes(previousNotes);
    }
  }

  function formatNoteTimestamp(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) {
      return "just now";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  return (
    <div className="page home-page">
      {summaryError ? (
        <AlertBanner
          severity="critical"
          title="Live dashboard unavailable"
          description={summaryError}
        />
      ) : null}

      <Card className="home-hero">
        <div className="home-hero__grid">
          <div className="home-hero__copy">
            <h1>Hi, {heroName} — here&apos;s your fridge</h1>
            <p className="home-hero__lead">{heroSummary}</p>
          </div>

          <div className="home-hero__stat-card">
            <p className="home-hero__stat-label">Overall stock</p>
            <p className="home-hero__stat-value">
              {summary ? `${overallStock}%` : isLoadingSummary ? "…" : "--"}
            </p>
            <div
              className="home-hero__stat-bar"
              role="img"
              aria-label={
                summary
                  ? `Fridge is ${overallStock}% stocked`
                  : "Live fridge data is loading"
              }
            >
              <div
                className="home-hero__stat-bar-fill"
                style={{ width: `${Math.max(0, Math.min(overallStock, 100))}%` }}
              />
            </div>
            <p className="home-hero__stat-note">
              {summary
                ? "Auto-sync with the fridge sensors."
                : "Waiting for sensor data to sync…"}
            </p>
          </div>

          <div className="home-hero__highlights">
            {highlightCards.map((item) => (
              <div key={item.title} className="home-hero__highlight">
                <span className="home-hero__highlight-icon">
                  <UiIcon
                    name={item.icon}
                    variant={item.icon === "alert" && alerts.length > 0 ? "active" : "subtle"}
                    size={18}
                  />
                </span>
                <div>
                  <p className="home-hero__highlight-label">{item.title}</p>
                  <p className="home-hero__highlight-value">{item.value}</p>
                  <p className="home-hero__highlight-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="home-page__grid">
        <Card className="home-panel home-panel--alerts">
          <div className="home-panel__header">
            <div>
              <h2>Alerts</h2>
              <p className="home-panel__muted">Important updates from the fridge sensors.</p>
            </div>
            <span className={`pill ${alerts.length > 0 ? "pill--accent" : ""}`}>
              {alerts.length > 0 ? `${alerts.length} active` : "All clear"}
            </span>
          </div>

          {alerts.length > 0 ? (
            <div className="home-alerts__list home-alerts__list--card">
              {alerts.map((alert) => (
                <AlertBanner
                  key={alert.id}
                  title={alert.title}
                  description={alert.description}
                  severity={alert.severity}
                />
              ))}
            </div>
          ) : (
            <p className="home-alerts__empty">
              {isLoadingSummary ? "Loading alerts…" : "No alerts right now. Enjoy your evening."}
            </p>
          )}

          <div className="home-alerts__context">
            <p className="home-alerts__context-lead">Notification Centre</p>
            <p className="home-alerts__context-copy">{notificationCopy}</p>
          </div>
        </Card>

        <Card className="home-panel home-panel--summary fridge-notes-panel">
          <div className="home-panel__header">
            <div>
              <h2>Fridge notes</h2>
              <p className="home-panel__muted">{fridgeMood}</p>
              {notesError ? (
                <p className="home-panel__muted" role="alert">
                  {notesError}
                </p>
              ) : null}
            </div>
          </div>

          <form className="fridge-notes__form" onSubmit={handleSubmitNote}>
            <label className="visually-hidden" htmlFor="fridge-note-name">
              Your name
            </label>
            <input
              id="fridge-note-name"
              className="fridge-notes__input"
              placeholder="Name or emoji signature"
              value={noteAuthor}
              onChange={(event) => setNoteAuthor(event.target.value)}
              maxLength={30}
            />
            <label className="visually-hidden" htmlFor="fridge-note-text">
              Your fridge note
            </label>
            <textarea
              id="fridge-note-text"
              className="fridge-notes__textarea"
              placeholder="Leave a reminder, toast, or grocery plea…"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value.slice(0, noteCharacterLimit))}
              maxLength={noteCharacterLimit}
              rows={3}
            />
            <div className="fridge-notes__actions">
              <span className="fridge-notes__counter">{remainingCharacters} chars left</span>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!noteText.trim() || isSubmittingNote}
              >
                {isSubmittingNote ? "Saving…" : "Pin note"}
              </button>
            </div>
          </form>

          <div className="fridge-notes__board-wrapper">
            <div
              className={`fridge-notes__board ${
                notes.length === 0 ? "fridge-notes__board--empty" : ""
              }`}
            >
              {notes.length === 0 ? (
                <p className="fridge-notes__empty">
                  {isLoadingNotes
                    ? "Loading notes from your crew…"
                    : "The board is clear for now. Add a note to get the chatter going."}
                </p>
              ) : (
                notes.map((note, index) => (
                  <article
                    key={note.id}
                    className="fridge-note"
                    style={{ "--random-tilt": index % 2 === 0 ? "-1.5deg" : "1.5deg" } as CSSProperties}
                  >
                    <button
                      type="button"
                      className="fridge-note__delete"
                      aria-label={`Delete note from ${note.author}`}
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      ×
                    </button>
                    <p className="fridge-note__text">{note.text}</p>
                    <div className="fridge-note__meta">
                      <span className="fridge-note__author">{note.author}</span>
                      <span className="fridge-note__timestamp">
                        {formatNoteTimestamp(note.createdAt)}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="home-stock-panel">
        <div className="home-section__header">
          <div>
            <h2>Stock Overview</h2>
            <p className="home-panel__muted">Current compartment status.</p>
          </div>
          <span className="pill">{summary ? "Live" : "Syncing"}</span>
        </div>

        {compartments.length === 0 ? (
          <p className="home-panel__muted">
            {isLoadingSummary ? "Loading live stock levels…" : "No compartments available yet."}
          </p>
        ) : (
          <div className="stock-columns">
            {compartments.map((slot) => (
              <StockColumn
                key={slot.id}
                title={slot.title}
                status={slot.status}
                percentage={slot.percentage}
                iconName="stock"
                meta={`${slot.currentUnits.toFixed(1)} / ${slot.targetUnits.toFixed(
                  1,
                )} units · €${slot.pricePerUnit.toFixed(2)}`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
