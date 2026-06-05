import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminNotificationsPreviewPage } from "@/interface/next/presenters/adminNotificationsPresenter";

import { AdminNotificationsWorkspace } from "./AdminNotificationsWorkspace";
import type {
  AdminNotificationActions,
  AdminNotificationsState,
} from "./AdminNotificationTypes";

describe("AdminNotificationsWorkspace", () => {
  it("renders notification rules and metrics", () => {
    const pageData = getAdminNotificationsPreviewPage();

    render(
      <AdminNotificationsWorkspace
        actions={createActions(pageData.state)}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="rules"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Notifications" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Booking created" }),
    ).toBeVisible();
    expect(screen.getByText("Active rules")).toBeVisible();
  });

  it("submits notification rule edits", async () => {
    const pageData = getAdminNotificationsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminNotificationsWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="rules"
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /edit/i })[0]!);
    await user.click(screen.getByRole("button", { name: /save rule/i }));

    expect(actions.saveRule).toHaveBeenCalledWith(
      expect.objectContaining({
        ruleId: "rule-preview-email-created",
      }),
    );
  });

  it("renders templates and creates a draft template", async () => {
    const pageData = getAdminNotificationsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminNotificationsWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="templates"
      />,
    );

    await user.type(
      screen.getByLabelText("Template id"),
      "browser-test-template",
    );
    await user.click(screen.getByRole("button", { name: /save template/i }));

    expect(actions.saveTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: "browser-test-template",
      }),
    );
  });

  it("renders template detail and previews draft content", async () => {
    const pageData = getAdminNotificationsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminNotificationsWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        templateId="template-preview-email-created"
        view="template-detail"
      />,
    );

    await user.click(screen.getByRole("button", { name: /render preview/i }));

    expect(actions.previewTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: "en",
        templateId: "template-preview-email-created",
      }),
    );
  });

  it("renders logs and sends manual review deliveries", async () => {
    const pageData = getAdminNotificationsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminNotificationsWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="logs"
      />,
    );

    await user.click(screen.getByRole("button", { name: /mark sent/i }));

    expect(actions.sendDelivery).toHaveBeenCalledWith({
      notificationDeliveryId: "delivery-preview-2",
    });
  });
});

function createActions(state: AdminNotificationsState): AdminNotificationActions {
  return {
    previewTemplate: vi.fn(async () => ({
      data: {
        missingVariables: [],
        renderedBody: "Rendered body",
        renderedPreviewText: "Rendered preview",
        renderedSubject: "Rendered subject",
        variables: ["booking.reference"],
        warnings: [],
      },
      ok: true as const,
    })),
    saveRule: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
    saveTemplate: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
    sendDelivery: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
  };
}
