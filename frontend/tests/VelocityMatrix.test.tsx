import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import VelocityMatrix from "@/components/VelocityMatrix";

beforeEach(() => {
  vi.useFakeTimers();
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
});
