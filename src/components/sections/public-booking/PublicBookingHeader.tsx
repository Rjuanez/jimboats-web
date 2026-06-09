import { LockKeyhole, X } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { getPublicDictionary } from "@/i18n/public";

import { PublicBookingStepIndicator } from "./PublicBookingStepIndicator";
import type {
  PublicBookingContent,
  PublicBookingStepId,
} from "./PublicBookingTypes";

type PublicBookingHeaderProps = {
  content: PublicBookingContent;
  currentStepId: PublicBookingStepId;
};

export function PublicBookingHeader({
  content,
  currentStepId,
}: PublicBookingHeaderProps) {
  const copy = getPublicDictionary(content.locale).booking.header;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-sand/30 bg-white shadow-soft">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3 md:min-h-24 md:py-6">
        <a
          className="inline-flex min-h-12 min-w-0 items-center text-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text"
          href={content.homeHref}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="JimBoats Charter"
            className="h-10 w-auto max-w-[150px] object-contain md:h-12 md:max-w-[190px]"
            height={514}
            src="/images/brand/jimboats-charter-wordmark.svg"
            width={922}
          />
        </a>

        <nav
          aria-label={copy.navLabel}
          className="hidden items-center gap-10 md:flex"
        >
          <a
            className="text-sm font-semibold uppercase tracking-widest text-text-muted transition hover:text-text"
            href={`${content.homeHref}#experiences`}
          >
            {copy.navExperiences}
          </a>
          <a
            className="text-sm font-semibold uppercase tracking-widest text-text-muted transition hover:text-text"
            href={`${content.homeHref}#how-it-works`}
          >
            {copy.navHowItWorks}
          </a>
          <a
            className="text-sm font-semibold uppercase tracking-widest text-text-muted transition hover:text-text"
            href={`${content.homeHref}#reviews`}
          >
            {copy.navReviews}
          </a>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted sm:inline-flex">
            <LockKeyhole aria-hidden="true" className="size-4 text-primary" />
            {copy.secure}
          </span>
          <LanguageSwitcher variant="solid" />
          <Button
            className="hidden md:inline-flex"
            href={content.homeHref}
            shape="pill"
            size="lg"
            variant="dark"
          >
            {copy.backHome}
          </Button>
          <a
            aria-label={copy.closeLabel}
            className="inline-flex size-10 items-center justify-center rounded-full text-text-muted transition hover:bg-sand/25 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text md:hidden"
            href={content.homeHref}
          >
            <X aria-hidden="true" className="size-5" />
          </a>
        </div>
      </Container>

      <div className="border-t border-sand/20 px-4 pb-3 pt-1 md:hidden">
        <PublicBookingStepIndicator
          currentStepId={currentStepId}
          steps={content.steps}
          variant="compact"
        />
      </div>
    </header>
  );
}
