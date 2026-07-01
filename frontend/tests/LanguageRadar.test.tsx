import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageRadar from "@/components/LanguageRadar";

let mockData: unknown = undefined;
let mockError: unknown = undefined;

vi.mock("swr", () => ({
  default: () => ({ data: mockData, error: mockError }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  mockData = undefined;
  mockError = undefined;
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

  it("shows error state when gateway is unreachable", () => {
    mockError = new Error("Gateway down");
    render(<LanguageRadar />);
    expect(screen.getByText(/ERROR/)).toBeInTheDocument();
    expect(screen.getByText(/GATEWAY_UNREACHABLE/)).toBeInTheDocument();
  });

  it("renders language bars when data is loaded", () => {
    mockData = [
      { name: "Scala", val: 85 },
      { name: "Go", val: 70 },
      { name: "TypeScript", val: 95 },
    ];
    render(<LanguageRadar />);
    expect(screen.getByText("Scala")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("displays percentage values for each language", () => {
    mockData = [
      { name: "Scala", val: 85 },
      { name: "Go", val: 70 },
    ];
    render(<LanguageRadar />);
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
  });
});
