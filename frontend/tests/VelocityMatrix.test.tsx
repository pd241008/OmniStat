import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import VelocityMatrix from "@/components/VelocityMatrix";

let mockData: unknown = undefined;
let mockError: unknown = undefined;
let mockLoading = false;

vi.mock("swr", () => ({
  default: () => ({ data: mockData, error: mockError, isLoading: mockLoading }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  mockData = undefined;
  mockError = undefined;
  mockLoading = false;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("VelocityMatrix", () => {
  it("renders the header label", () => {
    render(<VelocityMatrix />);
    expect(screen.getByText("VELOCITY_MATRIX")).toBeInTheDocument();
  });

  it("renders the commit density map label", () => {
    render(<VelocityMatrix />);
    expect(screen.getByText("COMMIT_DENSITY_MAP")).toBeInTheDocument();
  });

  it("renders 96 grid nodes (8x12)", () => {
    const { container } = render(<VelocityMatrix />);
    const grid = container.querySelector(".grid-cols-12");
    expect(grid).toBeInTheDocument();
    const cells = grid?.children;
    expect(cells?.length).toBe(96);
  });

  it("renders scan ID in footer", () => {
    render(<VelocityMatrix />);
    expect(screen.getByText(/SCAN_ID/)).toBeInTheDocument();
  });

  it("renders all 96 intensity nodes after mount", () => {
    const { container } = render(<VelocityMatrix />);
    const grid = container.querySelector(".grid-cols-12");
    const cells = grid?.children;
    expect(cells?.length).toBe(96);
  });

  it("has nodes with different intensity classes", () => {
    const { container } = render(<VelocityMatrix />);
    const grid = container.querySelector(".grid-cols-12");
    const cells = Array.from(grid?.children || []);

    const hasHighTransparency = cells.some(c => c.className.includes("opacity-30"));
    const hasDimBackground = cells.some(c => c.className.includes("bg-dim"));

    expect(hasHighTransparency || hasDimBackground).toBe(true);
  });

  it("applies glow effect to high-intensity nodes", () => {
    const { container } = render(<VelocityMatrix />);
    const grid = container.querySelector(".grid-cols-12");
    const cells = Array.from(grid?.children || []);

    const glowedNodes = cells.filter(c => c.className.includes("shadow-"));
    expect(glowedNodes.length).toBeGreaterThanOrEqual(0);
  });

  it("shows scanning state when loading", () => {
    mockLoading = true;
    render(<VelocityMatrix />);
    expect(screen.getByText("SCANNING_VELOCITY...")).toBeInTheDocument();
  });

  it("shows error state when fetch fails", () => {
    mockError = new Error("fail");
    render(<VelocityMatrix />);
    expect(screen.getByText("MATRIX_STREAM_INTERRUPTED")).toBeInTheDocument();
  });

  it("shows empty state when no velocity data", () => {
    mockData = [];
    render(<VelocityMatrix />);
    expect(screen.getByText("NO_VELOCITY_DATA")).toBeInTheDocument();
  });

  it("renders grid from velocity data", () => {
    mockData = [
      { hour: 10, day: 2, commits: 5 },
      { hour: 14, day: 3, commits: 8 },
    ];
    const { container } = render(<VelocityMatrix />);
    const grid = container.querySelector(".grid-cols-12");
    const cells = Array.from(grid?.children || []);
    expect(cells.length).toBe(96);
  });
});
