"use client";

import React, { useEffect, useRef, useState } from "react";

const TerminalFeed = () => {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] OMNISTAT KERNEL INITIALIZED",
    "[SYSTEM] ESTABLISHING GATEWAY CONNECTION...",
    "[SYSTEM] THE_FORGE STREAM READY",
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      const events = [
        "PACKET CAPTURED: 0x" + Math.random().toString(16).slice(2, 10).toUpperCase(),
        "FORGE_ENGINE_PING: OK",
        "GATEWAY_TRAFFIC: STABLE",
        "METRIC_UPSERT_COMPLETE",
      ];
      const newLog = `[${timestamp}] ${events[Math.floor(Math.random() * events.length)]}`;
      setLogs((prev) => [...prev.slice(-20), newLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="border border-foreground p-4 bg-background h-64 overflow-y-auto font-mono text-sm relative">
      <div className="absolute top-0 right-0 p-2 text-xs opacity-50">LIVESTREAM_FEED</div>
      {logs.map((log, i) => (
        <div key={i} className="mb-1">
          <span className="text-dim mr-2">{">"}</span>
          {log}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default TerminalFeed;
