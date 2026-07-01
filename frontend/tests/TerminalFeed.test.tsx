import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TerminalFeed from "@/components/TerminalFeed";

let mockData: unknown = undefined;
let mockError: unknown = undefined;
let mockLoading = false;

vi.mock("swr", () => ({
  default: () => ({ data: mockData, error: mockError, isLoading: mockLoading }),
}));

describe("TerminalFeed", () => {
  beforeEach(() => {
    mockData = undefined;
    mockError = undefined;
    mockLoading = false;
  });

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

  it("adds activity entries from SWR data", () => {
    mockData = [
      { repo_name: "test-repo", committed_at: "2026-01-01T12:00:00Z", message: "fix: resolve issue" },
      { repo_name: "test-repo", committed_at: "2026-01-01T11:30:00Z", message: "feat: add feature" },
    ];
    render(<TerminalFeed />);
    expect(screen.getByText(/fix: resolve issue/)).toBeInTheDocument();
    expect(screen.getByText(/feat: add feature/)).toBeInTheDocument();
  });

  it("shows stream sync indicator when loading", () => {
    mockLoading = true;
    render(<TerminalFeed />);
    expect(screen.getByText("STREAM_SYNC")).toBeInTheDocument();
  });

  it("shows stream error indicator on fetch failure", () => {
    mockError = new Error("fail");
    render(<TerminalFeed />);
    expect(screen.getByText("STREAM_ERROR")).toBeInTheDocument();
  });

  it("caches log buffer at maximum capacity", () => {
    mockData = Array.from({ length: 60 }, (_, i) => ({
      repo_name: "repo",
      committed_at: `2026-01-01T12:0${i}:00Z`,
      message: `commit ${i}`,
    }));
    const { container } = render(<TerminalFeed />);
    const logLines = container.querySelectorAll('[class*="flex items-start"]');
    expect(logLines.length).toBeLessThanOrEqual(55);
  });
});
