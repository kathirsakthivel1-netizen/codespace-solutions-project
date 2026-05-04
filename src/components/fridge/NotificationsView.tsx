import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AlertsPanel } from "./AlertsPanel";
import {
  Bell, BellRing, Thermometer, Droplets, Wind, DoorOpen, Activity,
  Check, X, AlertTriangle, ShieldAlert, Info, Clock, Filter, Trash2
} from "lucide-react";

type AlertType = "critical" | "warning" | "info" | "success";
type AlertCategory = "temperature" | "humidity" | "gas" | "door" | "vibration" | "system" | "expiry";

interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  dismissed: boolean;
}

const categoryIcons: Record<AlertCategory, typeof Thermometer> = {
  temperature: Thermometer,
  humidity: Droplets,
  gas: Wind,
  door: DoorOpen,
  vibration: Activity,
  system: Info,
  expiry: Clock,
};

const typeStyles: Record<AlertType, { bg: string; text: string; ring: string; icon: typeof AlertTriangle }> = {
  critical: { bg: "bg-danger/15", text: "text-danger", ring: "ring-danger/30", icon: ShieldAlert },
  warning: { bg: "bg-warning/15", text: "text-warning", ring: "ring-warning/30", icon: AlertTriangle },
  info: { bg: "bg-primary/15", text: "text-primary", ring: "ring-primary/30", icon: Info },
  success: { bg: "bg-success/15", text: "text-success", ring: "ring-success/30", icon: Check },
};

const initialAlerts: Alert[] = [
  { id: "1", type: "critical", category: "temperature", title: "Temperature Spike Detected", message: "Freezer compartment reached 8.2°C — exceeds safe threshold of 5°C. Compressor check recommended.", time: new Date(Date.now() - 120000), read: false, dismissed: false },
  { id: "2", type: "warning", category: "gas", title: "Elevated MQ3 Reading", message: "Gas sensor reading 145 ppm — ethylene levels indicate potential spoilage in vegetable drawer.", time: new Date(Date.now() - 300000), read: false, dismissed: false },
  { id: "3", type: "warning", category: "expiry", title: "3 Items Expiring Soon", message: "Whole Milk (2h), Yogurt (6h), and Cheddar Cheese (12h) are approaching expiry.", time: new Date(Date.now() - 600000), read: false, dismissed: false },
  { id: "4", type: "info", category: "door", title: "Door Left Open", message: "Right door was open for 45 seconds. Auto-close mechanism activated.", time: new Date(Date.now() - 900000), read: true, dismissed: false },
  { id: "5", type: "success", category: "system", title: "AI Model Updated", message: "YOLOv5n object detection model synced successfully. 23 new items catalogued.", time: new Date(Date.now() - 1800000), read: true, dismissed: false },
  { id: "6", type: "warning", category: "vibration", title: "Compressor Vibration Anomaly", message: "Vibration level 0.38g detected — slightly above 0.3g threshold. Monitoring continues.", time: new Date(Date.now() - 3600000), read: true, dismissed: false },
  { id: "7", type: "info", category: "humidity", title: "Humidity Adjusted", message: "Humidity stabilized to 62% after temporary spike to 78%. No action needed.", time: new Date(Date.now() - 7200000), read: true, dismissed: false },
];

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const NotificationsView = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<AlertType | "all">("all");
  const [, setTick] = useState(0);

  // Live-inject random new alerts
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.3) {
        const templates = [
          { type: "warning" as AlertType, category: "temperature" as AlertCategory, title: "Temp fluctuation", message: `Temperature drifted to ${(3 + Math.random() * 4).toFixed(1)}°C` },
          { type: "info" as AlertType, category: "system" as AlertCategory, title: "Inventory scan complete", message: `${Math.floor(20 + Math.random() * 10)} items detected by AI vision` },
          { type: "warning" as AlertType, category: "gas" as AlertCategory, title: "Gas level rising", message: `MQ3 reading at ${Math.floor(100 + Math.random() * 80)} ppm` },
        ];
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        const newAlert: Alert = {
          id: Date.now().toString(),
          ...tpl,
          time: new Date(),
          read: false,
          dismissed: false,
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
      }
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // Update times
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const markRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, dismissed: true })));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const visible = alerts
    .filter((a) => !a.dismissed)
    .filter((a) => filter === "all" || a.type === filter);

  const unreadCount = alerts.filter((a) => !a.dismissed && !a.read).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" strokeWidth={1.5} />
              Notification Center
            </h2>
            <p className="text-soft text-xs mt-1">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={markAllRead} className="glass rounded-full px-3 py-1.5 text-xs text-soft hover:text-white transition-colors flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Mark all read
            </button>
            <button onClick={clearAll} className="glass rounded-full px-3 py-1.5 text-xs text-soft hover:text-danger transition-colors flex items-center gap-1.5">
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {(["all", "critical", "warning", "info", "success"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                filter === f
                  ? "bg-gradient-to-br from-primary to-accent text-white"
                  : "glass text-soft hover:text-white"
              )}
            >
              <Filter className="h-3 w-3 inline mr-1" />
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className="ml-1 opacity-60">
                  ({alerts.filter((a) => !a.dismissed && a.type === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-2">
          {visible.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Bell className="h-8 w-8 text-softer mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-soft">No alerts to display</p>
            </div>
          ) : (
            visible.map((alert) => {
              const style = typeStyles[alert.type];
              const CatIcon = categoryIcons[alert.category];
              const TypeIcon = style.icon;
              return (
                <div
                  key={alert.id}
                  onClick={() => markRead(alert.id)}
                  className={cn(
                    "glass rounded-2xl p-4 flex items-start gap-3 ring-1 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]",
                    style.ring,
                    !alert.read && "border-l-2 border-l-primary"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", style.bg)}>
                    <CatIcon className={cn("h-5 w-5", style.text)} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full", style.bg, style.text)}>
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-softer">{timeAgo(alert.time)}</span>
                      {!alert.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-soft mt-0.5 line-clamp-2">{alert.message}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                    className="h-8 w-8 rounded-full glass flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5 text-soft" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Live Sensor Alerts (existing component) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">⚡</div>
          <h2 className="text-xs font-semibold text-soft uppercase tracking-wider">Live Sensor Monitoring</h2>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <AlertsPanel />
      </div>
    </div>
  );
};

