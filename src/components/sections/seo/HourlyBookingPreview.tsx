"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { PublicBookingEmbeddedCheckout } from "@/components/sections/public-booking/PublicBookingEmbeddedCheckout";
import { marketingImage, type MarketingPage } from "@/content/marketing";
import { hourlyLabels } from "@/content/booking/labels";
import type {
  getHourlyQuoteAction,
  createHourlyBookingAction,
  simulateHourlyPaymentAction,
  abandonHourlyCheckoutAction,
} from "@/interface/next/actions/hourlyBookingActions";
import { SeoSiteShell } from "./SeoSiteChrome";

const subscribe = () => () => {};
const readyClient = () => true;
const readyServer = () => false;
type Quote = Extract<
  Awaited<ReturnType<typeof getHourlyQuoteAction>>,
  { ok: true }
>["value"];
type Checkout = Extract<
  Awaited<ReturnType<typeof createHourlyBookingAction>>,
  { ok: true }
>["value"];
export type HourlyBookingActions = {
  quote: typeof getHourlyQuoteAction;
  create: typeof createHourlyBookingAction;
  simulate: typeof simulateHourlyPaymentAction;
  abandon: typeof abandonHourlyCheckoutAction;
};
const fieldClass =
  "mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-sand bg-background p-3 text-base font-normal";

