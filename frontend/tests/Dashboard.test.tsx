import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/page";

vi.mock("swr", () => ({
  default: vi.fn(() => ({ data: undefined, error: undefined })),
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Dashboard", () => {
  it("renders the terminal header", () => {
    render(<Dashboard />);
    expect(screen.getAllByText(/OMNISTAT/).length).toBeGreaterThan(0);
    expect(screen.getByText(/THE_TERMINAL/)).toBeInTheDocument();
  });

  it("renders all four stat cards", () => {
    render(<Dashboard />);
    expect(screen.getByText("GATEWAY_STATUS")).toBeInTheDocument();
    expect(screen.getByText("FORGE_NODES")).toBeInTheDocument();
    expect(screen.getByText("THROUGHPUT")).toBeInTheDocument();
    expect(screen.getByText("LATENCY")).toBeInTheDocument();
  });

  it("renders section headers", () => {
    render(<Dashboard />);
    expect(screen.getByText(/REALTIME_LOGS/)).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM_METRICS/)).toBeInTheDocument();
    expect(screen.getByText(/REPO_DISTRIBUTION/)).toBeInTheDocument();
    expect(screen.getByText(/COMMIT_VELOCITY/)).toBeInTheDocument();
  });

  it("renders sub-components", () => {
    render(<Dashboard />);
    expect(screen.getByText("LIVESTREAM_FEED")).toBeInTheDocument();
    expect(screen.getByText("LANGUAGE_RADAR")).toBeInTheDocument();
    expect(screen.getByText("VELOCITY_MATRIX")).toBeInTheDocument();
  });

  it("shows syncing state for metrics", () => {
    render(<Dashboard />);
    expect(screen.getByText(/SYNCHRONIZING_DATA/)).toBeInTheDocument();
  });

  it("renders footer with copyright", () => {
    render(<Dashboard />);
    expect(screen.getByText(/BLUME_CORP/)).toBeInTheDocument();
  });

  it("renders uplink ID", () => {
    render(<Dashboard />);
    expect(screen.getByText(/UPLINK_ID/)).toBeInTheDocument();
  });
});
