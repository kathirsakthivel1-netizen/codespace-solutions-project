import { useState } from "react";
import {
  BookOpen, Camera, Brain, Server, Database, Monitor, BellRing,
  ChevronDown, Lightbulb, PlayCircle, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualStep {
  id: string;
  icon: typeof Camera;
  title: string;
  short: string;
  body: string;
  tips: string[];
  color: string;
}

const manual: ManualStep[] = [
  {
    id: "1",
    icon: Camera,
    title: "1. Capture — Camera scans the shelf",
    short: "Built-in / device camera takes a frame",
    body: "When you open the Computer Vision panel, the system requests access to your device camera (or the in-fridge ESP32-CAM). A live 640×480 video feed streams continuously and a frame is sampled for analysis.",
    tips: [
      "Allow the camera permission when the browser prompts you.",
      "Make sure items are well lit — the scanner works best with even lighting.",
      "Use the Re-scan button to force a new capture at any time.",
    ],
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "2",
    icon: Brain,
    title: "2. Detect — AI recognises items",
    short: "YOLOv5n runs object detection on the frame",
    body: "A lightweight neural network (YOLOv5n) scans the frame and draws bounding boxes around each detected item, labelling it with a confidence score. Inference runs in ~42 ms per frame.",
    tips: [
      "Confidence above 80% is considered a reliable detection.",
      "The model accuracy stat shows the rolling average across the last frames.",
      "Barcodes / QR codes are decoded in parallel for packaged goods.",
    ],
    color: "from-purple-500 to-primary",
  },
  {
    id: "3",
    icon: Server,
    title: "3. Process — Edge controller fuses data",
    short: "ESP32 merges vision + sensor readings",
    body: "Detection results are combined with live sensor data (temperature, humidity, gas, door state, vibration) on the ESP32 edge controller. Anomalies are evaluated against your alert thresholds.",
    tips: [
      "Adjust thresholds in Settings → Notifications.",
      "Edge processing keeps response times under 100 ms.",
    ],
    color: "from-primary to-accent",
  },
  {
    id: "4",
    icon: Database,
    title: "4. Store — Cloud sync over MQTT",
    short: "Inventory + telemetry persisted to the cloud",
    body: "Each detection event and sensor reading is published over MQTT and stored in the cloud database, giving you a full history of what entered and left the fridge.",
    tips: [
      "Enable Auto Sync in Settings → Connectivity for live updates.",
      "Data is encrypted in transit when Data Encryption is on.",
    ],
    color: "from-accent to-pink-500",
  },
  {
    id: "5",
    icon: Monitor,
    title: "5. Display — Dashboard updates live",
    short: "UI reflects the new inventory in real time",
    body: "The Inventory Overview, Expiry Tracking, and Recommendation Engine all refresh automatically as new data arrives — no reload needed.",
    tips: [
      "Use the search bar to quickly find any item.",
      "Tap a category bar to filter the view.",
    ],
    color: "from-pink-500 to-orange-400",
  },
  {
    id: "6",
    icon: BellRing,
    title: "6. Alert — Notifications when needed",
    short: "Critical events surface in Notifications",
    body: "If something goes wrong (door left open, temperature spike, item about to expire) the Notification Center raises a categorised alert and — if enabled — plays a sound.",
    tips: [
      "Critical alerts always show, even if sound is muted.",
      "Use 'Clear All' to reset the feed after reviewing.",
    ],
    color: "from-orange-400 to-warning",
  },
];

export const DataFlowPanel = () => {
  const [open, setOpen] = useState<string | null>("1");

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} />
            User manual
          </h2>
          <p className="text-soft text-xs mt-1">How the Smart Fridge works, step by step</p>
        </div>
        <div className="flex gap-2">
          <div className="glass-strong rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5">
            <PlayCircle className="h-3 w-3 text-primary" strokeWidth={2} />
            <span>6 steps</span>
          </div>
          <div className="glass-strong rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-success" strokeWidth={2} />
            <span>~5 min read</span>
          </div>
        </div>
      </div>

      {/* Quick intro */}
      <div className="glass rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Zap className="h-4 w-4 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Welcome to your Smart Fridge</p>
          <p className="text-xs text-soft leading-relaxed">
            Every item that goes in or out of your fridge flows through the pipeline below.
            Expand any step to learn what happens, what to expect on screen, and how to get the most out of it.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {manual.map((step) => {
          const Icon = step.icon;
          const isOpen = open === step.id;
          return (
            <div
              key={step.id}
              className={cn(
                "glass rounded-2xl overflow-hidden transition-all",
                isOpen && "ring-1 ring-primary/40"
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : step.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", step.color)}>
                  <Icon className="h-4 w-4 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{step.title}</p>
                  <p className="text-[11px] text-softer truncate">{step.short}</p>
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 text-soft shrink-0 transition-transform", isOpen && "rotate-180")}
                  strokeWidth={2}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-0 animate-fade-in">
                  <div className="pl-13 ml-13 border-l border-white/10 pl-4 space-y-3">
                    <p className="text-xs text-soft leading-relaxed">{step.body}</p>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb className="h-3 w-3 text-warning" strokeWidth={2} />
                        <p className="text-[10px] uppercase tracking-wider text-softer">Tips</p>
                      </div>
                      <ul className="space-y-1.5">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-soft flex gap-2">
                            <span className="text-primary shrink-0">›</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-[11px] text-softer text-center mt-5">
        Need more help? Visit the Voice Assistant tab and ask "How do I…"
      </p>
    </section>
  );
};