export function HourlyBookingPreview({
  page,
  initialExperienceId,
  initialHours = 2,
  actions,
  simulation = false,
  stripePublishableKey = "",
}: {
  page: MarketingPage;
  initialExperienceId?: string;
  initialHours?: number;
  actions?: HourlyBookingActions;
  simulation?: boolean;
  stripePublishableKey?: string;
}) {
  const ready = useSyncExternalStore(subscribe, readyClient, readyServer);
  const labels = hourlyLabels[page.locale];
  const initialExperience =
    page.experiences.find((item) => item.bookingId === initialExperienceId) ??
    page.experiences[0];
  const [selectedId, setSelectedId] = useState(initialExperience.id);
  const [hours, setHours] = useState(
    initialExperience.durationOptions.includes(initialHours)
      ? initialHours
      : initialExperience.featuredHours,
  );
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [startTime, setStartTime] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const revision = useRef(0);
  const selected = page.experiences.find((item) => item.id === selectedId)!;
  const selection = {
    experienceId: selected.bookingId,
    hours,
    localDate: date,
  };
  const money = (minor: number) =>
    new Intl.NumberFormat(page.locale, {
      style: "currency",
      currency: "EUR",
    }).format(minor / 100);
  function reset() {
    revision.current++;
    setQuote(null);
    setStartTime("");
    setError("");
  }
  function showError(code: string) {
    setError(
      code === "BOOKING_RATE_UNAVAILABLE" ? labels.noRate : labels.error,
    );
  }
  async function check() {
    if (!actions) return;
    const request = ++revision.current;
    setBusy(true);
    setQuote(null);
    setError("");
    setStartTime("");
    try {
      const result = await actions.quote(selection);
      if (request !== revision.current) return;
      if (result.ok) setQuote(result.value);
      else showError(result.code);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }
  async function book() {
    if (!actions || busy || !quote) return;
    setBusy(true);
    setError("");
    try {
      const result = await actions.create({
        ...selection,
        ...customer,
        startTime,
        guestCount: Number(guests),
        locale: page.locale,
        acceptedTerms,
      });
      if (result.ok) setCheckout(result.value);
      else {
        showError(result.code);
        setQuote(null);
      }
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }
  async function simulate() {
    if (!actions || !checkout) return;
    setBusy(true);
    setError("");
    try {
      const result = await actions.simulate(checkout.paymentProviderSessionId);
      if (result.ok && result.value.action !== "IGNORED") setConfirmed(true);
      else setError(labels.error);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }
  async function abandon() {
    if (!actions || !checkout) return;
    setBusy(true);
    try {
      const result = await actions.abandon(checkout.paymentProviderSessionId);
      if (result.ok) {
        setCheckout(null);
        reset();
      } else showError(result.code);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <SeoSiteShell page={page}>
      <section className="py-12 lg:py-20">
        <Container>
          <h1 className="font-display text-5xl sm:text-6xl">
            {page.copy.bookingTitle}
          </h1>
          <p className="mt-5 max-w-3xl leading-8 text-text-muted">
            {labels.intro}
          </p>
          {simulation && (
            <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              {labels.demo}
            </p>
          )}
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-sand bg-white p-6 sm:p-8">
              {error && (
                <p
                  role="alert"
                  className="mb-5 rounded-lg bg-rose-50 p-4 text-rose-900"
                >
                  {error}
                </p>
              )}
              {checkout ? (
                <div className="space-y-6">
                  <p role="status">
                    {confirmed ? labels.confirmed : labels.pending}
                  </p>
                  <p>
                    {labels.reference}: <strong>{checkout.reference}</strong>
                  </p>
                  {!confirmed &&
                    (simulation ? (
                      <Button
                        disabled={busy}
                        onClick={simulate}
                        variant="accent"
                      >
                        {busy ? labels.loading : labels.simulate}
                      </Button>
                    ) : (
                      <PublicBookingEmbeddedCheckout
                        checkoutClientSecret={checkout.checkoutClientSecret}
                        checkoutSessionId={checkout.paymentProviderSessionId}
                        returnPath={`/${page.locale === "es" ? "es" : "en"}/book/success`}
                        securePaymentLabel={labels.continue}
                        stripePublishableKey={stripePublishableKey}
                      />
                    ))}
                  {!confirmed && (
                    <Button
                      disabled={busy}
                      onClick={abandon}
                      variant="secondary"
                    >
                      {labels.back}
                    </Button>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (quote?.slots.length) void book();
                    else void check();
                  }}
                >
                  <fieldset
                    disabled={!ready || busy}
                    className="space-y-6"
                    aria-label={page.copy.bookingTitle}
                  >
                    <label className="block text-sm font-semibold">
                      {page.copy.tableExperience}
                      <select
                        value={selectedId}
                        className={fieldClass}
                        onChange={(event) => {
                          const next = page.experiences.find(
                            (item) => item.id === event.target.value,
                          )!;
                          setSelectedId(next.id);
                          if (!next.durationOptions.includes(hours)) {
                            setHours(next.featuredHours);
                          }
                          reset();
                        }}
                      >
                        {page.experiences.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <fieldset>
                      <legend className="mb-3 text-sm font-semibold">
                        {page.copy.bookingHoursLabel}
                      </legend>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {selected.durationOptions.map((value) => (
                          <label key={value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="duration"
                              value={value}
                              checked={hours === value}
                              onChange={() => {
                                setHours(value);
                                reset();
                              }}
                              className="peer sr-only"
                            />
                            <span className="flex min-h-12 items-center justify-center rounded-lg border border-sand peer-checked:bg-primary-dark peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                              {value} h
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block text-sm font-semibold">
                        {page.copy.date}
                        <input
                          required
                          type="date"
                          value={date}
                          className={fieldClass}
                          onChange={(event) => {
                            setDate(event.target.value);
                            reset();
                          }}
                        />
                      </label>
                      <label className="block text-sm font-semibold">
                        {page.copy.guests}
                        <input
                          required
                          type="number"
                          min="1"
                          max={selected.capacity}
                          step="1"
                          value={guests}
                          className={fieldClass}
                          onChange={(event) => setGuests(event.target.value)}
                        />
                      </label>
                    </div>
                    {quote && (
                      <>
                        <p className="text-sm">
                          {labels.capacity}: {quote.capacity}
                        </p>
                        {quote.slots.length === 0 ? (
                          <p role="status">{labels.noSlots}</p>
                        ) : (
                          <>
                            <label className="block text-sm font-semibold">
                              {labels.time}
                              <select
                                required
                                value={startTime}
                                className={fieldClass}
                                onChange={(event) =>
                                  setStartTime(event.target.value)
                                }
                              >
                                <option value="">{labels.choose}</option>
                                {quote.slots.map((slot) => (
                                  <option
                                    key={slot.startTime}
                                    value={slot.startTime}
                                  >
                                    {slot.startTime} – {slot.endTime}
                                  </option>
                                ))}
                              </select>
                            </label>
                            {(
                              [
                                ["fullName", labels.name, "text"],
                                ["email", labels.email, "email"],
                                ["phone", labels.phone, "tel"],
                              ] as const
                            ).map(([key, label, type]) => (
                              <label
                                key={key}
                                className="block text-sm font-semibold"
                              >
                                {label}
                                <input
                                  required
                                  type={type}
                                  autoComplete={
                                    key === "fullName"
                                      ? "name"
                                      : key === "phone"
                                        ? "tel"
                                        : "email"
                                  }
                                  value={customer[key]}
                                  className={fieldClass}
                                  onChange={(event) =>
                                    setCustomer({
                                      ...customer,
                                      [key]: event.target.value,
                                    })
                                  }
                                />
                              </label>
                            ))}
                            <p className="text-sm font-medium leading-7">
                              {page.cancellationPolicy.summary}
                            </p>
                            <p className="text-sm leading-7">
                              {simulation
                                ? labels.conditions
                                : labels.termsLive}
                            </p>
                            <label className="flex items-start gap-3 text-sm leading-6">
                              <input
                                type="checkbox"
                                required
                                checked={acceptedTerms}
                                onChange={(event) =>
                                  setAcceptedTerms(event.target.checked)
                                }
                                className="mt-1 size-5 shrink-0"
                              />
                              {labels.terms}
                            </label>
                          </>
                        )}
                      </>
                    )}
                    <Button
                      disabled={!actions}
                      type="submit"
                      variant="accent"
                      shape="pill"
                      className="w-full"
                    >
                      {busy
                        ? labels.loading
                        : quote?.slots.length
                          ? labels.continue
                          : labels.check}
                    </Button>
                  </fieldset>
                </form>
              )}
            </div>
            <section
              aria-labelledby="booking-summary-title"
              className="overflow-hidden rounded-2xl border border-sand bg-white"
            >
              <div className="aspect-[16/10]">
                <MarketingImageFrame
                  image={marketingImage(selected.imageSlug, selected.title)}
                  priority
                />
              </div>
              <div className="p-7">
                <h2
                  id="booking-summary-title"
                  className="text-2xl font-semibold"
                >
                  {selected.title}
                </h2>
                <dl className="mt-5 space-y-4" aria-live="polite">
                  <div className="flex justify-between gap-3">
                    <dt>{page.copy.duration}</dt>
                    <dd className="font-semibold">
                      {hours} {hours === 1 ? page.copy.hour : page.copy.hours}
                    </dd>
                  </div>
                  {quote ? (
                    [
                      [labels.total, quote.totalMinor],
                      [labels.deposit, quote.depositMinor],
                      [labels.remaining, quote.remainingMinor],
                    ].map(([label, amount]) => (
                      <div
                        key={String(label)}
                        className="flex justify-between gap-3 border-t border-sand pt-4"
                      >
                        <dt>{label}</dt>
                        <dd className="font-semibold">
                          {money(Number(amount))}
                        </dd>
                      </div>
                    ))
                  ) : (
                    <div>
                      <dt>{labels.total}</dt>
                      <dd className="mt-2 text-text-muted">{labels.check}</dd>
                    </div>
                  )}
                </dl>
                <a
                  href={selected.href}
                  className="mt-7 inline-block py-2 text-sm font-semibold text-primary-dark underline underline-offset-4"
                >
                  ← {page.copy.back}
                </a>
              </div>
            </section>
          </div>
        </Container>
      </section>
    </SeoSiteShell>
  );
}
