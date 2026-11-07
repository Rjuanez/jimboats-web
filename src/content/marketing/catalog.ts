import type { ExperienceKey } from "./routes";

// Allowed durations and prices come from booking/hourlyPrices.
export const experiences: Record<
  ExperienceKey,
  {
    bookingId: string;
    price: number | null;
    durationHours: number | null;
    imageSlug: string;
  }
> = {
  private: {
    bookingId: "daytrip",
    price: null,
    durationHours: 2,
    imageSlug: "production-daytrip",
  },
  sunset: {
    bookingId: "ex-sunset",
    price: null,
    durationHours: 2,
    imageSlug: "production-sunset",
  },
  sunrise: {
    bookingId: "sunrise",
    price: null,
    durationHours: 2,
    imageSlug: "production-sunrise",
  },
  romantic: {
    bookingId: "romantic",
    price: null,
    durationHours: null,
    imageSlug: "production-romantic",
  },
};
export const operator = {
  name: "JimBoats Charter",
  legalName: "Jimboats Charter SL",
  taxId: "B25930850",
  registeredAddress: "Carrer de Provençals, 5 · Sant Martí · 08019 Barcelona",
  url: "https://jimboatscharter.com",
  entityId: "https://jimboatscharter.com/#business",
  email: "info@jimboatscharter.com",
  phone: "+34 669 707 354",
  phoneLink: "tel:+34669707354",
  whatsapp: "https://wa.me/34669707354",
  address: "Moll de Xaloc, Pantalan 5, Sant Martí, 08005 Barcelona",
  boardingAddress: {
    streetAddress: "Moll de Xaloc, Pantalan 5",
    addressLocality: "Barcelona",
    postalCode: "08005",
    addressCountry: "ES",
  },
  maps: "https://share.google/VCXHQNiEvhbq4R1nY",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=41.3869971,2.2017905",
  mapEmbed:
    "https://maps.google.com/maps?q=41.3869971,2.2017905&z=17&output=embed",
  instagram: "https://www.instagram.com/jimboatsbcn/",
};

export const durationOptions = [1, 2, 3, 4, 5, 6] as const;
