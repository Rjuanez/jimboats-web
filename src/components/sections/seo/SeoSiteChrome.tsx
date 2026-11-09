import { legalCopy } from "@/content/marketing/legal";
import { privacyPages, privacyPath } from "@/content/privacy/routes";
import { termsPages, termsPath } from "@/content/booking/termsRoutes";
import styles from "./WhatsAppFloat.module.css";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { cn } from "@/design/variants";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import type { MarketingPage } from "@/content/marketing";

export function SeoHeader({
  page,
  hero = false,
}: {
  page: MarketingPage;
  hero?: boolean;
}) {
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-4 focus:text-text"
        href="#main"
      >
        {page.copy.skip}
      </a>
      <header
        aria-label="JimBoats Charter"
        className={cn(
          "z-40",
          hero
            ? "absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent text-white"
            : "relative border-b border-sand/60 bg-background text-text",
        )}
      >
        <Container className="flex min-h-16 items-center justify-between gap-2 py-2 lg:min-h-24 lg:flex-wrap lg:gap-x-5 lg:gap-y-3 lg:py-4">
          <a
            href={`/${page.locale}`}
            aria-label="JimBoats Charter"
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/jimboats-charter-wordmark.svg"
              alt="JimBoats Charter"
              width="922"
              height="514"
              className={cn(
                "h-12 w-20 object-contain sm:h-14 sm:w-28",
                hero && "invert",
              )}
            />
          </a>
          <nav aria-label={page.copy.menu} className="hidden lg:block">
            <ul className="flex flex-wrap gap-7 text-sm font-semibold">
              {page.navigation.map((link) => (
                <li key={link.href}>
                  <a
                    className="border-b border-transparent py-2 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-4"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label={page.copy.language}>
              <ul className="flex flex-wrap gap-0.5">
                {page.languages.map((link) => (
                  <li key={link.locale}>
                    <a
                      href={link.href}
                      hrefLang={link.locale}
                      lang={link.locale}
                      aria-current={link.active ? "page" : undefined}
                      className={`inline-flex min-h-10 min-w-9 items-center justify-center rounded-full text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${link.active ? (hero ? "bg-white text-primary-dark" : "bg-primary-dark text-white") : hero ? "text-white hover:bg-white/20" : "text-text hover:bg-sand/50"}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Button
              href={`/${page.locale}#experiences`}
              variant="accent"
              shape="pill"
              size="sm"
              className="hidden xl:inline-flex"
            >
              {page.copy.book}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </header>
    </>
  );
}

export function SeoFooter({ page }: { page: MarketingPage }) {
  return (
    <footer
      aria-label="JimBoats Charter"
      className="border-t border-sand bg-background py-16 text-text lg:py-24"
    >
      <Container>
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-5xl">JimBoats</p>
            <p className="mt-5 max-w-xs leading-7 text-text-muted">
              {page.copy.footerText}
            </p>
            <a
              href={page.operator.instagram}
              className="mt-5 inline-flex min-h-11 items-center underline underline-offset-4"
            >
              Instagram ↗
            </a>
          </div>
          <nav aria-label={page.copy.nav[0]}>
            <h2 className="text-lg font-semibold">{page.copy.nav[0]}</h2>
            <ul className="mt-5 space-y-3">
              {page.experiences.map((item) => (
                <li key={item.id}>
                  <a
                    className="inline-block py-1 text-sm underline-offset-4 hover:underline"
                    href={item.href}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-lg font-semibold">JimBoats Charter</h2>
            <address className="mt-5 space-y-3 text-sm not-italic">
              <p>{page.operator.address}</p>
              <p>
                <a href={page.operator.phoneLink}>{page.operator.phone}</a>
              </p>
              <p>
                <a href={`mailto:${page.operator.email}`}>
                  {page.operator.email}
                </a>
              </p>
            </address>
            <nav
              aria-label={page.copy.aboutLink}
              className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm"
            >
              {page.infoLinks.map((link) => (
                <a
                  key={link.href}
                  className="underline underline-offset-4"
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <p className="mt-12 border-t border-sand pt-6 text-xs text-text-muted">
          © 2026 {page.operator.legalName} · NIF {page.operator.taxId}
          <a
            className="ml-4 inline-block py-2 underline underline-offset-4"
            href={`/${page.locale}/legal`}
          >
            {legalCopy[page.locale][0]}
          </a>
          <a
            className="ml-4 inline-block py-2 underline underline-offset-4"
            href={privacyPath(page.locale)}
          >
            {privacyPages[page.locale].label}
          </a>
          <a
            className="ml-4 inline-block py-2 underline underline-offset-4"
            href={termsPath(page.locale)}
          >
            {termsPages[page.locale].label}
          </a>
        </p>
      </Container>
    </footer>
  );
}

export function SeoSiteShell({
  page,
  children,
  preview = false,
  hero = false,
}: {
  page: MarketingPage;
  children: ReactNode;
  preview?: boolean;
  hero?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen bg-background",
        page.detail && "pb-24 lg:pb-0",
      )}
    >
      <SeoHeader page={page} hero={hero} />
      <main id="main" lang={page.locale}>
        {children}
      </main>
      {preview && (
        <aside
          aria-label={page.copy.preview}
          className="border-b border-sand bg-sand/30 px-4 py-2 text-center text-xs text-text"
        >
          {page.copy.preview}
        </aside>
      )}
      <SeoFooter page={page} />
      <nav aria-label={page.copy.whatsapp}>
        <a
          href={page.operator.whatsapp}
          aria-label={page.copy.whatsapp}
          title={page.copy.whatsapp}
          className={cn(
            styles.button,
            page.detail ? "bottom-28 lg:bottom-5" : "bottom-5",
            "fixed right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark sm:h-[70px] sm:w-[70px]",
          )}
        >
          <WhatsAppIcon className="h-9 w-9" />
        </a>
      </nav>
    </div>
  );
}
