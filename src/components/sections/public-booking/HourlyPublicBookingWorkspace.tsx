"use client";

import type { LocalBookingPaymentActions } from "./LocalBookingPayment";
import { useState } from "react";
import { PublicBookingWorkspace } from "./PublicBookingWorkspace";
import type {
  PublicBookingActions,
  PublicBookingContent,
} from "./PublicBookingTypes";

export function HourlyPublicBookingWorkspace({
  content,
  actions,
  stripePublishableKey,
  localPaymentActions,
}: {
  content: PublicBookingContent;
  actions: PublicBookingActions;
  stripePublishableKey: string;
  localPaymentActions?: LocalBookingPaymentActions;
}) {
  const [hours, setHours] = useState(content.hourly!.hours);
  const [month, setMonth] = useState("current");
  const rate = content.hourly!.rates.find((item) => item.hours === hours)!;
  const experience = content.experiences[0];
  const current: PublicBookingContent = {
    ...content,
    hourly: { ...content.hourly!, hours },
    experiences: [
      {
        ...experience,
        price: rate.price,
        depositAmount: rate.depositAmount,
        durationLabel: `${hours} h`,
      },
    ],
    languageLinks: content.languageLinks?.map((link) => ({
      ...link,
      href: link.href.replace(/hours=\d+/, `hours=${hours}`),
    })),
  };
  return (
    <PublicBookingWorkspace
      key={hours}
      availabilityMonth={month}
      onChangeMonth={setMonth}
      localPaymentActions={localPaymentActions}
      content={current}
      actions={actions}
      stripePublishableKey={stripePublishableKey}
      initialExperienceId={experience.id}
      onChangeHours={(value) => {
        if (!content.hourly!.rates.some((item) => item.hours === value)) return;
        const url = new URL(window.location.href);
        url.searchParams.set("hours", String(value));
        window.history.replaceState(null, "", url);
        setHours(value);
      }}
    />
  );
}
