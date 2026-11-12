"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ShieldCheck } from "lucide-react";
import { PublicCheckboxField } from "@/components/forms/PublicBookingFormControls";
import { Button } from "@/components/ui/Button";
import type { MarketingLocale } from "@/content/marketing/routes";
import { bookingPrivacyCopy } from "@/i18n/bookingPrivacy";

// Preview choices are deliberately separate from any future live consent record.
export const bookingPrivacyPreviewKey = "jimboats_booking_privacy_preview_v1";

const WhatsAppMeasurementContext = createContext<() => void>(() => {});
export function useBookingWhatsAppMeasurement() {
  return useContext(WhatsAppMeasurementContext);
}

type BookingAdsActions = {
  saveChoice(input: {
    advertising: boolean;
    oppref: string | null;
  }): Promise<{ ok: boolean }>;
  whatsappClick(locale: string): Promise<void>;
};

export function BookingPrivacyPreferences({
  children,
  locale,
  privacyHref,
  initialChoice = null,
  measurement,
}: {
  children: ReactNode;
  locale: MarketingLocale;
  privacyHref: string;
  initialChoice?: boolean | null;
  measurement?: BookingAdsActions;
}) {
  const copy = bookingPrivacyCopy[locale];
  const saved = useSyncExternalStore(
    subscribeToPreferences,
    measurement ? () => initialChoice : readPreferences,
    () => (measurement ? initialChoice : null),
  );
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const savingRef = useRef(false);
  const [memoryChoice, setMemoryChoice] = useState<boolean | null>(null);
  const [reopened, setReopened] = useState(false);
  const choice = memoryChoice ?? saved;
  const open = choice === null || reopened;
  const [configuring, setConfiguring] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const banner = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const preferencesButton = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    const element = banner.current;
    if (!open || !element) return;
    const measure = () =>
      setBannerHeight(Math.ceil(element.getBoundingClientRect().height));
    if (typeof ResizeObserver === "undefined") {
      const frame = requestAnimationFrame(measure);
      return () => cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, configuring, locale]);

  async function choose(allowed: boolean) {
    if (savingRef.current) return;
    setSaveFailed(false);
    if (measurement) {
      savingRef.current = true;
      setSaving(true);
      setReopened(true);
      // No optional events while the server is saving, including withdrawal.
      setMemoryChoice(false);
      try {
        // Read attribution only after an affirmative choice. Never persist it in the browser.
        const raw = allowed
          ? new URLSearchParams(window.location.search).get("oppref")
          : null;
        const oppref = raw && raw.length <= 500 ? raw : null;
        const result = await measurement.saveChoice({
          advertising: allowed,
          oppref,
        });
        if (!result.ok) throw new Error("Consent was not saved.");
      } catch {
        setSaveFailed(true);
        setReopened(true);
        return;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    }

    setAdvertising(allowed);
    try {
      if (!measurement)
        sessionStorage.setItem(
          bookingPrivacyPreviewKey,
          JSON.stringify({ version: 1, advertising: allowed }),
        );
    } catch {
      // A storage failure must not block the reservation.
    }
    setMemoryChoice(allowed);
    setReopened(false);
    setConfiguring(false);
    requestAnimationFrame(() =>
      preferencesButton.current?.focus({ preventScroll: true }),
    );
  }

  function showPreferences() {
    setAdvertising(choice ?? false);
    setReopened(true);
    setConfiguring(true);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }

  const style = {
    paddingBottom: open ? bannerHeight : 0,
  };

  return (
    <div
      className="group/booking-privacy"
      data-privacy-open={open}
      style={style}
    >
      <WhatsAppMeasurementContext.Provider
        value={() => {
          if (measurement && choice === true && !savingRef.current) {
            void measurement.whatsappClick(locale).catch(() => {});
          }
        }}
      >
        {children}
      </WhatsAppMeasurementContext.Provider>
      <div
        className={`px-5 pt-4 text-center lg:pb-6 ${open ? "pb-6" : "pb-56"}`}
      >
        <button
          ref={preferencesButton}
          type="button"
          className="min-h-11 rounded px-3 text-sm font-medium text-text underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-controls={`${id}-notice`}
          aria-expanded={open}
          onClick={showPreferences}
        >
          {copy.preferences}
        </button>
      </div>
      {open ? (
        <section
          ref={banner}
          id={`${id}-notice`}
          aria-labelledby={`${id}-title`}
          className={`fixed inset-x-0 bottom-0 z-50 overflow-y-auto overscroll-contain border-t border-sand/60 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-text shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] sm:px-6 lg:py-5 ${configuring ? "max-h-[75dvh]" : "max-h-[55dvh]"}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 shrink-0 text-primary"
              />
              <h2
                ref={heading}
                tabIndex={-1}
                id={`${id}-title`}
                className="text-base font-semibold focus:outline-none"
              >
                {configuring ? copy.preferences : copy.title}
              </h2>
            </div>
            {saveFailed ? (
              <p role="alert" className="mt-2 text-sm text-text">
                {copy.saveError}
              </p>
            ) : null}
            {!configuring ? (
              <div className="mt-2 lg:flex lg:items-end lg:gap-8">
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 text-text-muted">
                    {copy.description}
                  </p>
                  <a
                    href={privacyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-9 items-center rounded text-xs font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
                  >
                    {copy.privacy}
                  </a>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-0 lg:min-w-96">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-full rounded-xl px-3 text-sm"
                    disabled={saving}
                    onClick={() => choose(true)}
                  >
                    {copy.accept}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-full rounded-xl px-3 text-sm"
                    disabled={saving}
                    onClick={() => choose(false)}
                  >
                    {copy.reject}
                  </Button>
                </div>
              </div>
            ) : (
              <div id={`${id}-settings`} className="mt-3 space-y-3">
                <div className="rounded-xl border border-sand/50 bg-background p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{copy.necessary}</h3>
                    <span className="text-xs text-text-muted">
                      {copy.alwaysActive}
                    </span>
                  </div>
                  <p className="mt-1 leading-5 text-text-muted">
                    {copy.necessaryDescription}
                  </p>
                </div>
                <PublicCheckboxField
                  checked={advertising}
                  label={copy.advertising}
                  name={`${id}-advertising`}
                  description={copy.advertisingDescription}
                  onChange={(event) =>
                    setAdvertising(event.currentTarget.checked)
                  }
                >
                  <span className="mt-2 block text-xs leading-5 text-text-muted">
                    {copy.provider}
                  </span>
                </PublicCheckboxField>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={privacyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-10 py-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
                  >
                    {copy.privacy}
                  </a>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="rounded-xl text-sm"
                      onClick={() => {
                        setConfiguring(false);
                        requestAnimationFrame(() =>
                          heading.current?.focus({
                            preventScroll: true,
                          }),
                        );
                      }}
                    >
                      {copy.back}
                    </Button>
                    <Button
                      variant="dark"
                      size="lg"
                      className="rounded-xl text-sm"
                      disabled={saving}
                      onClick={() => choose(advertising)}
                    >
                      {copy.save}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function readPreferences(): boolean | null {
  try {
    const stored = JSON.parse(
      sessionStorage.getItem(bookingPrivacyPreviewKey) ?? "null",
    );
    return stored?.version === 1 && typeof stored.advertising === "boolean"
      ? stored.advertising
      : null;
  } catch {
    return null;
  }
}

function subscribeToPreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
