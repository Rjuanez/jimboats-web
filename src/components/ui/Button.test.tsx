import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders an accessible button", () => {
    render(<Button>Reservar</Button>);

    expect(screen.getByRole("button", { name: "Reservar" })).toBeVisible();
  });

  it("renders an accessible link when href is provided", () => {
    render(<Button href="/reservar">Reservar</Button>);

    expect(screen.getByRole("link", { name: "Reservar" })).toHaveAttribute(
      "href",
      "/reservar",
    );
  });

  it("marks loading state as busy", () => {
    render(<Button loading>Procesando</Button>);

    expect(screen.getByRole("button", { name: "Procesando" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
