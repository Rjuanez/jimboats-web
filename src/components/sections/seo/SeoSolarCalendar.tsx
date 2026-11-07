import type { MarketingPage } from "@/content/marketing";

type SolarCalendar = NonNullable<
  NonNullable<MarketingPage["detail"]>["solarCalendar"]
>;

export function SeoSolarCalendar({ calendar }: { calendar: SolarCalendar }) {
  return (
    <section aria-labelledby="solar-calendar-title">
      <h2
        id="solar-calendar-title"
        className="border-l-4 border-primary-dark pl-4 font-display text-3xl leading-tight sm:text-4xl"
      >
        {calendar.title}
      </h2>
      <p className="mt-5 leading-8 text-text-muted">{calendar.copy.intro}</p>
      <div className="mt-7 overflow-hidden rounded-2xl border border-sand/70">
        <table
          className="w-full border-collapse text-sm"
          aria-labelledby="solar-calendar-title"
        >
          <thead className="bg-primary-dark text-white">
            <tr>
              <th
                scope="col"
                className="px-4 py-4 text-left font-semibold sm:px-6"
              >
                {calendar.copy.month}
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-right font-semibold sm:px-6"
              >
                {calendar.copy.time}
              </th>
            </tr>
          </thead>
          <tbody>
            {calendar.rows.map((row) => (
              <tr
                key={row.date}
                className="border-t border-sand/50 odd:bg-sky-light/30 even:bg-white"
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-medium capitalize text-text sm:px-6"
                >
                  {row.month}
                </th>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary-dark sm:px-6">
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-sm leading-7 text-text-muted">
        {calendar.copy.note}
      </p>
      <p className="mt-2 text-xs text-text-muted">
        {calendar.copy.source}:{" "}
        <a
          href={calendar.source}
          className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          MET Norway · CC BY 4.0
        </a>
      </p>
    </section>
  );
}
