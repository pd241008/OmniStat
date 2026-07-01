"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { ActivityEntry } from "@/lib/types";

const BOOT_LOGOS = [
  "[SYSTEM] OMNISTAT KERNEL INITIALIZED",
  "[SYSTEM] ESTABLISHING GATEWAY CONNECTION...",
  "[SYSTEM] THE_FORGE STREAM READY",
];

const MAX_LINES = 50;

function formatActivity(entry: ActivityEntry): string {
  const ts = entry.committed_at?.split("T")?.[1]?.split(".")?.[0] ?? entry.committed_at;
  return `[${ts}] ${entry.repo_name}: ${entry.message}`;
}

const TerminalFeed = () => {
  const [logs, setLogs] = useState<string[]>(BOOT_LOGOS);
  const endRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  const { data, error, isLoading } = useSWR<ActivityEntry[]>(
    "http://localhost:8080/api/v1/metrics/activity",
    fetcher,
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (!data) return;
    const entries = data.map(formatActivity);
    const next = [...BOOT_LOGOS, ...entries];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogs(next.length > MAX_LINES ? next.slice(-MAX_LINES) : next);
  }, [data]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="brutal-border p-4 bg-background h-72 overflow-y-auto font-mono text-sm relative box-glow">
      <div className="absolute top-0 right-0 p-2 text-xs font-bold bg-dim text-foreground">LIVESTREAM_FEED</div>

      {isLoading && (
        <div className="absolute top-0 left-0 p-2 text-[10px] font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-dim">STREAM_SYNC</span>
        </div>
      )}
      {error && (
        <div className="absolute top-0 left-0 p-2 text-[10px] font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-500">STREAM_ERROR</span>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {logs.map((log, i) => (
          <div key={`${i}-${log}`} className={`flex items-start ${log.includes("WARN") || log.includes("ERROR") ? "text-red-500 text-glow" : ""}`}>
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
