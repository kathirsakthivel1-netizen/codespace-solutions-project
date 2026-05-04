import { useEffect, useState } from "react";
import { Activity, Power, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Simulated MQ3 gas sensor (alcohol/VOC ppm) — feeds spoilage detection
export const GasSensorPanel = () => {
  const [ppm, setPpm] = useState(85);
  const [relay, setRelay] = useState(true); // ventilation/cooling relay
  const [history, setHistory] = useState<number[]>(Array.from({ length: 24 }, () => 80 + Math.random() * 20));

  useEffect(() => {
    const t = setInterval(() => {
      setPpm((prev) => {
        const drift = (Math.random() - 0.5) * 18;
        const next = Math.max(40, Math.min(280, prev + drift + (relay ? -2 : 4)));
        setHistory((h) => [...h.slice(-23), next]);
        return next;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [relay]);

  const status =
    ppm < 120 ? { label: "Safe", tone: "success" as const, icon: ShieldCheck, msg: "Air quality nominal" }
    : ppm < 200 ? { label: "Caution", tone: "warning" as const, icon: Activity, msg: "Slight spoilage detected" }
    : { label: "Alert", tone: "danger" as const, icon: AlertTriangle, msg: "Spoiling product — relay engaging" };

  const StatusIcon = status.icon;
  const max = 300;
  const pct = Math.min(100, (ppm / max) * 100);

  return (
    <div className="glass rounded-3xl p-5 sm:p-6 animate-scale-in flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">MQ3 gas monitor</h2>
          <p className="text-soft text-xs mt-1">Spoilage & VOC detection</p>
        </div>
        <button
          onClick={() => setRelay((r) => !r)}
          aria-label="Toggle relay"
          className={cn(
            "glass-strong rounded-full px-3 py-2 flex items-center gap-2 text-xs font-medium transition-all hover:scale-105",
            relay ? "text-success" : "text-soft"
          )}
        >
          <Power className="h-3.5 w-3.5" strokeWidth={2} />
          Relay {relay ? "ON" : "OFF"}
        </button>
      </div>

      {/* Big PPM gauge */}
      <div className="relative">
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight tabular-nums">{Math.round(ppm)}</span>
            <span className="text-soft text-sm">ppm</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
              status.tone === "success" && "bg-success/15 text-success",
              status.tone === "warning" && "bg-warning/15 text-warning",
              status.tone === "danger" && "bg-danger/15 text-danger animate-pulse"
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
            {status.label}
          </div>
        </div>

        {/* Bar gauge */}
        <div className="relative h-3 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              status.tone === "success" && "bg-gradient-to-r from-success/60 to-success",
              status.tone === "warning" && "bg-gradient-to-r from-warning/60 to-warning",
              status.tone === "danger" && "bg-gradient-to-r from-danger/60 to-danger"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-softer mt-1.5">
          <span>0</span><span>safe 120</span><span>alert 200</span><span>{max}</span>
        </div>
        <p className="text-xs text-soft mt-3">{status.msg}</p>
      </div>

      {/* Sparkline history */}
      <div>
        <p className="text-[11px] text-softer uppercase tracking-wider mb-2">Last 60s</p>
        <div className="flex items-end gap-1 h-16">
          {history.map((v, i) => {
            const h = Math.max(8, (v / max) * 100);
            const tone =
              v < 120 ? "bg-success/70" : v < 200 ? "bg-warning/70" : "bg-danger/80";
            return (
              <div
                key={i}
                className={cn("flex-1 rounded-t-sm transition-all duration-500", tone)}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
