"use client";

import React from "react";

const LanguageRadar = () => {
  const languages = [
    { name: "Scala", val: 85 },
    { name: "Go", val: 70 },
    { name: "TypeScript", val: 95 },
    { name: "Python", val: 40 },
    { name: "Rust", val: 60 },
  ];

  return (
    <div className="border border-foreground p-4 bg-background h-64 font-mono text-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-xs opacity-50">LANGUAGE_RADAR</div>
      <div className="flex flex-col gap-3 mt-4">
        {languages.map((lang) => (
          <div key={lang.name} className="flex flex-col">
            <div className="flex justify-between mb-1">
              <span>{lang.name}</span>
              <span>{lang.val}%</span>
            </div>
            <div className="w-full h-2 border border-foreground bg-dim">
              <div 
                className="h-full bg-foreground" 
                style={{ width: `${lang.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Decorative radar lines */}
      <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none">
         <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
         </svg>
      </div>
    </div>
  );
};

export default LanguageRadar;
