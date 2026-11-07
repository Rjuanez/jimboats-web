import { Star } from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";

import { SeoReviewsCarousel } from "./SeoReviewsCarousel";

export function SeoReviews({
  page,
  compact = false,
}: {
  page: MarketingPage;
  compact?: boolean;
}) {
  const Wrapper = compact ? "div" : Container;
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className={compact ? "min-w-0" : "bg-background py-20 lg:py-28"}
    >
      <Wrapper>
        <div className="mx-auto max-w-6xl">
          <div className={compact ? "" : "text-center"}>
            <h2
              id="reviews-title"
              className={
                compact
                  ? "max-w-xl text-balance font-display text-3xl leading-tight sm:text-4xl"
                  : "mx-auto max-w-xl text-balance font-display text-4xl leading-tight sm:text-5xl lg:text-6xl"
              }
            >
              {page.detail?.labels.reviews ?? page.copy.reviewsTitle}
            </h2>
            {page.detail && (
              <p
                className={
                  compact
                    ? "mt-4 text-sm leading-6 text-text-muted"
                    : "mx-auto mt-5 max-w-2xl text-sm leading-7 text-text-muted"
                }
              >
                {page.detail.reviewsContext}
              </p>
            )}
            <div
              className={`mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${compact ? "" : "justify-center"}`}
            >
              <div aria-hidden="true" className="flex gap-0.5 text-amber-600">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star key={value} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold">
                {page.reviews.ratingLabel} / 5
              </span>
              <p className="text-balance leading-8 text-text-muted">
                <span className="font-semibold text-text">
                  {page.reviews.totalCount}
                </span>{" "}
                {page.copy.reviewsCountLabel}{" "}
                {page.reviews.sources.map((source, index) => (
                  <Fragment key={source.name}>
                    <span className="inline-block whitespace-nowrap">
                      {index === page.reviews.sources.length - 1 &&
                        `${page.copy.reviewsAnd} `}
                      <a
                        href={source.url}
                        className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        {source.name} ({source.count})
                      </a>
                      {index < page.reviews.sources.length - 2 && ","}
                    </span>{" "}
                  </Fragment>
                ))}
              </p>
            </div>
          </div>
          <SeoReviewsCarousel
            compact={compact}
            reviews={page.reviews.excerpts}
            label={page.copy.reviewsExcerptLabel}
            readLabel={page.copy.reviewsReadLabel}
            previousLabel={page.copy.reviewsPreviousLabel}
            nextLabel={page.copy.reviewsNextLabel}
            translationLabel={page.copy.reviewsTranslationLabel}
            originalLabel={page.copy.reviewsOriginalLabel}
            showOriginalLabel={page.copy.reviewsShowOriginalLabel}
            showTranslationLabel={page.copy.reviewsShowTranslationLabel}
          />
        </div>
      </Wrapper>
    </section>
  );
}
import { Fragment } from "react";
