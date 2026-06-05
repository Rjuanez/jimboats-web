import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminExperiencesPreviewPage } from "@/interface/next/presenters/adminExperiencesPresenter";

import { AdminExperiencesWorkspace } from "./AdminExperiencesWorkspace";
import type {
  AdminExperience,
  AdminExperienceActions,
} from "./AdminExperienceTypes";

const actions: AdminExperienceActions = {
  archiveExperience: async () => ({
    data: {
      state: getAdminExperiencesPreviewPage().state,
    },
    ok: true,
  }),
  createExperience: async () => ({
    data: {
      experienceId: "new-experience",
      state: getAdminExperiencesPreviewPage().state,
    },
    ok: true,
  }),
  duplicateExperience: async () => ({
    data: {
      experienceId: "sunset-experience-copy",
      state: getAdminExperiencesPreviewPage().state,
    },
    ok: true,
  }),
  saveExperience: async () => ({
    data: {
      state: getAdminExperiencesPreviewPage().state,
    },
    ok: true,
  }),
};

describe("AdminExperiencesWorkspace", () => {
  it("renders the experiences list from presenter data", () => {
    const pageData = getAdminExperiencesPreviewPage();

    render(
      <AdminExperiencesWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="list"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Experiences" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Sunset Experience").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Romantic Proposal").length).toBeGreaterThan(0);
  });

  it("formats partial-hour durations without rounding them up", () => {
    const pageData = getAdminExperiencesPreviewPage();
    const shortExperience = pageData.state.experiences[0];

    render(
      <AdminExperiencesWorkspace
        actions={actions}
        initialState={{
          ...pageData.state,
          experiences: [
            {
              ...shortExperience,
              capacity: 6,
              durationMinutes: 90,
              id: "morning-breeze-test",
              internalName: "Morning Breeze Test",
            },
          ],
        }}
        navItems={pageData.navItems}
        view="list"
      />,
    );

    expect(screen.getByText(/1h 30m · 6 guests/)).toBeInTheDocument();
    expect(screen.queryByText(/2h · 6 guests/)).not.toBeInTheDocument();
  });

  it("edits overview fields locally", async () => {
    const pageData = getAdminExperiencesPreviewPage();
    const user = userEvent.setup();

    render(
      <AdminExperiencesWorkspace
        actions={actions}
        experienceId="sunset-experience"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="overview"
      />,
    );

    const nameField = screen.getByLabelText("Internal name");

    await user.clear(nameField);
    await user.type(nameField, "Private Sunset Test");

    expect(screen.getByDisplayValue("Private Sunset Test")).toBeInTheDocument();
  });

  it("assigns a ready media library asset and autosaves its asset id", async () => {
    const pageData = getAdminExperiencesPreviewPage();
    const user = userEvent.setup();
    const saveExperience = vi.fn(async (experience: AdminExperience) => ({
      data: {
        state: {
          ...pageData.state,
          experiences: pageData.state.experiences.map((candidate) =>
            candidate.id === experience.id ? experience : candidate,
          ),
        },
      },
      ok: true as const,
    }));

    render(
      <AdminExperiencesWorkspace
        actions={{
          ...actions,
          saveExperience,
        }}
        experienceId="sunset-experience"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="media"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Use Romantic Proposal hero" }),
    );

    await waitFor(() => {
      expect(saveExperience).toHaveBeenCalled();
    });
    expect(saveExperience.mock.calls.at(-1)?.[0].media.assetId).toBe(
      "romantic-proposal-hero",
    );
    expect(
      screen.getAllByText("Romantic Proposal hero").length,
    ).toBeGreaterThan(0);
  });

  it("edits flexible availability and autosaves the configured window", async () => {
    const pageData = getAdminExperiencesPreviewPage();
    const user = userEvent.setup();
    const saveExperience = vi.fn(async (experience: AdminExperience) => ({
      data: {
        state: {
          ...pageData.state,
          experiences: pageData.state.experiences.map((candidate) =>
            candidate.id === experience.id ? experience : candidate,
          ),
        },
      },
      ok: true as const,
    }));

    render(
      <AdminExperiencesWorkspace
        actions={{
          ...actions,
          saveExperience,
        }}
        experienceId="sunset-experience"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="availability"
      />,
    );

    await user.selectOptions(screen.getByLabelText("Slot policy"), [
      "any_available",
    ]);
    await user.clear(screen.getByLabelText("Flexible step minutes"));
    await user.type(screen.getByLabelText("Flexible step minutes"), "15");

    expect(
      screen.getByRole("heading", { name: "Flexible availability" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Fixed slot templates" }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(
        saveExperience.mock.calls.at(-1)?.[0].flexibleAvailability
          .granularityMinutes,
      ).toBe(15);
    });
    expect(saveExperience.mock.calls.at(-1)?.[0].slotPolicyType).toBe(
      "any_available",
    );
  });

  it("adds the next fixed slot without overlapping existing templates", async () => {
    const pageData = getAdminExperiencesPreviewPage();
    const user = userEvent.setup();
    const saveExperience = vi.fn(async (experience: AdminExperience) => ({
      data: {
        state: {
          ...pageData.state,
          experiences: pageData.state.experiences.map((candidate) =>
            candidate.id === experience.id ? experience : candidate,
          ),
        },
      },
      ok: true as const,
    }));

    render(
      <AdminExperiencesWorkspace
        actions={{
          ...actions,
          saveExperience,
        }}
        experienceId="sunset-experience"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="availability"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add fixed slot" }));

    expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
    expect(
      screen.getByText("Enabled slot templates are ready."),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        saveExperience.mock.calls
          .at(-1)?.[0]
          .slots.some((slot) => slot.startTime === "08:00"),
      ).toBe(true);
    });
  });

  it("edits experience extra rules and autosaves capacity impact", async () => {
    const pageData = getAdminExperiencesPreviewPage();
    const user = userEvent.setup();
    const saveExperience = vi.fn(async (experience: AdminExperience) => ({
      data: {
        state: {
          ...pageData.state,
          experiences: pageData.state.experiences.map((candidate) =>
            candidate.id === experience.id ? experience : candidate,
          ),
        },
      },
      ok: true as const,
    }));

    render(
      <AdminExperiencesWorkspace
        actions={{
          ...actions,
          saveExperience,
        }}
        experienceId="sunset-experience"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="extras"
      />,
    );

    const table = screen.getByRole("table");
    const champagneRow = within(table).getByRole("row", {
      name: /Premium champagne/,
    });
    const capacityField = within(champagneRow).getByLabelText("Capacity");

    await user.clear(capacityField);
    await user.type(capacityField, "2");

    await waitFor(() => {
      expect(saveExperience).toHaveBeenCalled();
    });
    expect(
      saveExperience.mock.calls.at(-1)?.[0].extras.find((extra) => {
        return extra.extraId === "premium-champagne";
      })?.capacityReduction,
    ).toBe(2);
  });
});
