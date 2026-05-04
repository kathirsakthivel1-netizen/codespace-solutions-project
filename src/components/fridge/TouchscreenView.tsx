import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Snowflake, Sun, Moon, Wifi, WifiOff, Battery, BatteryCharging,
  Thermometer, Droplets, ChevronUp, ChevronDown, Power, Lightbulb,
  Volume2, VolumeX, Lock, Unlock, Gauge, Eye
} from "lucide-react";

interface ControlState {
  fridgeTemp: number;
  freezerTemp: number;
  brightness: number;
  volume: number;
  wifiOn: boolean;
  childLock: boolean;
  ecoMode: boolean;
  nightMode: boolean;
  interiorLight: boolean;
  quickCool: boolean;
}

export const TouchscreenView = () => {
  const [controls, setControls] = useState<ControlState>({
    fridgeTemp: 4,
    freezerTemp: -18,
    brightness: 75,
    volume: 50,
    wifiOn: true,
    childLock: false,
    ecoMode: true,
    nightMode: false,
    interiorLight: true,
    quickCool: false,
  });

  const updateControl = <K extends keyof ControlState>(key: K, value: ControlState[K]) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Fridge Display Simulation */}
      <div className="glass rounded-3xl overflow-hidden">
        {/* Simulated display header */}
        <div className="bg-gradient-to-r from-black/40 to-black/20 px-5 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-medium">Touchscreen Interface</span>
          </div>
          <div className="flex items-center gap-3">
            {controls.wifiOn ? (
              <Wifi className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-danger" strokeWidth={1.5} />
            )}
            <BatteryCharging className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
            <span className="text-[10px] text-soft">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Temperature Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Fridge Temp */}
            <div className="glass rounded-2xl p-5 flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-3">
                <Thermometer className="h-7 w-7 text-cyan-400" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] text-softer uppercase tracking-wider mb-1">Fridge</p>
              <p className="text-4xl font-bold tabular-nums mb-3">{controls.fridgeTemp}°C</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateControl("fridgeTemp", Math.max(1, controls.fridgeTemp - 1))}
                  className="h-12 w-12 rounded-xl glass-strong flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <div className="h-2 w-20 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all"
                    style={{ width: `${((controls.fridgeTemp - 1) / 7) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => updateControl("fridgeTemp", Math.min(8, controls.fridgeTemp + 1))}
                  className="h-12 w-12 rounded-xl glass-strong flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[10px] text-softer mt-2">Range: 1°C – 8°C</p>
            </div>

            {/* Freezer Temp */}
            <div className="glass rounded-2xl p-5 flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-500/20 flex items-center justify-center mb-3">
                <Snowflake className="h-7 w-7 text-blue-400" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] text-softer uppercase tracking-wider mb-1">Freezer</p>
              <p className="text-4xl font-bold tabular-nums mb-3">{controls.freezerTemp}°C</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateControl("freezerTemp", Math.max(-24, controls.freezerTemp - 1))}
                  className="h-12 w-12 rounded-xl glass-strong flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <div className="h-2 w-20 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all"
                    style={{ width: `${((controls.freezerTemp + 24) / 12) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => updateControl("freezerTemp", Math.min(-12, controls.freezerTemp + 1))}
                  className="h-12 w-12 rounded-xl glass-strong flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[10px] text-softer mt-2">Range: -24°C – -12°C</p>
            </div>
          </div>

          {/* Quick Toggle Controls */}
          <p className="text-xs text-softer uppercase tracking-wider mb-3">Quick Controls</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { key: "quickCool" as const, icon: Gauge, label: "Quick Cool", active: controls.quickCool, color: "from-cyan-500 to-blue-500" },
              { key: "ecoMode" as const, icon: Sun, label: "Eco Mode", active: controls.ecoMode, color: "from-emerald-500 to-green-400" },
              { key: "nightMode" as const, icon: Moon, label: "Night Mode", active: controls.nightMode, color: "from-indigo-500 to-purple-500" },
              { key: "interiorLight" as const, icon: Lightbulb, label: "Interior Light", active: controls.interiorLight, color: "from-amber-400 to-yellow-400" },
              { key: "childLock" as const, icon: controls.childLock ? Lock : Unlock, label: "Child Lock", active: controls.childLock, color: "from-rose-500 to-pink-400" },
              { key: "wifiOn" as const, icon: controls.wifiOn ? Wifi : WifiOff, label: "Wi-Fi", active: controls.wifiOn, color: "from-primary to-accent" },
            ].map((toggle) => (
              <button
                key={toggle.key}
                onClick={() => updateControl(toggle.key, !toggle.active)}
                className={cn(
                  "glass rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 touch-manipulation",
                  toggle.active ? "ring-1 ring-white/20" : "opacity-60"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                  toggle.active ? `bg-gradient-to-br ${toggle.color} shadow-lg` : "glass-strong"
                )}>
                  <toggle.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                <p className="text-xs font-medium">{toggle.label}</p>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  toggle.active ? "bg-success/20 text-success" : "bg-white/5 text-softer"
                )}>
                  {toggle.active ? "ON" : "OFF"}
                </span>
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brightness */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                  <p className="text-sm">Brightness</p>
                </div>
                <span className="text-sm font-medium tabular-nums">{controls.brightness}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={controls.brightness}
                onChange={(e) => updateControl("brightness", Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-white/10 accent-amber-400 touch-manipulation"
              />
            </div>

            {/* Volume */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {controls.volume > 0 ? (
                    <Volume2 className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  ) : (
                    <VolumeX className="h-4 w-4 text-softer" strokeWidth={1.5} />
                  )}
                  <p className="text-sm">Volume</p>
                </div>
                <span className="text-sm font-medium tabular-nums">{controls.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={controls.volume}
                onChange={(e) => updateControl("volume", Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-white/10 accent-primary touch-manipulation"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="glass rounded-3xl p-5">
        <p className="text-xs text-softer uppercase tracking-wider mb-3">System Information</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Model", value: "SF-AI Pro" },
            { label: "Firmware", value: "v3.2.1" },
            { label: "Uptime", value: "45 days" },
            { label: "Power", value: "145W" },
          ].map((info) => (
            <div key={info.label} className="glass rounded-xl p-3 text-center">
              <p className="text-[10px] text-softer uppercase tracking-wider">{info.label}</p>
              <p className="text-sm font-medium mt-1">{info.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
