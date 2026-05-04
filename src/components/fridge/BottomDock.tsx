import { useState } from "react";
import { LayoutDashboard, Bell, Mic, Monitor, Settings, Heart, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataFlowPanel } from "./DataFlowPanel";

export type TabId = "dashboard" | "notifications" | "voice" | "touchscreen" | "settings";

const items: { id: TabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "notifications", icon: Bell, label: "Alerts" },
  { id: "voice", icon: Mic, label: "Voice AI" },
  { id: "touchscreen", icon: Monitor, label: "Touch UI" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface TopDockProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  alertCount?: number;
}

export const TopDock = ({ activeTab, onTabChange, alertCount = 0 }: TopDockProps) => {
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 animate-fade-in safe-top">
        <div className="glass-strong border-b border-white/10">
          <div className="px-3 sm:px-8 lg:px-12 py-2.5 flex items-center justify-between gap-2 max-w-7xl mx-auto">
            {/* Brand */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                <Heart className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold tracking-tight hidden sm:block">
                Smart<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-1">Fridge</span>
              </span>
            </div>

            {/* Nav Items — horizontal scroll on mobile */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 justify-end">
              {items.map((it) => {
                const Icon = it.icon;
                const isActive = activeTab === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => onTabChange(it.id)}
                    aria-label={it.label}
                    className={cn(
                      "relative h-10 min-w-[2.5rem] px-2.5 sm:px-4 rounded-full flex items-center gap-2 transition-all duration-300 text-sm shrink-0",
                      isActive
                        ? "bg-gradient-to-br from-primary to-accent shadow-[0_0_24px_hsl(var(--primary)/0.55)]"
                        : "hover:bg-white/10 active:scale-95"
                    )}
                  >
                    <Icon
                      className={cn("h-4 w-4", isActive ? "text-white" : "text-white/75")}
                      strokeWidth={1.6}
                    />
                    <span className={cn("hidden lg:inline", isActive ? "text-white font-medium" : "text-white/75")}>
                      {it.label}
                    </span>
                    {it.id === "notifications" && alertCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {alertCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* User Manual — pinned button */}
              <button
                onClick={() => setManualOpen(true)}
                aria-label="Open User Manual"
                title="User Manual — How the Smart Fridge works"
                className="relative h-10 px-2.5 sm:px-4 rounded-full flex items-center gap-2 transition-all duration-300 text-sm ml-1 sm:ml-2 bg-gradient-to-br from-primary/25 to-accent/25 ring-1 ring-primary/60 hover:ring-primary active:scale-95 shadow-[0_0_20px_hsl(var(--primary)/0.35)] shrink-0"
              >
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                <BookOpen className="h-4 w-4 text-primary" strokeWidth={2} />
                <span className="hidden lg:inline text-white font-semibold tracking-tight">Manual</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual modal */}
      {manualOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setManualOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide mt-16 sm:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setManualOpen(false)}
              aria-label="Close manual"
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full glass-strong flex items-center justify-center hover:scale-105 transition-transform"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            <DataFlowPanel />
          </div>
        </div>
      )}
    </>
  );
};
