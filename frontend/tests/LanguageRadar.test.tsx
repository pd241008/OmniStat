import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageRadar from "@/components/LanguageRadar";

vi.mock("swr", () => ({
  default: vi.fn(() => ({ data: undefined, error: undefined })),
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("LanguageRadar", () => {
  it("shows scanning state before data loads", () => {
    render(<LanguageRadar />);
    expect(screen.getByText("SCANNING_REPOSITORIES...")).toBeInTheDocument();
  });

  it("renders the header label", () => {
    render(<LanguageRadar />);
    expect(screen.getByText("LANGUAGE_RADAR")).toBeInTheDocument();
  });

  it("renders the SVG radar decoration", () => {
    const { container } = render(<LanguageRadar />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
