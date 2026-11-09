import { describe, expect, it } from "vitest";

import { GetPublicBookingPageUseCase } from "./GetPublicBookingPageUseCase";
import type { BookingClock } from "./ports/BookingClock";
import type {
  PublicBookingCalendarBlockReadModel,
  PublicBookingCatalogExperienceReadModel,
  PublicBookingCatalogReader,
} from "./ports/PublicBookingCatalogReader";

describe("GetPublicBookingPageUseCase", () => {
  it.each([
    ["daytrip", 6, 540, 900],
    ["sunrise", 6, 360, 720],
    ["ex-sunset", 6, 960, 1320],
    ["romantic", 4, 540, 780],
  ])(
    "offers the approved %s schedule and respects shared protected blocks",
    async (id, hours, firstStart, firstEnd) => {
      const experience = createExperience({
        id,
        bufferMinutes: 30,
        hourlyRates: [{ hours, total: money(58000), deposit: money(5000) }],
        slotPolicy: { mode: "HOURLY_SOLAR", timeZone: "Europe/Madrid" },
      });
      const catalog = new FakePublicBookingCatalogReader({
        experiences: [experience],
        blocks: [],
      });
      const sunTimes = {
        sunrise: (day: string) => new Date(`${day}T04:18:00Z`),
        sunset: (day: string) => new Date(`${day}T19:26:00Z`),
      };
      const useCase = new GetPublicBookingPageUseCase(
        catalog,
        fixedClock(),
        undefined,
        sunTimes,
      );
      const query = {
        locale: "es",
        experienceId: id,
        hours,
        localDate: "2026-06-10",
      };
      const result = await useCase.executeAvailability(query);
      expect(result!.timeSlotsByDate[query.localDate][0]).toMatchObject({
        startMinutes: firstStart,
        endMinutes: firstEnd,
        available: true,
      });
      const blocked = new GetPublicBookingPageUseCase(
        new FakePublicBookingCatalogReader({
          experiences: [experience],
          blocks: [
            {
              id: "another-experience",
              protectedStartAt: new Date("2026-06-10T00:00:00Z"),
              protectedEndAt: new Date("2026-06-11T00:00:00Z"),
            },
          ],
        }),
        fixedClock(),
        undefined,
        sunTimes,
      );
      const unavailable = await blocked.executeAvailability(query);
      expect(
        unavailable!.timeSlotsByDate[query.localDate].every(
          (slot) => !slot.available,
        ),
      ).toBe(true);
    },
  );

  it("removes long daytrips that reach sunset and keeps panel departures for sunset trips", async () => {
    const experience = createExperience({
      id: "daytrip",
      hourlyRates: [{ hours: 6, total: money(57000), deposit: money(5000) }],
      slotPolicy: {
        mode: "ANY_AVAILABLE",
        timeZone: "Europe/Madrid",
        operatingWindow: { startMinutes: 480, endMinutes: 1380 },
        granularityMinutes: 30,
      },
    });
    const catalog = new FakePublicBookingCatalogReader({
      experiences: [experience],
      blocks: [],
    });
    const useCase = new GetPublicBookingPageUseCase(
      catalog,
      fixedClock(),
      undefined,
      { sunset: () => new Date("2026-06-10T18:00:00Z") },
    );
    const result = await useCase.executeAvailability({
      locale: "es",
      experienceId: "daytrip",
      hours: 6,
      localDate: "2026-06-10",
    });
    const slots = result!.timeSlotsByDate["2026-06-10"];
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.at(-1)?.startMinutes).toBe(810);
    expect(slots.every((slot) => slot.endMinutes < 1200)).toBe(true);
    const sunset = createExperience({
      id: "ex-sunset",
      durationMinutes: 120,
      slotPolicy: {
        mode: "FIXED_SLOTS",
        timeZone: "Europe/Madrid",
        fixedSlots: [
          {
            id: "manual-sunset",
            label: "Evening",
            startMinutes: 1140,
            endMinutes: 1380,
            enabled: true,
          },
        ],
      },
    });
    const manual = new GetPublicBookingPageUseCase(
      new FakePublicBookingCatalogReader({ experiences: [sunset], blocks: [] }),
      fixedClock(),
      undefined,
      { sunset: () => new Date("2026-06-10T18:00:00Z") },
    );
    const times = await manual.executeAvailability({
      locale: "es",
      experienceId: "ex-sunset",
      localDate: "2026-06-10",
    });
    expect(times!.timeSlotsByDate["2026-06-10"]).toMatchObject([
      { startMinutes: 1140, endMinutes: 1260, available: true },
    ]);
  });

  it("uses the selected hourly duration and the same protected margins as database exclusion", async () => {
    const experience = createExperience({
      hourlyRates: [
        { hours: 1, total: money(9900), deposit: money(5000) },
        { hours: 6, total: money(44900), deposit: money(5000) },
      ],
      slotPolicy: {
        mode: "ANY_AVAILABLE",
        timeZone: "Europe/Madrid",
        operatingWindow: { startMinutes: 360, endMinutes: 1380 },
        granularityMinutes: 30,
      },
    });
    const catalog = new FakePublicBookingCatalogReader({
      experiences: [experience],
      blocks: [
        {
          id: "existing",
          protectedStartAt: new Date("2026-06-10T07:30:00Z"),
          protectedEndAt: new Date("2026-06-10T11:30:00Z"),
        },
      ],
    });
    const useCase = new GetPublicBookingPageUseCase(catalog, fixedClock());
    const short = await useCase.executeAvailability({
      experienceId: experience.id,
      hours: 1,
      localDate: "2026-06-10",
      locale: "en",
    });
    expect(short?.days).toHaveLength(1);
    const slots = short!.timeSlotsByDate["2026-06-10"];
    expect(slots.find((slot) => slot.startMinutes === 810)?.available).toBe(
      false,
    );
    expect(slots.find((slot) => slot.startMinutes === 840)?.available).toBe(
      true,
    );
    const long = await useCase.executeAvailability({
      experienceId: experience.id,
      hours: 6,
      localDate: "2026-06-10",
      locale: "en",
    });
    expect(
      long!.timeSlotsByDate["2026-06-10"].every(
        (slot) =>
          slot.endMinutes - slot.startMinutes === 360 &&
          slot.endMinutes <= 1380,
      ),
    ).toBe(true);
    await expect(
      useCase.executeAvailability({
        experienceId: experience.id,
        hours: 2,
        locale: "en",
      }),
    ).rejects.toMatchObject({ code: "BOOKING_RATE_UNAVAILABLE" });
  });

  it("returns published experiences with availability and compatible extras", async () => {
    const catalog = new FakePublicBookingCatalogReader({
      blocks: [
        {
          id: "manual-block",
          protectedEndAt: new Date("2026-06-10T09:00:00.000Z"),
          protectedStartAt: new Date("2026-06-10T08:00:00.000Z"),
        },
      ],
      experiences: [createExperience()],
    });
    const useCase = new GetPublicBookingPageUseCase(catalog, fixedClock());

    const page = await useCase.execute({ locale: "en" });

    expect(page.experiences).toMatchObject([
      {
        capacity: 8,
        durationMinutes: 180,
        id: "morning-breeze-charter",
        title: "Morning Breeze Charter",
      },
    ]);
    expect(page.extrasByExperienceId["morning-breeze-charter"]).toHaveLength(2);
    expect(page.startLocalDate).toBe("2026-06-01");
    expect(page.endLocalDate).toBe("2026-12-04");
    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]?.days,
    ).toHaveLength(187);
    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]?.days.find(
        (day) => day.localDate === "2026-06-10",
      ),
    ).toMatchObject({ available: false });
    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-10"]?.[0],
    ).toMatchObject({
      available: false,
      availableExtraIds: [],
      label: "10:00",
      slotKey: "morning",
    });
    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-11"]?.[0],
    ).toMatchObject({
      available: true,
      availableExtraIds: ["paddle-surf", "private-photographer"],
    });
    expect(catalog.listActiveCalendarBlocksCalls).toBe(1);
  });

  it("can return the public booking catalog without availability", async () => {
    const catalog = new FakePublicBookingCatalogReader({
      experiences: [createExperience()],
    });
    const useCase = new GetPublicBookingPageUseCase(catalog, fixedClock());

    const page = await useCase.execute({
      includeAvailability: false,
      locale: "en",
    });

    expect(page.experiences).toHaveLength(1);
    expect(page.extrasByExperienceId["morning-breeze-charter"]).toHaveLength(2);
    expect(page.availabilityByExperienceId).toEqual({});
    expect(page.startLocalDate).toBe("2026-06-01");
    expect(page.endLocalDate).toBe("2026-12-04");
    expect(catalog.listActiveCalendarBlocksCalls).toBe(0);
  });

  it("returns availability for one requested experience", async () => {
    const catalog = new FakePublicBookingCatalogReader({
      experiences: [
        createExperience(),
        createExperience({
          id: "sunset-cruise",
          internalName: "Sunset Cruise",
          title: "Sunset Cruise",
        }),
      ],
    });
    const useCase = new GetPublicBookingPageUseCase(catalog, fixedClock());

    const availability = await useCase.executeAvailability({
      experienceId: "sunset-cruise",
      locale: "en",
    });

    expect(availability?.days).toHaveLength(187);
    expect(availability?.timeSlotsByDate["2026-06-11"]?.[0]).toMatchObject({
      available: true,
      availableExtraIds: ["paddle-surf", "private-photographer"],
    });
    expect(catalog.listActiveCalendarBlocksCalls).toBe(1);
  });

  it("filters slot extras when the selected start does not satisfy notice", async () => {
    const useCase = new GetPublicBookingPageUseCase(
      new FakePublicBookingCatalogReader({
        experiences: [createExperience()],
      }),
      fixedClock(),
    );

    const page = await useCase.execute({ locale: "en" });
    const todaySlot =
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-04"]?.[0];

    expect(todaySlot).toMatchObject({
      available: true,
      availableExtraIds: ["paddle-surf"],
    });
  });

  it("expands flexible policies into public slot candidates", async () => {
    const useCase = new GetPublicBookingPageUseCase(
      new FakePublicBookingCatalogReader({
        experiences: [
          createExperience({
            durationMinutes: 120,
            slotPolicy: {
              granularityMinutes: 120,
              mode: "ANY_AVAILABLE",
              operatingWindow: {
                endMinutes: 13 * 60,
                startMinutes: 9 * 60,
              },
              timeZone: "Europe/Madrid",
            },
          }),
        ],
      }),
      fixedClock(),
    );

    const page = await useCase.execute({ locale: "en" });

    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-11"],
    ).toMatchObject([
      { id: "flex-540", label: "09:00", startMinutes: 540 },
      { id: "flex-660", label: "11:00", startMinutes: 660 },
    ]);
  });

  it("ignores fixed slots that are shorter than the experience duration", async () => {
    const useCase = new GetPublicBookingPageUseCase(
      new FakePublicBookingCatalogReader({
        experiences: [
          createExperience({
            durationMinutes: 240,
            slotPolicy: {
              fixedSlots: [
                {
                  enabled: true,
                  endMinutes: 12 * 60,
                  id: "too-short",
                  label: "Too short",
                  startMinutes: 10 * 60,
                },
                {
                  enabled: true,
                  endMinutes: 14 * 60,
                  id: "valid-morning",
                  label: "Valid morning",
                  startMinutes: 10 * 60,
                },
              ],
              mode: "FIXED_SLOTS",
              timeZone: "Europe/Madrid",
            },
          }),
        ],
      }),
      fixedClock(),
    );

    const page = await useCase.execute({ locale: "en" });

    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-11"],
    ).toMatchObject([
      {
        endMinutes: 840,
        id: "valid-morning",
        label: "10:00",
        startMinutes: 600,
      },
    ]);
  });

  it("publishes fixed slot end times using the experience duration", async () => {
    const useCase = new GetPublicBookingPageUseCase(
      new FakePublicBookingCatalogReader({
        experiences: [
          createExperience({
            durationMinutes: 180,
            slotPolicy: {
              fixedSlots: [
                {
                  enabled: true,
                  endMinutes: 14 * 60,
                  id: "wide-morning",
                  label: "Wide morning",
                  startMinutes: 10 * 60,
                },
              ],
              mode: "FIXED_SLOTS",
              timeZone: "Europe/Madrid",
            },
          }),
        ],
      }),
      fixedClock(),
    );

    const page = await useCase.execute({ locale: "en" });

    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-11"],
    ).toMatchObject([
      {
        endMinutes: 13 * 60,
        id: "wide-morning",
        label: "10:00",
        startMinutes: 10 * 60,
      },
    ]);
  });

  it("does not double count the buffer around adjacent booked slots", async () => {
    const useCase = new GetPublicBookingPageUseCase(
      new FakePublicBookingCatalogReader({
        blocks: [
          {
            id: "booked-middle-slot",
            protectedEndAt: new Date("2026-06-11T11:30:00.000Z"),
            protectedStartAt: new Date("2026-06-11T07:30:00.000Z"),
          },
        ],
        experiences: [
          createExperience({
            durationMinutes: 180,
            slotPolicy: {
              fixedSlots: [
                {
                  enabled: true,
                  endMinutes: 9 * 60 + 30,
                  id: "before-buffer-boundary",
                  label: "Before buffer boundary",
                  startMinutes: 6 * 60 + 30,
                },
                {
                  enabled: true,
                  endMinutes: 10 * 60,
                  id: "before-buffer-overlap",
                  label: "Before buffer overlap",
                  startMinutes: 7 * 60,
                },
                {
                  enabled: true,
                  endMinutes: 16 * 60,
                  id: "after-buffer-overlap",
                  label: "After buffer overlap",
                  startMinutes: 13 * 60,
                },
                {
                  enabled: true,
                  endMinutes: 16 * 60 + 30,
                  id: "after-buffer-boundary",
                  label: "After buffer boundary",
                  startMinutes: 13 * 60 + 30,
                },
              ],
              mode: "FIXED_SLOTS",
              timeZone: "Europe/Madrid",
            },
          }),
        ],
      }),
      fixedClock(),
    );

    const page = await useCase.execute({ locale: "en" });

    expect(
      page.availabilityByExperienceId["morning-breeze-charter"]
        ?.timeSlotsByDate["2026-06-11"],
    ).toMatchObject([
      {
        available: true,
        id: "before-buffer-boundary",
        label: "06:30",
      },
      {
        available: false,
        id: "before-buffer-overlap",
        label: "07:00",
      },
      {
        available: false,
        id: "after-buffer-overlap",
        label: "13:00",
      },
      {
        available: true,
        id: "after-buffer-boundary",
        label: "13:30",
      },
    ]);
  });
});

