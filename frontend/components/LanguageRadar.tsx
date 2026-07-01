"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { LanguageMetric } from "@/lib/types";

const LanguageRadar = () => {
  const [mounted, setMounted] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const { data: languages, error } = useSWR<LanguageMetric[]>("http://localhost:8080/api/v1/metrics/languages", fetcher, {
    refreshInterval: 10000,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    let r = 0;
    const interval = setInterval(() => {
      r = (r + 2) % 360;
      setRotation(r);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="brutal-border p-4 bg-background h-72 font-mono text-sm relative overflow-hidden box-glow group">
      <div className="absolute top-0 right-0 p-2 text-xs font-bold bg-dim text-foreground z-10">LANGUAGE_RADAR</div>
      
      {error ? (
        <div className="mt-8 text-red-500 font-bold animate-pulse text-glow z-10 relative">ERROR: GATEWAY_UNREACHABLE</div>
      ) : !languages ? (
        <div className="mt-8 animate-pulse font-bold z-10 relative">SCANNING_REPOSITORIES...</div>
      ) : (
        <div className="flex flex-col gap-3 mt-4 relative z-10">
          {languages.map((lang: LanguageMetric, index: number) => (
            <div key={lang.name} className="flex flex-col transition-opacity">
              <div className="flex justify-between mb-1 font-bold">
                <span>{lang.name}</span>
                <span className="text-glow">{lang.val}%</span>
              </div>
              <div className="w-full h-2 border border-foreground bg-dim overflow-hidden">
                <div 
                  className="h-full bg-foreground shadow-[0_0_8px_#00FF41]" 
                  style={{ width: `${lang.val}%`, animation: `grow ${0.5 + index * 0.1}s ease-out forwards` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Decorative radar lines */}
      <div className="absolute -bottom-16 -right-16 opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity">
         <svg width="250" height="250" viewBox="0 0 100 100" style={{ transform: `rotate(${rotation}deg)` }}>
            <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
            <path d="M50 50 L50 10 A40 40 0 0 1 90 50 Z" fill="currentColor" fillOpacity="0.1" />
         </svg>
      </div>
      <style jsx>{`
        @keyframes grow {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default LanguageRadar;
