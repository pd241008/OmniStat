"use client";

import React, { useEffect, useState } from "react";

const VelocityMatrix = () => {
  const [mounted, setMounted] = useState(false);
  const [intensities, setIntensities] = useState<number[]>([]);
  
  const rows = 8;
  const cols = 12;
  const totalNodes = rows * cols;

  useEffect(() => {
    setMounted(true);
    // Generate initial intensities
    setIntensities(Array.from({ length: totalNodes }).map(() => Math.random()));
    
    // Simulate live traffic by occasionally spiking random nodes
    const interval = setInterval(() => {
      setIntensities(prev => {
        const newIntensities = [...prev];
        const spikeCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < spikeCount; i++) {
          const idx = Math.floor(Math.random() * totalNodes);
          newIntensities[idx] = Math.random();
        }
        return newIntensities;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null; // Hydration fix
  
  return (
    <div className="brutal-border p-4 bg-background h-72 font-mono text-sm relative box-glow group">
      <div className="absolute top-0 right-0 p-2 text-xs font-bold bg-dim text-foreground">VELOCITY_MATRIX</div>
      <div className="grid grid-cols-12 gap-1 mt-6 h-44">
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
      <div className="mt-4 flex justify-between text-[10px] font-bold opacity-70 group-hover:text-glow transition-all">
        <span>COMMIT_DENSITY_MAP</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-foreground inline-block animate-ping rounded-full" />
          SCAN_ID: 99x-A
        </span>
      </div>
    </div>
  );
};

export default VelocityMatrix;
