import type { PublicBookingExperienceAvailability } from "./PublicBookingTypes";

const cacheLifetimeMs = 30_000;
const maxEntries = 32;

// Only browser requests use this cache. No customer data or booking decisions
// are cached, and checkout explicitly requests fresh availability.
export function createBookingAvailabilityClient() {
  const entries = new Map<
    string,
    {
      expiresAt: number;
      promise: Promise<PublicBookingExperienceAvailability>;
    }
  >();

  function load(
    url: string,
    fresh = false,
  ): Promise<PublicBookingExperienceAvailability> {
    if (fresh) entries.clear();
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= Date.now()) entries.delete(key);
    }
    const existing = entries.get(url);
    if (existing) return existing.promise;

    const promise: Promise<PublicBookingExperienceAvailability> = fetch(url, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Availability request failed.");
        const body = (await response.json()) as {
          availability?: PublicBookingExperienceAvailability;
        };
        if (!body.availability)
          throw new Error("Availability response was empty.");
        if (entries.get(url) === entry) {
          entry.expiresAt = Date.now() + cacheLifetimeMs;
          // Reuse the initial request when returning to its explicit month.
          const resolvedMonth = body.availability.calendar.months?.[0]?.id;
          if (resolvedMonth && url.endsWith("&month=current")) {
            const alias = url.replace(
              /&month=current$/,
              `&month=${resolvedMonth}`,
            );
            if (!entries.has(alias)) entries.set(alias, entry);
          }
          while (entries.size > maxEntries)
            entries.delete(entries.keys().next().value!);
        }
        return body.availability;
      })
      .catch((error: unknown) => {
        if (entries.get(url) === entry) entries.delete(url);
        throw error;
      });
    const entry = { expiresAt: Infinity, promise };
    entries.set(url, entry);
    while (entries.size > maxEntries)
      entries.delete(entries.keys().next().value!);
    return entry.promise;
  }

  return { load, clear: () => entries.clear() };
}

export const bookingAvailabilityClient = createBookingAvailabilityClient();
