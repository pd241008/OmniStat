"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { VelocityEntry } from "@/lib/types";

const ROWS = 8;
const COLS = 12;
const TOTAL_NODES = ROWS * COLS;

function buildIntensityGrid(data: VelocityEntry[] | undefined): number[] {
  const grid = new Array<number>(TOTAL_NODES).fill(0);
  if (!data || data.length === 0) return grid;

  const dayMap: Record<number, Record<number, number>> = {};
  let maxCommits = 0;

  for (const entry of data) {
    const hourBlock = Math.floor(entry.hour / 2);
    if (!dayMap[entry.day]) dayMap[entry.day] = {};
    dayMap[entry.day][hourBlock] = (dayMap[entry.day][hourBlock] || 0) + entry.commits;
    if (dayMap[entry.day][hourBlock] > maxCommits) {
      maxCommits = dayMap[entry.day][hourBlock];
    }
  }

  for (let day = 1; day <= 7; day++) {
    const row = day - 1;
    const dayData = dayMap[day] || {};
    for (let col = 0; col < 12; col++) {
      const commits = dayData[col] || 0;
      grid[row * 12 + col] = maxCommits > 0 ? Math.min(commits / maxCommits, 1) : 0;
    }
  }

  for (let col = 0; col < 12; col++) {
    let sum = 0;
    for (let day = 0; day < 7; day++) {
      sum += grid[day * 12 + col];
    }
    grid[7 * 12 + col] = sum / 7;
  }

  return grid;
}

const VelocityMatrix = () => {
  const { data, error, isLoading } = useSWR<VelocityEntry[]>(
    "http://localhost:8080/api/v1/metrics/velocity",
    fetcher,
    { refreshInterval: 10000 }
  );

  const intensities = buildIntensityGrid(data);
  const isEmpty = data && data.length === 0 && !isLoading;

  return (
    <div className="brutal-border p-4 bg-background h-72 font-mono text-sm relative box-glow group">
      <div className="absolute top-0 right-0 p-2 text-xs font-bold bg-dim text-foreground">VELOCITY_MATRIX</div>

      <div className="relative mt-6 h-44">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-pulse font-bold flex items-center gap-2">
              <span className="w-2 h-4 bg-foreground animate-ping" />
              SCANNING_VELOCITY...
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-red-500 font-bold animate-pulse text-glow text-xs">
              MATRIX_STREAM_INTERRUPTED
            </div>
          </div>
        )}
        {isEmpty && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-dim font-bold text-xs">NO_VELOCITY_DATA</div>
          </div>
        )}
        <div className="grid grid-cols-12 gap-1 h-44">
          {intensities.map((intensity, i) => {
            const isHigh = intensity > 0.8;
            const isMed = intensity > 0.4;

            let classes = "w-full h-full transition-all duration-700 ";
            if (isHigh) {
              classes += "bg-foreground shadow-[0_0_10px_#00FF41]";
            } else if (isMed) {
              classes += "bg-dim opacity-80";
            } else {
              classes += "bg-transparent border border-dim opacity-30";
            }

            return (
              <div
                key={i}
                className={classes}
                title={`Node ${i}: Intensity ${Math.round(intensity * 100)}%`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[10px] font-bold opacity-70 group-hover:text-glow transition-all">
        <span>COMMIT_DENSITY_MAP</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-foreground inline-block animate-ping rounded-full" />
          SCAN_ID: {data ? `${data.length}E` : "99x-A"}
        </span>
      </div>
    </div>
  );
};

export default VelocityMatrix;
