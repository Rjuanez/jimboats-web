"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { hourlyLabels } from "@/content/booking/labels";
import type { MarketingLocale } from "@/content/marketing/routes";
import type {
  simulateHourlyPaymentAction,
  abandonHourlyCheckoutAction,
} from "@/interface/next/actions/hourlyBookingActions";

export type LocalBookingPaymentActions = {
  simulate: typeof simulateHourlyPaymentAction;
  abandon: typeof abandonHourlyCheckoutAction;
};

export function LocalBookingPayment({
  locale,
  sessionId,
  actions,
  onConfirmed,
  onAbandoned,
}: {
  locale: MarketingLocale;
  sessionId: string;
  actions: LocalBookingPaymentActions;
  onConfirmed: () => void;
  onAbandoned: () => void;
}) {
  const labels = hourlyLabels[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function run(confirm: boolean) {
    setBusy(true);
    setError(false);
    try {
      if (confirm) {
        const result = await actions.simulate(sessionId);
        if (!result.ok || result.value.action === "IGNORED") {
          setError(true);
          return;
        }
        onConfirmed();
      } else {
        const result = await actions.abandon(sessionId);
        if (!result.ok) {
          setError(true);
          return;
        }
        onAbandoned();
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5 p-6 sm:p-8">
      <p className="text-sm leading-7">{labels.conditions}</p>
      <p className="text-sm leading-7 text-text-muted">{labels.pending}</p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {labels.error}
        </p>
      )}
      <Button
        variant="accent"
        shape="pill"
        disabled={busy}
        onClick={() => void run(true)}
      >
        {labels.simulate}
      </Button>
      <button
        className="block min-h-11 text-sm underline underline-offset-4"
        type="button"
        disabled={busy}
        onClick={() => void run(false)}
      >
        {labels.back}
      </button>
    </div>
  );
}
