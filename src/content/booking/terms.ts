import { operator } from "../marketing/catalog";
import type { MarketingLocale } from "../marketing/routes";
import { cancellationPolicy } from "./cancellationPolicy";
import terms from "./terms.json";

export function getBookingTermsContent(locale: MarketingLocale) {
  const copy = terms[locale];
  const policy = cancellationPolicy.copy[locale];
  return {
    title: copy.title,
    operatorLabel: copy.operator,
    sections: [
      {
        title: copy.bookingTitle,
        paragraphs: [copy.booking, copy.includes, copy.payment],
      },
      {
        title: copy.cancellationTitle,
        paragraphs: [
          policy.cancellation,
          policy.noShow,
          policy.weather,
          policy.refund,
        ],
      },
      { title: copy.changesTitle, paragraphs: [copy.changes] },
      { title: copy.boardingTitle, paragraphs: [copy.boarding, copy.access] },
    ],
  };
}

export function getBookingTermsDocument(locale: MarketingLocale) {
  const { title, operatorLabel, sections } = getBookingTermsContent(locale);
  return [
    `${title} · JimBoats Charter`,
    `${cancellationPolicy.confirmedAt} · v${cancellationPolicy.version}`,
    [
      operatorLabel,
      `${operator.legalName} · NIF ${operator.taxId}`,
      operator.registeredAddress,
      operator.email,
      operator.phone,
      `WhatsApp: ${operator.phone}`,
    ].join("\n"),
    ...sections.map(({ title, paragraphs }) =>
      [title, ...paragraphs].join("\n\n"),
    ),
  ].join("\n\n");
}
