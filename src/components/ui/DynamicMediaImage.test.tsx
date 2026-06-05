import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DynamicMediaImage } from "./DynamicMediaImage";

describe("DynamicMediaImage", () => {
  it("renders dynamic media directly from the public media path", () => {
    render(
      <DynamicMediaImage
        alt="Sunset catamaran"
        sizes="100vw"
        src="/media/experiences/sunset-1280.webp"
        variants={[
          {
            publicUrl: "/media/experiences/sunset-640.webp",
            width: 640,
          },
          {
            publicUrl: "/media/experiences/sunset-1280.webp",
            width: 1280,
          },
        ]}
      />,
    );

    const image = screen.getByRole("img", {
      name: "Sunset catamaran",
    });

    expect(image).toHaveAttribute("src", "/media/experiences/sunset-1280.webp");
    expect(image).toHaveAttribute("sizes", "100vw");
  });
});
