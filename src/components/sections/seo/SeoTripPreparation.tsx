import type { MarketingPage } from "@/content/marketing";
import { Button } from "@/components/ui/Button";

export function SeoTripPreparation({ page }: { page: MarketingPage }) {
  const planning = page.planning;
  return (
    <section
      id="before-boarding"
      aria-labelledby="trip-preparation-title"
      className="scroll-mt-24"
    >
      <h2
        id="trip-preparation-title"
        className="font-display text-3xl sm:text-4xl"
      >
        {planning.preparationTitle}
      </h2>
      <dl className="mt-6 max-w-3xl divide-y divide-sand">
        {planning.questions.map(([question, answer]) => (
          <div key={question} className="py-5 first:pt-0">
            <dt className="font-semibold leading-7 text-primary-dark">
              {question}
            </dt>
            <dd className="mt-2 leading-7 text-text-muted">{answer}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          href={page.operator.whatsapp}
          variant="primary"
          size="lg"
          shape="pill"
          className="whitespace-normal text-center"
        >
          {planning.contact}
        </Button>
        {page.key !== "prices" && (
          <Button
            href={planning.pricesHref}
            variant="secondary"
            size="lg"
            shape="pill"
            className="whitespace-normal text-center"
          >
            {planning.compare}
          </Button>
        )}
      </div>
    </section>
  );
}