class FakePublicBookingCatalogReader implements PublicBookingCatalogReader {
  listActiveCalendarBlocksCalls = 0;

  constructor(
    private readonly input: {
      blocks?: PublicBookingCalendarBlockReadModel[];
      experiences: PublicBookingCatalogExperienceReadModel[];
    },
  ) {}

  async listActiveCalendarBlocks() {
    this.listActiveCalendarBlocksCalls += 1;

    return this.input.blocks ?? [];
  }

  async listBookableExperiences() {
    return this.input.experiences;
  }
}

function fixedClock(): BookingClock {
  return {
    now: () => new Date("2026-06-04T08:00:00.000Z"),
  };
}

function createExperience(
  patch: Partial<PublicBookingCatalogExperienceReadModel> = {},
): PublicBookingCatalogExperienceReadModel {
  return {
    basePrice: money(35_000),
    bufferMinutes: 30,
    capacity: 8,
    depositAmount: money(10_000),
    description: "A calm morning sail.",
    displayOrder: 1,
    durationMinutes: 180,
    extras: [
      {
        capacityReduction: 0,
        description: "Paddle surf board.",
        enabled: true,
        id: "paddle-surf",
        limitPerBooking: 1,
        media: null,
        name: "Paddle Surf",
        noticeMinutes: 0,
        price: money(3_000),
        priceOverride: null,
        status: "ACTIVE",
      },
      {
        capacityReduction: 0,
        description: "Professional onboard photographer.",
        enabled: true,
        id: "private-photographer",
        limitPerBooking: 1,
        media: null,
        name: "Private Photographer",
        noticeMinutes: 24 * 60,
        price: money(12_000),
        priceOverride: null,
        status: "ACTIVE",
      },
      {
        capacityReduction: 0,
        description: "Archived option.",
        enabled: true,
        id: "archived-extra",
        limitPerBooking: 1,
        media: null,
        name: "Archived Extra",
        noticeMinutes: 0,
        price: money(1_000),
        priceOverride: null,
        status: "ARCHIVED",
      },
    ],
    id: "morning-breeze-charter",
    internalName: "Morning Breeze Charter",
    maximumAdvanceMonths: 6,
    media: null,
    minimumAdvanceMinutes: 0,
    slotPolicy: {
      fixedSlots: [
        {
          enabled: true,
          endMinutes: 13 * 60,
          id: "morning",
          label: "Morning",
          startMinutes: 10 * 60,
        },
      ],
      mode: "FIXED_SLOTS",
      timeZone: "Europe/Madrid",
    },
    title: "Morning Breeze Charter",
    ...patch,
  };
}

function money(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR" as const,
  };
}
