import { FormEvent, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { UiIcon, type UiIconName } from "../../components/ui/Icon";

const contactMethods: {
  id: string;
  label: string;
  detail: string;
  meta: string;
  icon: UiIconName;
}[] = [
  {
    id: "email",
    label: "Email",
    detail: "support@brewbuddies.app",
    meta: "Replies land in your inbox within two hours, every day of the week.",
    icon: "email",
  },
  {
    id: "phone",
    label: "Phone",
    detail: "+31 20 555 0101",
    meta: "Weekdays 09:00 – 22:00 CET. Perfect for urgent fridge fails.",
    icon: "phone",
  },
  {
    id: "chat",
    label: "Live chat",
    detail: "In-app & WhatsApp",
    meta: "Daily 09:00 – 00:00 CET. Quick tips from the Buddy crew.",
    icon: "chat",
  },
];

const heroHighlights = [
  {
    id: "response",
    label: "Avg. first reply",
    value: "< 2 hours",
  },
  {
    id: "availability",
    label: "Team availability",
    value: "7 days a week",
  },
  {
    id: "resolution",
    label: "Issues resolved on first contact",
    value: "93%",
  },
];

export function SupportPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; text: string }>({
    type: "idle",
    text: "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedMessage) {
      setStatus({
        type: "error",
        text: "Add both your email address and a short note so we know how to help.",
      });
      return;
    }

    setStatus({
      type: "success",
      text: "Thanks! One of the Brew Buddy humans will reply shortly.",
    });
    setEmail("");
    setMessage("");
  }

  return (
    <div className="page support-page">
      <Card className="support-hero">
        <div className="support-hero__copy">
          <p className="support-hero__eyebrow">We have your back</p>
          <h1>Support and contact</h1>
          <p className="support-hero__lead">
            The Buddy support crew keeps an eye on hardware, fridge stock, and billing questions so
            you can focus on good vibes. Pick any channel, we&apos;ll jump in fast.
          </p>
        </div>
        <div className="support-hero__stats">
          {heroHighlights.map((item) => (
            <div key={item.id} className="support-hero__stat">
              <p className="support-hero__stat-label">{item.label}</p>
              <p className="support-hero__stat-value">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="support-contact-grid">
        {contactMethods.map((method) => (
          <Card key={method.id} className="support-contact-card">
            <div className="support-contact-card__icon">
              <UiIcon name={method.icon} size={28} variant="active" />
            </div>
            <div className="support-contact-card__body">
              <p className="support-contact-card__label">{method.label}</p>
              <p className="support-contact-card__detail">{method.detail}</p>
              <p className="support-contact-card__meta">{method.meta}</p>
            </div>
          </Card>
        ))}
      </section>

      <Card className="support-form-card">
        <div className="support-form-card__intro">
          <p className="support-form-card__eyebrow">Send a note</p>
          <h2>Type your email right here</h2>
          <p className="support-form-card__lead">
            Drop a direct line without leaving the dashboard. We&apos;ll reply to the address you
            share below.
          </p>
        </div>

        <form className="support-form" onSubmit={handleSubmit} noValidate>
          <label className="support-form__field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="support-form__input"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="support-form__field">
            <span>What do you need help with?</span>
            <textarea
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="support-form__textarea"
              rows={5}
              placeholder="Share the fridge issue, billing question, or feature idea…"
              required
            />
          </label>
          <div className="support-form__actions">
            <p className="support-form__hint">
              Response promise: under two hours between 09:00 and 00:00 CET, weekends included.
            </p>
            <Button type="submit">Send message</Button>
          </div>
          {status.type !== "idle" && (
            <p
              className={`support-form__status support-form__status--${status.type}`}
              role={status.type === "error" ? "alert" : "status"}
            >
              {status.text}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
