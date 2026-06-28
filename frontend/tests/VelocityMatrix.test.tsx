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
});
