import type { MarketingPage } from "@/content/marketing";
import { Button } from "@/components/ui/Button";

export function SeoDurationGuide({
  planning,
}: {
  planning: MarketingPage["planning"];
}) {
  const columns = [
    planning.duration,
    planning.includes,
    planning.chooseIf,
    planning.total,
  ];
  const cell =
    "block text-sm leading-6 text-text-muted md:table-cell md:px-5 md:py-6";
  return (
    <section
      id="choose-duration"
      aria-labelledby="duration-guide-title"
      className="scroll-mt-24"
    >
      <h2
        id="duration-guide-title"
        className="font-display text-3xl sm:text-4xl"
      >
        {planning.durationTitle}
      </h2>
      <p className="mb-6 mt-4 max-w-3xl leading-7 text-text-muted">
        {planning.durationIntro}
      </p>
      <div className="overflow-hidden rounded-2xl border border-sand bg-white">
        <table
          role="table"
          aria-labelledby="duration-guide-title"
          className="block w-full border-collapse md:table"
        >
          <thead
            role="rowgroup"
            className="sr-only bg-sky-light md:not-sr-only md:table-header-group"
          >
            <tr role="row">
              {columns.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-5 py-4 text-left text-sm font-semibold text-primary-dark"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup" className="block md:table-row-group">
            {planning.rows.map((row) => (
              <tr
                key={row.hours}
                role="row"
                className="grid gap-4 border-t border-sand p-5 first:border-t-0 md:table-row md:p-0"
              >
                <th
                  role="rowheader"
                  scope="row"
                  className="block text-left text-lg font-semibold text-primary-dark md:table-cell md:whitespace-nowrap md:px-5 md:py-6"
                >
                  {row.duration}
                </th>
                <td role="cell" className={cell}>
                  <span
                    aria-hidden="true"
                    className="mb-1 block text-xs font-semibold md:hidden"
                  >
                    {planning.includes}
                  </span>
                  {row.includes}
                </td>
                <td role="cell" className={cell}>
                  <span
                    aria-hidden="true"
                    className="mb-1 block text-xs font-semibold md:hidden"
                  >
                    {planning.chooseIf}
                  </span>
                  {row.reason}
                </td>
                <td
                  role="cell"
                  className="block border-t border-sand pt-4 md:table-cell md:border-0 md:px-5 md:py-6"
                >
                  <span
                    aria-hidden="true"
                    className="mb-1 block text-xs text-text-muted md:hidden"
                  >
                    {planning.total}
                  </span>
                  <strong className="block whitespace-nowrap text-xl text-primary-dark">
                    {row.price}
                  </strong>
                  <Button
                    href={row.href}
                    variant="primary"
                    size="lg"
                    shape="pill"
                    className="mt-3 w-full whitespace-normal text-center md:w-auto"
                  >
                    {row.action}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-text-muted">
        {planning.durationNote}
      </p>
    </section>
  );
}
