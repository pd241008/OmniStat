"use client";

import useSWR from "swr";
import TerminalFeed from "@/components/TerminalFeed";
import LanguageRadar from "@/components/LanguageRadar";
import VelocityMatrix from "@/components/VelocityMatrix";
import { Activity, Shield, Cpu, Database } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: metrics, error } = useSWR("http://localhost:8080/api/v1/metrics/generic", fetcher, {
    refreshInterval: 5000,
  });

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-foreground pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">OMNISTAT // THE_TERMINAL</h1>
          <p className="text-sm opacity-70 mt-1">POLYGLOT_OBSERVABILITY_INTERFACE_V1.0.4</p>
        </div>
        <div className="text-right text-xs">
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 bg-foreground animate-pulse" />
            UPLINK_ESTABLISHED
          </div>
          <div className="mt-1">PORT: 8080 // SECURE</div>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "GATEWAY_STATUS", value: "ONLINE", icon: Shield },
          { label: "FORGE_NODES", value: "04/04", icon: Database },
          { label: "THROUGHPUT", value: "1.2 GB/S", icon: Activity },
          { label: "LATENCY", value: "14MS", icon: Cpu },
        ].map((stat, i) => (
          <div key={i} className="border border-foreground p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] opacity-50 uppercase">{stat.label}</div>
              <div className="text-xl font-bold">{stat.value}</div>
            </div>
            <stat.icon className="w-6 h-6 opacity-30" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xs mb-2 opacity-70 font-mono tracking-widest uppercase">/ REALTIME_LOGS</h2>
            <TerminalFeed />
          </section>
          
          <section>
            <h2 className="text-xs mb-2 opacity-70 font-mono tracking-widest uppercase">/ SYSTEM_METRICS</h2>
            <div className="border border-foreground p-4 h-64 flex flex-col justify-center gap-4">
              {error ? (
                <div className="text-red-500">ERROR: FAILED_TO_FETCH_UPLINK</div>
              ) : !metrics ? (
                <div className="animate-pulse">SYNCHRONIZING_DATA...</div>
              ) : (
                metrics.map((m: any) => (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span>{m.name}</span>
                      <span>{m.value}%</span>
                    </div>
                    <div className="w-full h-1 bg-dim">
                      <div className="h-full bg-foreground" style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xs mb-2 opacity-70 font-mono tracking-widest uppercase">/ REPO_DISTRIBUTION</h2>
            <LanguageRadar />
          </section>
          
          <section>
            <h2 className="text-xs mb-2 opacity-70 font-mono tracking-widest uppercase">/ COMMIT_VELOCITY</h2>
            <VelocityMatrix />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 border-t border-dim flex justify-between text-[10px] opacity-40 font-mono">
        <div>(C) 2026 BLUME_CORP // DATA_SEC_PROTOCOL</div>
        <div>UPLINK_ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
      </footer>
    </main>
  );
}
