import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { marketingPath } from "@/content/marketing/routes";
import type { MarketingPage } from "@/content/marketing";

const rowClass =
  "grid grid-cols-2 gap-x-5 gap-y-4 border-t border-sand/60 p-5 transition-colors hover:bg-background/60 md:table-row md:p-0";
const cellClass =
  "block text-sm leading-6 text-text-muted md:table-cell md:px-6 md:py-6";
const headClass =
  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-primary-dark";

export function SeoPricingTables({ page }: { page: MarketingPage }) {
  const copy = page.pricing;
  return (
    <section
      id="prices"
      aria-labelledby="pricing-title"
      className="scroll-mt-8 bg-background py-16 lg:py-24"
    >
      <Container>
        <div className="mb-10 max-w-3xl lg:mb-14">
          <h2
            id="pricing-title"
            className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-text-muted">
            {copy.intro}
          </p>
        </div>
        <h3
          id="experience-prices-title"
          className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-primary-dark"
        >
          {copy.experiences}
        </h3>
        <div className="overflow-hidden rounded-3xl border border-sand/70 bg-white shadow-soft">
          <table
            role="table"
            aria-labelledby="experience-prices-title"
            className="block w-full border-collapse md:table"
          >
            <thead
              role="rowgroup"
              className="sr-only bg-sky-light/60 md:not-sr-only md:table-header-group"
            >
              <tr role="row">
                <th scope="col" className={headClass}>
                  {page.copy.tableExperience}
                </th>
                <th scope="col" className={headClass}>
                  {copy.guests}
                </th>
                <th scope="col" className={headClass}>
                  {page.copy.tableDuration}
                </th>
                <th scope="col" className={headClass}>
                  {copy.price}
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="block md:table-row-group">
              {page.experiences.map((item) => (
                <tr role="row" key={item.id} className={rowClass}>
                  <th
                    scope="row"
                    role="rowheader"
                    className="col-span-2 block text-left md:table-cell md:w-[44%] md:px-6 md:py-6"
                  >
                    <a
                      href={item.href}
                      className="group inline-flex min-h-11 items-center gap-3 rounded-sm text-base font-semibold leading-6 text-primary-dark underline decoration-primary/20 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {item.title}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                      />
                    </a>
                  </th>
                  <td role="cell" className={cellClass}>
                    <span
                      aria-hidden="true"
                      className="mb-1 block text-xs md:hidden"
                    >
                      {copy.guests}
                    </span>
                    {item.capacityLabel}
                  </td>
                  <td role="cell" className={cellClass}>
                    <span
                      aria-hidden="true"
                      className="mb-1 block text-xs md:hidden"
                    >
                      {page.copy.tableDuration}
                    </span>
                    {item.durationLabel}
                  </td>
                  <td
                    role="cell"
                    className="col-span-2 flex items-baseline justify-between gap-4 border-t border-sand/40 pt-4 text-primary-dark md:table-cell md:whitespace-nowrap md:border-0 md:px-6 md:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className="text-xs text-text-muted md:hidden"
                    >
                      {copy.price}
                    </span>
                    <span className="text-lg font-semibold">
                      {item.formattedPrices[item.featuredHours]}{" "}
                      <span className="text-sm font-normal text-text-muted">
                        / {item.featuredHours} h
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a
          href={marketingPath(page.locale, "prices")}
          className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary-dark underline underline-offset-4"
        >
          {copy.allRates}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <p className="mt-4 max-w-3xl text-xs leading-6 text-text-muted">
          {copy.boatNote}
        </p>
        <h3
          id="extra-prices-title"
          className="mb-5 mt-12 text-sm font-semibold uppercase tracking-[0.16em] text-primary-dark"
        >
          {copy.extras}
        </h3>
        <div className="overflow-hidden rounded-3xl border border-sand/70 bg-white shadow-soft">
          <table
            role="table"
            aria-labelledby="extra-prices-title"
            className="block w-full border-collapse md:table"
          >
            <thead
              role="rowgroup"
              className="sr-only bg-sky-light/60 md:not-sr-only md:table-header-group"
            >
              <tr role="row">
                <th scope="col" className={headClass}>
                  {copy.extra}
                </th>
                <th scope="col" className={headClass}>
                  {copy.description}
                </th>
                <th scope="col" className={headClass}>
                  {copy.supplement}
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="block md:table-row-group">
              {copy.extrasRows.map((extra) => (
                <tr role="row" key={extra.name} className={rowClass}>
                  <th
                    scope="row"
                    role="rowheader"
                    className="col-span-2 block text-left text-base font-semibold leading-6 text-primary-dark md:table-cell md:w-[30%] md:px-6 md:py-6"
                  >
                    {extra.name}
                  </th>
                  <td
                    role="cell"
                    className={`${cellClass} col-span-2 md:w-[40%]`}
                  >
                    {extra.description}
                  </td>
                  <td
                    role="cell"
                    className="col-span-2 flex items-baseline justify-between gap-4 border-t border-sand/40 pt-4 md:table-cell md:border-0 md:px-6 md:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className="text-xs text-text-muted md:hidden"
                    >
                      {copy.supplement}
                    </span>
                    <span className="text-right text-sm font-semibold leading-6 text-primary-dark md:text-left">
                      {extra.price ? (
                        <>
                          +{extra.price}
                          <span className="ml-2 inline-block text-xs font-normal text-text-muted">
                            {copy.perBooking}
                          </span>
                        </>
                      ) : (
                        copy.consult
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-6 text-text-muted">
          {copy.extrasNote}
        </p>
      </Container>
    </section>
  );
}
