import { type LucideIcon, Thermometer, Droplets, Wind, DoorOpen, Activity } from "lucide-react";

export type Severity = "ok" | "warning" | "critical";

export interface MetricReading {
  id: "temperature" | "humidity" | "gas" | "door" | "vibration";
  label: string;
  unit: string;
  value: number;
  icon: LucideIcon;
  /** Inclusive ranges. Outside warning → critical. Outside ok → warning. */
  ok: [number, number];
  warning: [number, number];
  /** Direction of badness for messaging. */
  direction: "high" | "low" | "either";
}

export const THRESHOLDS: Omit<MetricReading, "value">[] = [
  { id: "temperature", label: "Interior temp",     unit: "°C",  icon: Thermometer, ok: [2, 5],     warning: [0, 7],    direction: "either" },
  { id: "humidity",    label: "Humidity",          unit: "%",   icon: Droplets,    ok: [40, 70],   warning: [30, 80],  direction: "either" },
  { id: "gas",         label: "MQ3 gas",           unit: "ppm", icon: Wind,        ok: [0, 120],   warning: [0, 200],  direction: "high" },
  { id: "door",        label: "Door open time",    unit: "s",   icon: DoorOpen,    ok: [0, 30],    warning: [0, 90],   direction: "high" },
  { id: "vibration",   label: "Compressor vib.",   unit: "g",   icon: Activity,    ok: [0, 0.3],   warning: [0, 0.6],  direction: "high" },
];

export function evaluate(reading: MetricReading): Severity {
  const [okMin, okMax] = reading.ok;
  const [wMin, wMax] = reading.warning;
  if (reading.value >= okMin && reading.value <= okMax) return "ok";
  if (reading.value >= wMin && reading.value <= wMax) return "warning";
  return "critical";
}

export function describe(reading: MetricReading, severity: Severity): string {
  if (severity === "ok") return "Within safe range";
  const [okMin, okMax] = reading.ok;
  if (reading.direction === "high" || reading.value > okMax) {
    return `Above safe limit (>${okMax}${reading.unit})`;
  }
  return `Below safe limit (<${okMin}${reading.unit})`;
}

export const severityStyles: Record<Severity, { text: string; bg: string; ring: string; label: string; dot: string }> = {
  ok:       { text: "text-success", bg: "bg-success/15",  ring: "ring-success/30",  label: "OK",       dot: "bg-success" },
  warning:  { text: "text-warning", bg: "bg-warning/15",  ring: "ring-warning/30",  label: "Warning",  dot: "bg-warning" },
  critical: { text: "text-danger",  bg: "bg-danger/15",   ring: "ring-danger/30",   label: "Critical", dot: "bg-danger" },
};
