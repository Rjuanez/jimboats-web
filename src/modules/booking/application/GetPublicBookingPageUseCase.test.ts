import { describe, expect, it } from "vitest";

import { GetPublicBookingPageUseCase } from "./GetPublicBookingPageUseCase";
import type { BookingClock } from "./ports/BookingClock";
import type {
  PublicBookingCalendarBlockReadModel,
  PublicBookingCatalogExperienceReadModel,
  PublicBookingCatalogReader,
} from "./ports/PublicBookingCatalogReader";

describe("GetPublicBookingPageUseCase", () => {
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
    const useCase = new GetPublicBookingPageUseCase(
      catalog,
      fixedClock(),
    );

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
