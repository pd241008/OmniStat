"use client";

import React from "react";

const VelocityMatrix = () => {
  const rows = 8;
  const cols = 12;
  
  return (
    <div className="border border-foreground p-4 bg-background h-64 font-mono text-sm relative">
      <div className="absolute top-0 right-0 p-2 text-xs opacity-50">VELOCITY_MATRIX</div>
      <div className="grid grid-cols-12 gap-1 mt-6 h-40">
        {Array.from({ length: rows * cols }).map((_, i) => {
          const intensity = Math.random();
          const opacity = intensity > 0.8 ? "bg-foreground" : intensity > 0.4 ? "bg-dim" : "bg-transparent border border-dim";
          return (
            <div 
              key={i} 
              className={`w-full h-full ${opacity}`}
              title={`Node ${i}: Intensity ${Math.round(intensity * 100)}%`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-[10px] opacity-70">
        <span>COMMIT_DENSITY_MAP</span>
        <span>SCAN_ID: 99x-A</span>
      </div>
    </div>
  );
};

export default VelocityMatrix;
