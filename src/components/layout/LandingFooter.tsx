import { Camera, Share2 } from "lucide-react";

import { cn } from "@/design/variants";

import { Container } from "./Container";

type FooterLink = {
  href: string;
  label: string;
};

type SocialLink = FooterLink & {
  network: "facebook" | "instagram";
};

type LandingFooterProps = {
  brand: string;
  contact: {
    email: string;
    phone: string;
    place: string;
  };
  copyright: string;
  description: string;
  experienceLinks: readonly FooterLink[];
  legalLinks: readonly FooterLink[];
  socialLinks: readonly SocialLink[];
};

const socialIcons = {
  facebook: Share2,
  instagram: Camera,
} as const;

export function LandingFooter({
  brand,
  contact,
  copyright,
  description,
  experienceLinks,
  legalLinks,
  socialLinks,
}: LandingFooterProps) {
  return (
    <footer
      className="border-t border-sand/25 bg-white py-12 text-text lg:py-24"
      id="contact"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="font-display text-4xl leading-none lg:text-5xl">
              {brand}
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-text-muted lg:text-lg">
              {description}
            </p>
            <div className="mt-7 flex gap-3">
              {socialLinks.map((link) => {
                const Icon = socialIcons[link.network];

                return (
                  <a
                    aria-label={link.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand/35 bg-background text-text transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
                    data-analytics-event="social_link_clicked"
                    data-analytics-social-network={link.network}
                    href={link.href}
                    key={link.label}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <nav
            aria-label="Experience links"
            className="lg:col-span-3 lg:col-start-7"
          >
            <h2 className="font-display text-3xl text-text">Experiences</h2>
            <ul className="mt-5 space-y-3 text-sm text-text-muted lg:text-base">
              {experienceLinks.map((link) => (
                <li key={link.href}>
                  <a className="transition hover:text-text" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic lg:col-span-3">
            <h2 className="font-display text-3xl text-text">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-text-muted lg:text-base">
              <li>{contact.place}</li>
              <li>
                <a
                  data-analytics-contact-method="phone"
                  data-analytics-event="contact_link_clicked"
                  href={`tel:${contact.phone.replaceAll(" ", "")}`}
                >
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  data-analytics-contact-method="email"
                  data-analytics-event="contact_link_clicked"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-sand/30 pt-6 text-center text-xs text-text-muted sm:flex-row sm:justify-between sm:text-left">
          <p>{copyright}</p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <a
                className={cn("transition hover:text-text")}
                href={link.href}
                key={link.label}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
