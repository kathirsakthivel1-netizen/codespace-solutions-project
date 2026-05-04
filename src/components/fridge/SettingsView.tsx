import { cn } from "@/lib/utils";
import {
  User, Bell, Wifi, Shield, Database, Cpu, Globe, Palette,
  ChevronRight, ToggleLeft, ToggleRight
} from "lucide-react";
import { useState } from "react";

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const settingGroups = [
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { id: "tempAlerts", label: "Temperature Alerts", description: "Notify when temperature exceeds thresholds", enabled: true },
      { id: "expiryAlerts", label: "Expiry Reminders", description: "Get reminded before food expires", enabled: true },
      { id: "doorAlerts", label: "Door Open Alerts", description: "Alert when door is left open too long", enabled: true },
      { id: "soundAlerts", label: "Sound Notifications", description: "Play audio for critical alerts", enabled: false },
    ],
  },
  {
    title: "Connectivity",
    icon: Wifi,
    items: [
      { id: "autoSync", label: "Auto Sync", description: "Sync data with cloud every 5 minutes", enabled: true },
      { id: "mqtt", label: "MQTT Telemetry", description: "Stream sensor data via MQTT protocol", enabled: true },
      { id: "ota", label: "OTA Updates", description: "Automatic firmware updates", enabled: false },
    ],
  },
  {
    title: "AI & Vision",
    icon: Cpu,
    items: [
      { id: "autoDetect", label: "Auto Item Detection", description: "Use camera AI to track items automatically", enabled: true },
      { id: "freshness", label: "Freshness Scoring", description: "AI-predicted spoilage analysis", enabled: true },
      { id: "recipes", label: "Recipe Suggestions", description: "AI recipe recommendations based on inventory", enabled: true },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    items: [
      { id: "localProcess", label: "Local Processing", description: "Run AI models on edge device only", enabled: false },
      { id: "dataEncrypt", label: "Data Encryption", description: "Encrypt sensor data in transit", enabled: true },
      { id: "anonymize", label: "Anonymize Analytics", description: "Remove personal data from usage reports", enabled: true },
    ],
  },
];

export const SettingsView = () => {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    settingGroups.forEach((g) => g.items.forEach((i) => (map[i.id] = i.enabled)));
    return map;
  });

  const toggle = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Profile */}
      <div className="glass rounded-3xl p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <User className="h-7 w-7 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Kathir</p>
          <p className="text-xs text-soft">Smart Fridge Owner · Pro Plan</p>
        </div>
        <ChevronRight className="h-5 w-5 text-softer" />
      </div>

      {/* Setting Groups */}
      {settingGroups.map((group) => (
        <div key={group.title} className="glass rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <group.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <p className="text-sm font-medium">{group.title}</p>
          </div>
          <div className="space-y-1">
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors active:scale-[0.99] touch-manipulation text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.label}</p>
                  <p className="text-xs text-softer">{item.description}</p>
                </div>
                {toggles[item.id] ? (
                  <ToggleRight className="h-6 w-6 text-primary shrink-0" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-softer shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Device Info */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-medium">Device Info</p>
        </div>
        <div className="space-y-2 text-sm">
          {[
            ["Model", "SmartFridge AI Pro"],
            ["Serial", "SF-2025-AX847"],
            ["Firmware", "v3.2.1"],
            ["AI Engine", "YOLOv5n + GPT-4o-mini"],
            ["Storage", "2.4 GB / 8 GB"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-soft">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
