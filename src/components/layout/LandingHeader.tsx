"use client";

import { Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/design/variants";

import { Container } from "./Container";
import { LanguageSwitcher } from "./LanguageSwitcher";

type LandingHeaderLink = {
  href: string;
  label: string;
};

type LandingBrandMark = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

type LandingHeaderProps = {
  brand: string;
  brandMark?: LandingBrandMark;
  cta: LandingHeaderLink;
  homeHref: string;
  navigation: readonly LandingHeaderLink[];
};

export function LandingHeader({
  brand,
  brandMark,
  cta,
  homeHref,
  navigation,
}: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderTone = () => {
      setScrolled(window.scrollY > 60);
    };

    updateHeaderTone();
    window.addEventListener("scroll", updateHeaderTone, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderTone);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 py-4 transition-colors duration-300 lg:py-6",
          scrolled
            ? "border-b border-sand/40 bg-background/95 shadow-soft backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <Container className="flex min-h-12 items-center justify-between gap-4">
          <a
            className={cn(
              "inline-flex min-h-12 min-w-0 items-center text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
              scrolled && "text-text focus-visible:outline-text",
            )}
            href={homeHref}
          >
            {brandMark ? (
              // The SVG wordmark needs raw img rendering so CSS filters and sizing
              // stay identical between the transparent and scrolled header states.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={brandMark.alt}
                className={cn(
                  "h-10 w-auto max-w-[150px] object-contain transition duration-300 sm:max-w-[190px] lg:h-12 lg:max-w-[220px]",
                  scrolled ? "invert-0" : "invert",
                )}
                height={brandMark.height}
                src={brandMark.src}
                width={brandMark.width}
              />
            ) : (
              <span className="font-display text-3xl leading-none lg:text-4xl">
                {brand}
              </span>
            )}
          </a>

          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-sm font-semibold uppercase">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    className={cn(
                      "text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
                      scrolled &&
                        "text-text-muted hover:text-text focus-visible:outline-text",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              className="hidden sm:inline-flex"
              data-analytics-cta-location="header"
              data-analytics-event="booking_cta_clicked"
              href={cta.href}
              shape="pill"
              size="sm"
              variant={scrolled ? "accent" : "glass"}
            >
              {cta.label}
            </Button>
            <Suspense fallback={null}>
              <LanguageSwitcher variant={scrolled ? "solid" : "glass"} />
            </Suspense>
            <button
              aria-label="Open menu"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden",
                scrolled &&
                  "border-sand/40 bg-white text-text focus-visible:outline-text",
              )}
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </header>

      {menuOpen ? (
        <div
          aria-label="Mobile navigation"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col bg-background px-7 pb-10 pt-16"
          role="dialog"
        >
          <button
            aria-label="Close menu"
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sand/35 text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            onClick={closeMenu}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
          <span className="mb-12 font-display text-4xl text-text">{brand}</span>
          <nav aria-label="Mobile menu" className="flex flex-1 flex-col gap-8">
            {navigation.map((item) => (
              <a
                className="font-display text-4xl leading-none text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text"
                href={item.href}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Suspense fallback={null}>
            <LanguageSwitcher
              className="mb-4"
              onNavigate={closeMenu}
              variant="solid"
            />
          </Suspense>
          <Button
            data-analytics-cta-location="mobile_menu"
            data-analytics-event="booking_cta_clicked"
            href={cta.href}
            shape="pill"
            size="xl"
            variant="accent"
          >
            {cta.label}
          </Button>
        </div>
      ) : null}
    </>
  );
}
