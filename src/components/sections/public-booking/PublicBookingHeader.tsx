import { LockKeyhole, X } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

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
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-sand/30 bg-white shadow-soft">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3 md:min-h-24 md:py-6">
        <a
          className="font-display text-3xl leading-none tracking-wide text-text md:text-4xl"
          href={content.homeHref}
        >
          {content.brand}
        </a>

        <nav
          aria-label="Booking page links"
          className="hidden items-center gap-10 md:flex"
        >
          <a
            className="text-sm font-semibold uppercase tracking-widest text-text-muted transition hover:text-text"
            href={`${content.homeHref}#experiences`}
          >
            Experiences
          </a>
          <a
            className="text-sm font-semibold uppercase tracking-widest text-text-muted transition hover:text-text"
            href={`${content.homeHref}#how-it-works`}
          >
            How it Works
          </a>
          <a
            className="text-sm font-semibold uppercase tracking-widest text-text-muted transition hover:text-text"
            href={`${content.homeHref}#reviews`}
          >
            Reviews
          </a>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted sm:inline-flex">
            <LockKeyhole aria-hidden="true" className="size-4 text-primary" />
            Secure
          </span>
          <Button
            className="hidden md:inline-flex"
            href={content.homeHref}
            shape="pill"
            size="lg"
            variant="dark"
          >
            Back to home
          </Button>
          <a
            aria-label="Close booking and return to JimBoats"
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
