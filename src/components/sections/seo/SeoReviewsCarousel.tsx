"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Review = {
  id: string;
  platform: string;
  url: string;
  author: string;
  authorUrl: string;
  text: string;
  language: string;
  languageLabel: string;
  translation: string;
  translationLanguage: string;
  isTranslated: boolean;
};

type ReviewLabels = {
  readLabel: string;
  translationLabel: string;
  originalLabel: string;
  showOriginalLabel: string;
  showTranslationLabel: string;
};

function ReviewCard({
  review,
  labels,
  compact,
}: {
  review: Review;
  labels: ReviewLabels;
  compact: boolean;
}) {
  const [original, setOriginal] = useState(false);
  const contentId = useId();
  const showOriginal = original || !review.isTranslated;
  return (
    <figure
      className={`relative flex w-full flex-col rounded-2xl bg-white ${compact ? "border border-sand/60 p-5" : "p-6 sm:p-7"}`}
    >
      <div className={`${compact ? "mb-3" : "mb-5"} flex gap-1 text-amber-600`}>
        <span className="sr-only">5 / 5</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="h-4 w-4 fill-current"
            aria-hidden="true"
          />
        ))}
      </div>
      <div id={contentId} className="flex-1">
        <p className="mb-3 text-xs text-text-muted">
          {showOriginal
            ? `${labels.originalLabel} · ${review.languageLabel}`
            : labels.translationLabel}
        </p>
        <blockquote
          cite={review.url}
          lang={showOriginal ? review.language : review.translationLanguage}
          className={
            compact
              ? "text-sm leading-7 text-text"
              : "text-lg leading-8 text-text"
          }
        >
          «{showOriginal ? review.text : review.translation}»
        </blockquote>
      </div>
      {review.isTranslated && (
        <button
          type="button"
          aria-controls={contentId}
          onClick={() => setOriginal(!original)}
          className="mt-3 min-h-11 self-start text-left text-xs text-text-muted underline underline-offset-4 hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {original ? labels.showTranslationLabel : labels.showOriginalLabel}
        </button>
      )}
      <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-1">
        <a
          href={review.authorUrl}
          className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {review.author}
        </a>
        <a
          href={review.url}
          className="inline-flex min-h-11 items-center gap-2 text-xs text-text-muted underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span className="sr-only">{labels.readLabel} </span>
          {review.platform}
          <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

export function SeoReviewsCarousel({
  reviews,
  label,
  previousLabel,
  nextLabel,
  compact = false,
  ...labels
}: ReviewLabels & {
  reviews: Review[];
  compact?: boolean;
  label: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({
    first: 1,
    last: 1,
    previous: false,
    next: false,
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const card = element.firstElementChild;
      const step = card
        ? card.getBoundingClientRect().width + 20
        : element.clientWidth;
      const first = Math.round(element.scrollLeft / step) + 1;
      const visible = Math.max(
        1,
        Math.floor((element.clientWidth + 21) / step),
      );
      setPosition({
        first,
        last: Math.min(reviews.length, first + visible - 1),
        previous: element.scrollLeft > 2,
        next:
          element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, [reviews.length]);

  function move(direction: number) {
    const element = track.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + 20),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <div className={compact ? "mt-6 min-w-0" : "mt-10 min-w-0 sm:mt-12"}>
      <ul
        ref={track}
        id={id}
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            event.currentTarget.scrollTo({
              left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth,
              behavior: "instant",
            });
          }
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain rounded-2xl pb-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark"
      >
        {reviews.map((review) => (
          <li
            key={review.id}
            className={
              compact
                ? "flex w-[92%] shrink-0 snap-start sm:w-[calc((100%-20px)/2)]"
                : "flex w-[92%] shrink-0 snap-start md:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)]"
            }
          >
            <ReviewCard review={review} labels={labels} compact={compact} />
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-center gap-4 sm:justify-end">
        <Button
          variant="secondary"
          shape="pill"
          aria-label={previousLabel}
          aria-controls={id}
          disabled={!position.previous}
          onClick={() => move(-1)}
          className="h-11 w-11 p-0"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <p
          className="min-w-16 text-center text-xs tabular-nums text-text-muted"
          aria-live="polite"
          aria-atomic="true"
        >
          {position.first}
          {position.last > position.first ? `–${position.last}` : ""} /{" "}
          {reviews.length}
        </p>
        <Button
          variant="secondary"
          shape="pill"
          aria-label={nextLabel}
          aria-controls={id}
          disabled={!position.next}
          onClick={() => move(1)}
          className="h-11 w-11 p-0"
        >
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
