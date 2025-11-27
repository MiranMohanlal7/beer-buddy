import { useState } from "react";
import type { FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { UiIcon, type UiIconName } from "../../components/ui/Icon";

const contactMethods: {
  id: string;
  label: string;
  detail: string;
  meta: string;
  icon: UiIconName;
  href: string;
  cta: string;
}[] = [
  {
    id: "email",
    label: "Email",
    detail: "support@brewbuddy.app",
    meta: "Replies land in your inbox within two hours, every day of the week.",
    icon: "email",
    href: "mailto:support@brewbuddy.app",
    cta: "Send an email",
  },
  {
    id: "phone",
    label: "Phone",
    detail: "+31 00 000 0000",
    meta: "Weekdays 09:00 – 22:00 CET. Only for urgent requests.",
    icon: "phone",
    href: "tel:+31000000000",
    cta: "Call now",
  },
  {
    id: "chat",
    label: "Live chat",
    detail: "In-app & WhatsApp",
    meta: "Daily 09:00 – 00:00 CET. Quick tips from the Buddy crew.",
    icon: "chat",
    href: "https://wa.me/31000000000",
    cta: "Start chat",
  },
];

const heroHighlights: { id: string; label: string; value: string; icon: UiIconName }[] = [
  {
    id: "response",
    label: "Avg. first reply",
    value: "< 2 hours",
    icon: "stats",
  },
  {
    id: "availability",
    label: "Team availability",
    value: "7 days a week",
    icon: "housemates",
  },
  {
    id: "resolution",
    label: "Issues resolved on first contact",
    value: "93%",
    icon: "success",
  },
];

const heroAssurances = [
  "Real Brew Buddy employees, not dumb bots.",
  "EU & UK coverage for hardware replacements.",
  "Secure billing support for all housemates.",
];

const conciergePoints = [
  "Hardware swaps, installs, or moving the fridge.",
  "Payment disputes or reimbursements between roommates.",
  "help with connecting new sensors, NFC tags, or other technical support.",

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
          <div className="support-hero__badge">Concierge support</div>
          <h1>Support and contact</h1>
          <p className="support-hero__lead">
            The Buddy support crew keeps an eye on hardware, fridge stock, and billing questions so
            you can focus on good vibes. Pick any channel, we&apos;ll jump in fast.
          </p>
          <ul className="support-hero__assurance-list">
            {heroAssurances.map((assurance) => (
              <li key={assurance}>{assurance}</li>
            ))}
          </ul>
        </div>
        <section className="support-hero__stats">
          {heroHighlights.map((item) => (
            <article key={item.id} className="support-hero__stat">
              <div className="support-hero__stat-icon">
                <UiIcon name={item.icon} size={26} variant="subtle" />
              </div>
              <div>
                <p className="support-hero__stat-label">{item.label}</p>
                <p className="support-hero__stat-value">{item.value}</p>
              </div>
            </article>
          ))}
        </section>
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
              <a
                className="support-contact-card__cta"
                href={method.href}
                target="_blank"
                rel="noreferrer"
              >
                {method.cta}
              </a>
            </div>
          </Card>
        ))}
      </section>

      <Card className="support-form-card">
        <div className="support-form-card__intro">
          <p className="support-form-card__eyebrow">we're here to help</p>
          <h2>Send us an Email</h2>
          <p className="support-form-card__lead">
            Asking for help shouldn't be hard, just let us know from here! We&apos;ll get back to you as soon as possible. If you have an urgent request, please give us a call.
          </p>
        </div>

        <div className="support-form-card__grid">
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
          <aside className="support-info-panel">
            <p className="support-info-panel__title">Example concierge / support requests</p>
            <ul>
              {conciergePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="support-info-panel__badge">
              Need an urgent technician?
              <span>Call us 24/7 · +31 20 555 0101</span>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
