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
      screen.getByRole("heading", { name: "Calendario del barco" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.getByLabelText("Desde")).toHaveValue("2026-06-01");
    expect(screen.getByLabelText("Hasta")).toHaveValue("2026-06-14");
  });

  it("submits a manual block creation", async () => {
    const pageData = getAdminCalendarPreviewPage();
    const actions = createActions(pageData.state);
    const user = userEvent.setup();

    render(<AdminCalendarWorkspace actions={actions} pageData={pageData} />);

    await user.type(screen.getByLabelText("Motivo"), "Team training");
    await user.click(screen.getByRole("button", { name: /Crear bloqueo/i }));

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

    await user.click(screen.getAllByRole("button", { name: /Liberar/i })[0]);

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

    await user.type(screen.getByLabelText("Motivo"), "Overlap");
    await user.click(screen.getByRole("button", { name: /Crear bloqueo/i }));

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
