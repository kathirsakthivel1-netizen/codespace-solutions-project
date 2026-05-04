import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { THRESHOLDS, evaluate, describe, severityStyles, type Severity, type MetricReading } from "@/lib/thresholds";
import { cn } from "@/lib/utils";
import { BellRing, ShieldCheck } from "lucide-react";

// Simulated live telemetry. In production this would stream from MQTT / edge function.
function useTelemetry() {
  const [values, setValues] = useState<Record<string, number>>({
    temperature: 3.4,
    humidity: 62,
    gas: 95,
    door: 4,
    vibration: 0.12,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setValues((v) => ({
        temperature: clamp(v.temperature + (Math.random() - 0.45) * 0.6, -1, 9),
        humidity:    clamp(v.humidity + (Math.random() - 0.5) * 4, 25, 90),
        gas:         clamp(v.gas + (Math.random() - 0.4) * 22, 40, 280),
        door:        Math.random() < 0.15 ? clamp(v.door + 30, 0, 180) : Math.max(0, v.door - 5),
        vibration:   clamp(v.vibration + (Math.random() - 0.5) * 0.12, 0, 0.9),
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return values;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const AlertsPanel = () => {
  const values = useTelemetry();
  const lastSeverity = useRef<Record<string, Severity>>({});

  const readings: MetricReading[] = useMemo(
    () => THRESHOLDS.map((t) => ({ ...t, value: values[t.id] ?? 0 })),
    [values]
  );

  // Toast on transition into warning/critical
  useEffect(() => {
    readings.forEach((r) => {
      const sev = evaluate(r);
      const prev = lastSeverity.current[r.id];
      if (prev !== sev && (sev === "warning" || sev === "critical")) {
        const msg = `${r.label}: ${r.value.toFixed(r.id === "vibration" ? 2 : 1)}${r.unit}`;
        const desc = describe(r, sev);
        if (sev === "critical") toast.error(msg, { description: desc });
        else toast.warning(msg, { description: desc });
      }
      lastSeverity.current[r.id] = sev;
    });
  }, [readings]);

  const active = readings
    .map((r) => ({ r, sev: evaluate(r) }))
    .filter((x) => x.sev !== "ok")
    .sort((a, b) => (a.sev === "critical" ? -1 : 1));

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Live alerts
          </h2>
          <p className="text-soft text-xs mt-1">Threshold-based anomaly detection</p>
        </div>
        <div
          className={cn(
            "glass-strong rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium",
            active.length === 0 ? "text-success" : active.some((a) => a.sev === "critical") ? "text-danger" : "text-warning"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              active.length === 0 ? "bg-success" : active.some((a) => a.sev === "critical") ? "bg-danger" : "bg-warning")} />
            <span className={cn("relative inline-flex rounded-full h-2 w-2",
              active.length === 0 ? "bg-success" : active.some((a) => a.sev === "critical") ? "bg-danger" : "bg-warning")} />
          </span>
          {active.length === 0 ? "All systems nominal" : `${active.length} active`}
        </div>
      </div>

      {/* Threshold readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {readings.map((r) => {
          const sev = evaluate(r);
          const s = severityStyles[sev];
          const Icon = r.icon;
          const formatted = r.id === "vibration" ? r.value.toFixed(2) : r.value.toFixed(r.id === "door" ? 0 : 1);
          // Fill bar position relative to warning range
          const [wMin, wMax] = r.warning;
          const span = Math.max(0.001, wMax - wMin);
          const pct = clamp(((r.value - wMin) / span) * 100, 0, 100);
          return (
            <div key={r.id} className={cn("glass rounded-2xl p-4 ring-1", s.ring)}>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl glass-strong flex items-center justify-center">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className={cn("text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full", s.bg, s.text)}>
                  {s.label}
                </span>
              </div>
              <p className="text-[10px] text-softer uppercase tracking-wider truncate">{r.label}</p>
              <p className="text-xl font-semibold tabular-nums leading-tight mt-0.5">
                {formatted}<span className="text-soft text-xs ml-1">{r.unit}</span>
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-700",
                    sev === "ok" && "bg-success",
                    sev === "warning" && "bg-warning",
                    sev === "critical" && "bg-danger"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-softer mt-1.5">
                Safe {r.ok[0]}–{r.ok[1]}{r.unit}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active alert feed */}
      <div>
        <p className="text-[11px] text-softer uppercase tracking-wider mb-2">Active anomalies</p>
        {active.length === 0 ? (
          <div className="glass rounded-2xl p-4 flex items-center gap-3 text-sm">
            <div className="h-9 w-9 rounded-xl bg-success/15 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-success" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium">No anomalies detected</p>
              <p className="text-xs text-soft">All sensors reporting within safe thresholds.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map(({ r, sev }) => {
              const s = severityStyles[sev];
              const Icon = r.icon;
              return (
                <div key={r.id} className={cn("glass rounded-2xl p-3 flex items-center gap-3 ring-1", s.ring)}>
                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                    <Icon className={cn("h-4 w-4", s.text)} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.label} — {r.value.toFixed(r.id === "vibration" ? 2 : 1)}{r.unit}
                    </p>
                    <p className="text-xs text-soft truncate">{describe(r, sev)}</p>
                  </div>
                  <span className={cn("text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full", s.bg, s.text)}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
