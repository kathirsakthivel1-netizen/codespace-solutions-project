import { useEffect, useState } from "react";
import {
  Cpu, Camera, Thermometer, Droplets, Wind, DoorOpen,
  Activity, Wifi, CircuitBoard, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "online" | "warning" | "offline";

interface Device {
  id: string;
  model: string;
  role: string;
  icon: LucideIcon;
  status: Status;
  metric: string;
  detail: string;
  signal: number; // 0-100
}

const initialDevices: Device[] = [
  { id: "esp32",   model: "ESP32-WROOM-32", role: "Main controller",        icon: Cpu,          status: "online",  metric: "42°C",     detail: "CPU · 2 cores",        signal: 96 },
  { id: "dht11",   model: "DHT11",          role: "Temp & humidity",        icon: Thermometer,  status: "online",  metric: "3.4°C",    detail: "Humidity 62%",         signal: 88 },
  { id: "mq3",     model: "MQ3",            role: "Spoilage gas sensor",    icon: Wind,         status: "warning", metric: "138 ppm",  detail: "Ethylene rising",      signal: 82 },
  { id: "cam",     model: "ESP32-CAM",      role: "AI vision · inventory",  icon: Camera,       status: "online",  metric: "24 fps",   detail: "12 items detected",    signal: 74 },
  { id: "door",    model: "MC-38 reed",     role: "Door open/close",        icon: DoorOpen,     status: "online",  metric: "Closed",   detail: "Last open 4m ago",     signal: 99 },
  { id: "vib",     model: "SW-420",         role: "Compressor vibration",   icon: Activity,     status: "online",  metric: "0.12 g",   detail: "Compressor healthy",   signal: 91 },
  { id: "humid",   model: "DHT22",          role: "Crisper humidity",       icon: Droplets,     status: "online",  metric: "78%",      detail: "Veg drawer",           signal: 85 },
  { id: "relay",   model: "SRD-05VDC",      role: "Cooling relay board",    icon: CircuitBoard, status: "online",  metric: "ON",       detail: "Channel 1 active",     signal: 100 },
];

const statusStyles: Record<Status, { dot: string; text: string; ring: string; label: string }> = {
  online:  { dot: "bg-success",  text: "text-success",  ring: "ring-success/30",  label: "Online" },
  warning: { dot: "bg-warning",  text: "text-warning",  ring: "ring-warning/30",  label: "Warning" },
  offline: { dot: "bg-danger",   text: "text-danger",   ring: "ring-danger/30",   label: "Offline" },
};

const SignalBars = ({ value }: { value: number }) => {
  const bars = 4;
  const active = Math.ceil((value / 100) * bars);
  return (
    <div className="flex items-end gap-0.5 h-3">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-0.5 rounded-sm transition-colors",
            i < active ? "bg-white/80" : "bg-white/15"
          )}
          style={{ height: `${(i + 1) * 25}%` }}
        />
      ))}
    </div>
  );
};

export const IotDevicePanel = () => {
  const [devices, setDevices] = useState(initialDevices);

  // Simulate live signal fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          signal: Math.max(40, Math.min(100, d.signal + (Math.random() - 0.5) * 6)),
        }))
      );
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const onlineCount = devices.filter((d) => d.status === "online").length;

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" strokeWidth={1.5} />
            IoT devices
          </h2>
          <p className="text-soft text-xs mt-1">Hardware connected to the fridge controller</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="font-medium">{onlineCount}/{devices.length} online</span>
          </div>
          <div className="glass-strong rounded-full px-3 py-1.5 text-xs text-soft">
            Mesh: <span className="text-white font-medium">192.168.4.1</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {devices.map((d) => {
          const Icon = d.icon;
          const s = statusStyles[d.status];
          return (
            <div
              key={d.id}
              className="glass glass-hover rounded-2xl p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("h-10 w-10 rounded-xl glass-strong ring-1 flex items-center justify-center", s.ring)}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", s.dot)} />
                  <span className={cn("text-[10px] uppercase tracking-wider font-medium", s.text)}>{s.label}</span>
                </div>
              </div>

              <p className="text-xs text-softer mb-0.5">{d.model}</p>
              <p className="text-sm font-medium leading-tight mb-3 truncate">{d.role}</p>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-semibold tabular-nums leading-none">{d.metric}</p>
                  <p className="text-[10px] text-soft mt-1 truncate">{d.detail}</p>
                </div>
                <SignalBars value={d.signal} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controller summary */}
      <div className="mt-5 glass rounded-2xl p-4 flex items-center gap-4 flex-wrap">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Cpu className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="text-sm font-medium">ESP32 edge AI · firmware v2.3.1</p>
          <p className="text-xs text-soft">Running on-device YOLOv5n · MQTT broker connected</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <p className="text-softer text-[10px] uppercase tracking-wider">Uptime</p>
            <p className="font-medium tabular-nums">14d 06h</p>
          </div>
          <div>
            <p className="text-softer text-[10px] uppercase tracking-wider">Latency</p>
            <p className="font-medium tabular-nums">38 ms</p>
          </div>
        </div>
      </div>
    </section>
  );
};
