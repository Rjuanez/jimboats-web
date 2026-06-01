import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { getAdminExperiencesPreviewPage } from "@/interface/next/presenters/adminExperiencesPresenter";

import { AdminExperiencesWorkspace } from "./AdminExperiencesWorkspace";
import type { AdminExperienceActions } from "./AdminExperienceTypes";

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
});
