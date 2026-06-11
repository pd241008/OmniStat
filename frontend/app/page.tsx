"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import TerminalFeed from "@/components/TerminalFeed";
import LanguageRadar from "@/components/LanguageRadar";
import VelocityMatrix from "@/components/VelocityMatrix";
import { Activity, Shield, Cpu, Database } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [uplinkId, setUplinkId] = useState("");

  const { data: metrics, error } = useSWR("http://localhost:8080/api/v1/metrics/generic", fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    setMounted(true);
    setUplinkId(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch entirely

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b-2 border-foreground pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-glow">OMNISTAT // THE_TERMINAL</h1>
          <p className="text-sm opacity-90 mt-1 font-bold">POLYGLOT_OBSERVABILITY_INTERFACE_V1.0.4</p>
        </div>
        <div className="text-left md:text-right text-xs font-bold">
          <div className="flex items-center gap-2 md:justify-end text-glow">
            <span className="w-2 h-2 bg-foreground animate-pulse" />
            UPLINK_ESTABLISHED
          </div>
          <div className="mt-1">PORT: 8080 // SECURE</div>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "GATEWAY_STATUS", value: "ONLINE", icon: Shield },
          { label: "FORGE_NODES", value: "04/04", icon: Database },
          { label: "THROUGHPUT", value: "1.2 GB/S", icon: Activity },
          { label: "LATENCY", value: "14MS", icon: Cpu },
        ].map((stat, i) => (
          <div key={i} className="brutal-border bg-background p-4 flex items-center justify-between group">
            <div>
              <div className="text-[10px] opacity-70 uppercase font-bold group-hover:text-glow">{stat.label}</div>
              <div className="text-2xl font-bold mt-1 group-hover:text-glow transition-all">{stat.value}</div>
            </div>
            <stat.icon className="w-8 h-8 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-sm mb-3 opacity-90 font-mono tracking-widest uppercase font-bold text-glow">/ REALTIME_LOGS</h2>
            <TerminalFeed />
          </section>
          
          <section>
            <h2 className="text-sm mb-3 opacity-90 font-mono tracking-widest uppercase font-bold text-glow">/ SYSTEM_METRICS</h2>
            <div className="brutal-border bg-background p-6 h-72 flex flex-col justify-center gap-6 relative overflow-hidden box-glow">
              <div className="absolute top-0 right-0 p-2 text-xs opacity-50 bg-dim text-foreground">LIVE_METRICS</div>
              {error ? (
                <div className="text-red-500 font-bold animate-pulse text-glow">CRITICAL ERROR: FAILED_TO_FETCH_UPLINK</div>
              ) : !metrics ? (
                <div className="animate-pulse font-bold flex items-center gap-2">
                  <span className="w-2 h-4 bg-foreground animate-ping" />
                  SYNCHRONIZING_DATA...
                </div>
              ) : (
                metrics.map((m: any) => (
                  <div key={m.id} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="uppercase">{m.name}</span>
                      <span className="text-glow">{m.value}%</span>
                    </div>
                    <div className="w-full h-2 border border-foreground bg-dim">
                      <div className="h-full bg-foreground shadow-[0_0_8px_#00FF41] transition-all duration-500" style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-sm mb-3 opacity-90 font-mono tracking-widest uppercase font-bold text-glow">/ REPO_DISTRIBUTION</h2>
            <LanguageRadar />
          </section>
          
          <section>
            <h2 className="text-sm mb-3 opacity-90 font-mono tracking-widest uppercase font-bold text-glow">/ COMMIT_VELOCITY</h2>
            <VelocityMatrix />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-8 border-t-2 border-dim flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] opacity-60 font-mono font-bold">
        <div className="hover:text-glow cursor-default">(C) 2026 BLUME_CORP // DATA_SEC_PROTOCOL</div>
        <div className="hover:text-glow cursor-default border border-dim px-2 py-1">UPLINK_ID: {uplinkId}</div>
      </footer>
    </main>
  );
}
