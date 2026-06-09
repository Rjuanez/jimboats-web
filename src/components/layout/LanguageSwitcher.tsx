"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/design/variants";
import {
  createLocalizedEquivalentPath,
  defaultLocale,
  parsePublicLocale,
  supportedLocales,
  type PublicLocale,
} from "@/i18n/locales";

type LanguageSwitcherProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: "glass" | "solid";
};

const localeLabels = {
  ca: "CA",
  en: "EN",
  es: "ES",
} satisfies Record<PublicLocale, string>;

export function LanguageSwitcher({
  className,
  onNavigate,
  variant = "solid",
}: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${defaultLocale}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const activeLocale =
    parsePublicLocale(pathname.split("/")[1] ?? "") ?? defaultLocale;
  const search = searchParams?.toString() ?? "";
  const localeLinks = useMemo(
    () =>
      supportedLocales.map((locale) => {
        const localizedPath = createLocalizedEquivalentPath(locale, pathname);
        const href = search ? `${localizedPath}?${search}` : localizedPath;

        return {
          active: locale === activeLocale,
          href,
          label: localeLabels[locale],
          locale,
        };
      }),
    [activeLocale, pathname, search],
  );

  useEffect(() => {
    for (const link of localeLinks) {
      if (!link.active) {
        router.prefetch(link.href);
      }
    }
  }, [localeLinks, router]);

  return (
    <nav aria-label="Language" className={cn("shrink-0", className)}>
      <ul
        className={cn(
          "flex items-center rounded-full border p-0.5 text-[11px] font-semibold uppercase tracking-widest",
          variant === "glass"
            ? "border-white/25 bg-white/10 text-white backdrop-blur-md"
            : "border-sand/45 bg-white text-text shadow-sm",
        )}
      >
        {localeLinks.map(({ active, href, label, locale }) => {
          const pending = !active && pendingHref === href;

          return (
            <li key={locale}>
              <Link
                aria-current={active ? "page" : undefined}
                aria-busy={pending ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-8 min-w-9 items-center justify-center rounded-full px-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  variant === "glass"
                    ? "focus-visible:outline-white"
                    : "focus-visible:outline-text",
                  active
                    ? variant === "glass"
                      ? "bg-white text-text"
                      : "bg-text text-white"
                    : variant === "glass"
                      ? "text-white/85 hover:bg-white/15 hover:text-white"
                      : "text-text-muted hover:bg-sand/25 hover:text-text",
                  pending &&
                    (variant === "glass"
                      ? "animate-pulse text-white"
                      : "animate-pulse text-accent-strong"),
                )}
                href={href}
                onClick={() => {
                  if (!active) {
                    setPendingHref(href);
                  }
                  onNavigate?.();
                }}
                onFocus={() => router.prefetch(href)}
                onMouseEnter={() => router.prefetch(href)}
                scroll={false}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
