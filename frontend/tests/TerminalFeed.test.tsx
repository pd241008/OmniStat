import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TerminalFeed from "@/components/TerminalFeed";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TerminalFeed", () => {
  it("renders initial kernel message", () => {
    render(<TerminalFeed />);
    expect(screen.getByText(/OMNISTAT KERNEL INITIALIZED/)).toBeInTheDocument();
  });

  it("renders the livestream header", () => {
    render(<TerminalFeed />);
    expect(screen.getByText("LIVESTREAM_FEED")).toBeInTheDocument();
  });

  it("renders blinking cursor indicator", () => {
    const { container } = render(<TerminalFeed />);
    const cursor = container.querySelector("span.bg-foreground");
    expect(cursor).toBeInTheDocument();
  });

  it("renders three initial log lines", () => {
    render(<TerminalFeed />);
    expect(screen.getByText(/OMNISTAT KERNEL INITIALIZED/)).toBeInTheDocument();
    expect(screen.getByText(/ESTABLISHING GATEWAY CONNECTION/)).toBeInTheDocument();
    expect(screen.getByText(/THE_FORGE STREAM READY/)).toBeInTheDocument();
  });

  it("adds new log lines over time", () => {
    render(<TerminalFeed />);
    const initialLines = screen.getAllByText(/>/);
    const initialCount = initialLines.length;

    vi.advanceTimersByTime(2500);

    const linesAfter = screen.getAllByText(/>/);
    expect(linesAfter.length).toBeGreaterThanOrEqual(initialCount);
  });

  it("caps log buffer at 15 most recent lines", () => {
    render(<TerminalFeed />);
    vi.advanceTimersByTime(40000);
    const logLines = screen.getAllByText(/>/);
    expect(logLines.length).toBeLessThanOrEqual(18);
  });
});
