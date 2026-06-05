import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminExtrasPreviewPage } from "@/interface/next/presenters/adminExtrasPresenter";

import { AdminExtrasWorkspace } from "./AdminExtrasWorkspace";
import type { AdminExtra, AdminExtraActions } from "./AdminExtraTypes";

const actions: AdminExtraActions = {
  archiveExtra: async () => ({
    data: {
      state: getAdminExtrasPreviewPage().state,
    },
    ok: true,
  }),
  createExtra: async () => ({
    data: {
      extraId: "new-extra",
      state: getAdminExtrasPreviewPage().state,
    },
    ok: true,
  }),
  saveExtra: async () => ({
    data: {
      state: getAdminExtrasPreviewPage().state,
    },
    ok: true,
  }),
};

describe("AdminExtrasWorkspace", () => {
  it("renders the extras catalog from presenter data", () => {
    const pageData = getAdminExtrasPreviewPage();

    render(
      <AdminExtrasWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="list"
      />,
    );

    expect(screen.getByRole("heading", { name: "Extras" })).toBeInTheDocument();
    expect(screen.getAllByText("Premium champagne").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mediterranean snacks").length).toBeGreaterThan(
      0,
    );
  });

  it("edits an extra and autosaves the new value", async () => {
    const pageData = getAdminExtrasPreviewPage();
    const user = userEvent.setup();
    const saveExtra = vi.fn(async (extra: AdminExtra) => ({
      data: {
        state: {
          ...pageData.state,
          extras: pageData.state.extras.map((candidate) =>
            candidate.id === extra.id ? extra : candidate,
          ),
        },
      },
      ok: true as const,
    }));

    render(
      <AdminExtrasWorkspace
        actions={{
          ...actions,
          saveExtra,
        }}
        extraId="premium-champagne"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    const nameField = screen.getByLabelText("Name");

    await user.clear(nameField);
    await user.type(nameField, "Premium cava");

    await waitFor(() => {
      expect(saveExtra).toHaveBeenCalled();
    });
    expect(saveExtra.mock.calls.at(-1)?.[0].name).toBe("Premium cava");
  });

  it("assigns an extra media asset from the detail screen", async () => {
    const pageData = getAdminExtrasPreviewPage();
    const user = userEvent.setup();
    const saveExtra = vi.fn(async (extra: AdminExtra) => ({
      data: {
        state: {
          ...pageData.state,
          extras: pageData.state.extras.map((candidate) =>
            candidate.id === extra.id ? extra : candidate,
          ),
        },
      },
      ok: true as const,
    }));

    render(
      <AdminExtrasWorkspace
        actions={{
          ...actions,
          saveExtra,
        }}
        extraId="premium-champagne"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Mediterranean snacks cover/i }),
    );

    await waitFor(() => {
      expect(saveExtra).toHaveBeenCalled();
    });
    expect(saveExtra.mock.calls.at(-1)?.[0].media.assetId).toBe(
      "mediterranean-snacks-cover",
    );
  });
});
