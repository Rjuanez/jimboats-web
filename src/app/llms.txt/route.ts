import { getMarketingPage } from "@/content/marketing";
import { operator } from "@/content/marketing/catalog";
import { marketingLocales, marketingPath } from "@/content/marketing/routes";
import { blogPath, getBlogCards } from "@/content/blog/catalog";
import { profilePath } from "@/content/marketing/crew";
import { skippers } from "@/content/marketing/skippers";

export const dynamic = "force-static";

function link(label: string, path: string) {
  return `[${label}](${operator.url}${path})`;
}

export function GET() {
  const page = getMarketingPage("en");
  const text = [
    "# JimBoats Charter",
    "",
    "> Private skippered boat trips from Port Olímpic, Barcelona, for groups of up to six guests. All fares below are final totals in EUR for the whole boat.",
    "",
    "## Company",
    `- Legal name: ${operator.legalName}. Spanish tax ID (NIF): ${operator.taxId}.`,
    `- Registered office (not the boarding point): ${operator.registeredAddress}.`,
    `- ${link("Company identification", "/en/legal")}`,
    "",
    "## Experiences and fares",
    ...page.experiences.map((trip) => {
      const rates = trip.durationOptions.map(
        (hours) => `${hours} h: EUR ${trip.prices[hours]}`,
      );
      return `- ${link(trip.title, trip.href)}: ${trip.confirmedPrice ? rates.join(", ") : "Price on request"}.`;
    }),
    "",
    page.pricing.boatNote,
    `All trips include use of the Bluetooth speaker. ${page.onboard.drinks} ${page.onboard.food}`,
    "",
    "## Optional extras",
    ...page.pricing.extrasRows.map(
      (extra) =>
        `- ${extra.name}: ${extra.priceMinor === null ? page.pricing.consult : `EUR ${extra.priceMinor / 100} ${page.pricing.perBooking}`}.`,
    ),
    "",
    "## Booking and cancellations",
    "Choose the experience, duration and date on the experience page to see available departures.",
    page.cancellationPolicy.summary,
    "",
    "## Boat, crew and meeting point",
    `- ${link("LENA", marketingPath("en", "boat"))}: Llaut Llevant 39 (Punta Prima), 7.49 m long and 3.03 m wide.`,
    ...skippers.map(
      (person) => `- ${link(person.name, profilePath("en", person.id))}`,
    ),
    `- ${link("Meeting point and directions", marketingPath("en", "contact"))}: ${operator.address}. [Google Maps](${operator.directions})`,
    `- Phone: ${operator.phone}. [WhatsApp](${operator.whatsapp}). Email: ${operator.email}`,
    "",
    "## Guest reviews",
    ...page.reviews.sources.map(
      (source) => `- [${source.name}](${source.url})`,
    ),
    "",
    "## Guides",
    ...getBlogCards("en").map(
      (guide) => `- ${link(guide.title, guide.href)}: ${guide.description}`,
    ),
    "",
    "## Official pages by language",
    ...marketingLocales.map(
      (locale) =>
        `- ${locale.toUpperCase()}: ${link("Home", marketingPath(locale))} · ${link("Prices", marketingPath(locale, "prices"))} · ${link("Guides", blogPath(locale))} · ${link("Contact", marketingPath(locale, "contact"))}`,
    ),
    "",
  ].join("\n");
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
