import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminCalendarPreviewPage } from "@/interface/next/presenters/adminCalendarPresenter";

import type { AdminCalendarActions } from "./AdminCalendarTypes";
import { AdminCalendarWorkspace } from "./AdminCalendarWorkspace";

describe("AdminCalendarWorkspace", () => {
  it("renders calendar summary, range and operational blocks", () => {
    const pageData = getAdminCalendarPreviewPage();
    const actions = createActions(pageData.state);

    render(<AdminCalendarWorkspace actions={actions} pageData={pageData} />);

    expect(
      screen.getByRole("heading", { name: "Boat calendar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Maintenance window")).toBeInTheDocument();
    expect(screen.getByLabelText("From date")).toHaveValue("2026-06-01");
    expect(screen.getByLabelText("To date")).toHaveValue("2026-06-14");
  });

  it("submits a manual block creation", async () => {
    const pageData = getAdminCalendarPreviewPage();
    const actions = createActions(pageData.state);
    const user = userEvent.setup();

    render(<AdminCalendarWorkspace actions={actions} pageData={pageData} />);

    await user.type(screen.getByLabelText("Reason"), "Team training");
    await user.click(screen.getByRole("button", { name: /create block/i }));

    expect(actions.createManualBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        endTime: "12:00",
        fromLocalDate: "2026-06-01",
        localDate: "2026-06-01",
        reason: "Team training",
        startTime: "10:00",
        toLocalDate: "2026-06-14",
      }),
    );
  });

  it("submits a manual block release", async () => {
    const pageData = getAdminCalendarPreviewPage();
    const actions = createActions(pageData.state);
    const user = userEvent.setup();

    render(<AdminCalendarWorkspace actions={actions} pageData={pageData} />);

    await user.click(screen.getAllByRole("button", { name: /release/i })[0]);

    expect(actions.releaseManualBlock).toHaveBeenCalledWith({
      calendarBlockId: "preview-maintenance",
      fromLocalDate: "2026-06-01",
      toLocalDate: "2026-06-14",
    });
  });

  it("shows a controlled error from the action", async () => {
    const pageData = getAdminCalendarPreviewPage();
    const actions = createActions(pageData.state);
    actions.createManualBlock = vi.fn(async () => ({
      message: "This calendar block overlaps an active boat block.",
      ok: false as const,
    }));
    const user = userEvent.setup();

    render(<AdminCalendarWorkspace actions={actions} pageData={pageData} />);

    await user.type(screen.getByLabelText("Reason"), "Overlap");
    await user.click(screen.getByRole("button", { name: /create block/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This calendar block overlaps an active boat block.",
    );
  });
});

function createActions(
  state = getAdminCalendarPreviewPage().state,
): AdminCalendarActions {
  return {
    createManualBlock: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
    releaseManualBlock: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
  };
}
