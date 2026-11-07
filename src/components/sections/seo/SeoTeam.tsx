import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { marketingImage, type MarketingPage } from "@/content/marketing";
import { crewCopy, profilePath } from "@/content/marketing/crew";
import { skippers } from "@/content/marketing/skippers";
import { marketingPath } from "@/content/marketing/routes";

export function SeoTeam({ page }: { page: MarketingPage }) {
  const copy = crewCopy[page.locale];
  return (
    <>
      <div className="overflow-hidden rounded-3xl aspect-[4/3] sm:aspect-[2/1] lg:aspect-[5/2]">
        <MarketingImageFrame
          image={marketingImage("jimboats-crew", copy.photo)}
          imgClassName="object-[center_64%]"
          priority
        />
      </div>
      <section>
        <h2 className="mb-7 font-display text-4xl">{copy.crew}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {skippers.map((person) => (
            <article
              key={person.id}
              id={person.id}
              className="grid items-center gap-5 border-t border-sand pt-5 sm:grid-cols-[1fr_1.35fr]"
            >
              <div className="aspect-[4/5] max-w-64 overflow-hidden rounded-2xl">
                <MarketingImageFrame
                  image={marketingImage(person.photo, person.name)}
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {copy.role}
                </p>
                <h3 className="my-3 font-display text-3xl">{person.name}</h3>
                <p>{copy[person.key]}</p>
                <a
                  className="mt-4 inline-block font-semibold text-primary-dark underline underline-offset-4"
                  href={profilePath(page.locale, person.id)}
                >
                  {copy.profile} {person.name.split(" ")[0]} ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <a
        href={marketingPath(page.locale) + "#experiences"}
        className="inline-flex rounded-full bg-primary-dark px-6 py-3 font-semibold text-white"
      >
        {page.copy.book}
      </a>
    </>
  );
}
