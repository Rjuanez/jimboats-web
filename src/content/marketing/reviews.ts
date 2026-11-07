// Editorial excerpts verified against public source pages on 2026-11-02.
// Original languages are preserved; faithful translations of the same excerpts live in the dictionaries.
// This is a manually curated selection, not an automatically refreshed feed.
const clickAndBoatUrl =
  "https://www.clickandboat.com/es/activities/barcelona/atardecer-privado-en-barcelona-barco-tradicional-mediterraneo-33336";
const googleUrl = "https://share.google/VCXHQNiEvhbq4R1nY";
const getYourGuideUrl =
  "https://www.getyourguide.com/barcelona-l45/barcelona-sail-along-the-coast-and-enjoy-the-skyline-t1353227/";

export const customerReviews = {
  checkedAt: "2026-11-02",
  sources: [
    { name: "Google", url: googleUrl, rating: 5, count: 35 },
    {
      name: "GetYourGuide",
      url: `${getYourGuideUrl}#row-customer-reviews-desktop`,
      rating: 5,
      count: 6,
    },
    { name: "Click&Boat", url: clickAndBoatUrl, rating: 5, count: 7 },
  ],
  excerpts: [
    {
      platform: "GetYourGuide",
      url: `${getYourGuideUrl}#reloadable-review-card-124610205`,
      authorUrl: `${getYourGuideUrl}#reloadable-review-card-124610205`,
      author: "Emma",
      id: "emma" as const,
      language: "en",
      text: "From the moment we stepped on board, Victor made the whole experience feel personal, relaxed and completely bespoke.",
    },
    {
      id: "asante" as const,
      platform: "Click&Boat",
      url: clickAndBoatUrl,
      authorUrl: clickAndBoatUrl,
      author: "Asante",
      language: "en",
      text: "He was friendly, professional, and made the experience feel easy and relaxed from start to finish.",
    },
    {
      platform: "Google Maps",
      url: googleUrl,
      authorUrl: googleUrl,
      author: "Megan Bradley",
      id: "megan" as const,
      language: "en",
      text: "We just had a 2 hour private boat trip as a group of six with Victor and LOVED it.",
    },
    {
      platform: "GetYourGuide",
      url: `${getYourGuideUrl}#reloadable-review-card-127434259`,
      authorUrl: `${getYourGuideUrl}#reloadable-review-card-127434259`,
      author: "Stefanía",
      id: "stefania" as const,
      language: "en",
      text: "jumping into the ocean, using the paddleboard, and relaxing in the sun while listening to our own music.",
    },
    {
      id: "adam" as const,
      platform: "Click&Boat",
      url: clickAndBoatUrl,
      authorUrl: clickAndBoatUrl,
      author: "Adam",
      language: "en",
      text: "the boat was well stocked with drinks and lovely ham. He even let us use the speaker on board.",
    },
    {
      platform: "Google Maps",
      url: googleUrl,
      authorUrl: googleUrl,
      author: "Kateryna Ihnatovych",
      id: "kateryna" as const,
      language: "en",
      text: "We went in the evening to watch the drone show from the water, and it was an amazing experience.",
    },
    {
      id: "alina" as const,
      platform: "Click&Boat",
      url: clickAndBoatUrl,
      authorUrl: clickAndBoatUrl,
      author: "Alina",
      language: "en",
      text: "We were celebrating my sister‘s bachelorette party and it’s a great idea to do so!",
    },
    {
      platform: "Google Maps",
      url: googleUrl,
      authorUrl: googleUrl,
      author: "Francessca Tremeer",
      id: "francessca" as const,
      language: "en",
      text: "It was a private cruise for our group only and was really intimate and personal, it really made our day.",
    },
  ],
};
