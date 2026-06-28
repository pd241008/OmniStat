import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TerminalFeed from "@/components/TerminalFeed";

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
});
