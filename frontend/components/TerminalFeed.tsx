"use client";

import React, { useEffect, useRef, useState } from "react";

const TerminalFeed = () => {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] OMNISTAT KERNEL INITIALIZED",
    "[SYSTEM] ESTABLISHING GATEWAY CONNECTION...",
    "[SYSTEM] THE_FORGE STREAM READY",
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      const events = [
        "PACKET CAPTURED: 0x" + Math.random().toString(16).slice(2, 10).toUpperCase(),
        "FORGE_ENGINE_PING: OK",
        "GATEWAY_TRAFFIC: STABLE",
        "METRIC_UPSERT_COMPLETE",
        "WARN: ANOMALY DETECTED IN NODE_7",
      ];
      const newLog = `[${timestamp}] ${events[Math.floor(Math.random() * events.length)]}`;
      setLogs((prev) => [...prev.slice(-15), newLog]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="brutal-border p-4 bg-background h-72 overflow-y-auto font-mono text-sm relative box-glow">
      <div className="absolute top-0 right-0 p-2 text-xs font-bold bg-dim text-foreground">LIVESTREAM_FEED</div>
      <div className="flex flex-col gap-2 mt-4">
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start ${log.includes("WARN") ? "text-red-500 text-glow" : ""}`}>
            <span className="text-dim mr-2 shrink-0">{">"}</span>
            <span className="break-all">{log}</span>
          </div>
        ))}
        <div className="flex items-start text-foreground">
          <span className="text-dim mr-2 shrink-0">{">"}</span>
          <span className={`${cursorVisible ? "opacity-100" : "opacity-0"} bg-foreground w-2 h-4 inline-block mt-0.5`} />
        </div>
      </div>
      <div ref={endRef} className="h-2" />
    </div>
  );
};

export default TerminalFeed;
