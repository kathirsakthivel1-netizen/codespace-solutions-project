import { useEffect, useRef, useState } from "react";
import { Camera, Eye, Box, Brain, CameraOff, AlertTriangle, Apple, Save, Trash2, CheckCircle2 } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { cn } from "@/lib/utils";
import { upsertDetection, useInventory, removeInventoryItem, clearInventory } from "@/lib/inventoryStore";

type Category = "fruit" | "vegetable" | "food" | "container";

interface ClassMeta {
  label: string;
  emoji: string;
  category: Category;
  fallbackColor: string; // used only if pixel sampling fails
}

const FOOD_CLASSES: Record<string, ClassMeta> = {
  apple:        { label: "Apple",      emoji: "🍎", category: "fruit",     fallbackColor: "hsl(0 80% 55%)" },
  banana:       { label: "Banana",     emoji: "🍌", category: "fruit",     fallbackColor: "hsl(50 95% 55%)" },
  orange:       { label: "Orange",     emoji: "🍊", category: "fruit",     fallbackColor: "hsl(28 95% 55%)" },
  broccoli:     { label: "Broccoli",   emoji: "🥦", category: "vegetable", fallbackColor: "hsl(120 60% 45%)" },
  carrot:       { label: "Carrot",     emoji: "🥕", category: "vegetable", fallbackColor: "hsl(20 90% 55%)" },
  sandwich:     { label: "Sandwich",   emoji: "🥪", category: "food",      fallbackColor: "hsl(35 70% 55%)" },
  "hot dog":    { label: "Hot Dog",    emoji: "🌭", category: "food",      fallbackColor: "hsl(15 80% 55%)" },
  pizza:        { label: "Pizza",      emoji: "🍕", category: "food",      fallbackColor: "hsl(10 85% 55%)" },
  donut:        { label: "Donut",      emoji: "🍩", category: "food",      fallbackColor: "hsl(330 75% 65%)" },
  cake:         { label: "Cake",       emoji: "🍰", category: "food",      fallbackColor: "hsl(310 70% 65%)" },
  bottle:       { label: "Bottle",     emoji: "🍾", category: "container", fallbackColor: "hsl(200 70% 55%)" },
  "wine glass": { label: "Wine Glass", emoji: "🍷", category: "container", fallbackColor: "hsl(340 60% 60%)" },
  cup:          { label: "Cup",        emoji: "🥤", category: "container", fallbackColor: "hsl(220 60% 60%)" },
  bowl:         { label: "Bowl",       emoji: "🥣", category: "container", fallbackColor: "hsl(40 60% 55%)" },
};

interface TrackedDetection {
  trackId: string;
  className: string;
  label: string;
  emoji: string;
  category: Category;
  confidence: number;
  color: string;          // sampled
  // bbox in % of viewport for rendering
  x: number; y: number; w: number; h: number;
  // raw pixel bbox for sampling
  px: number; py: number; pw: number; ph: number;
  hits: number;           // consecutive frames matched
  missed: number;         // frames without match
  saved: boolean;
}

type CamState = "idle" | "requesting" | "live" | "denied" | "error";

// ── helpers ────────────────────────────────────────────────────────────
const iou = (a: TrackedDetection, b: { px: number; py: number; pw: number; ph: number }) => {
  const ax2 = a.px + a.pw, ay2 = a.py + a.ph;
  const bx2 = b.px + b.pw, by2 = b.py + b.ph;
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.px, b.px));
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.py, b.py));
  const inter = ix * iy;
  const ua = a.pw * a.ph + b.pw * b.ph - inter;
  return ua <= 0 ? 0 : inter / ua;
};

// Sample dominant color from the bbox region of the video using a tiny canvas.
// Returns an HSL string suitable for inline styles.
function sampleColor(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number, y: number, w: number, h: number,
): string {
  const SW = 24, SH = 24;
  try {
    ctx.drawImage(video, x, y, w, h, 0, 0, SW, SH);
    const data = ctx.getImageData(0, 0, SW, SH).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const R = data[i], G = data[i + 1], B = data[i + 2];
      // skip near-black & near-white pixels (background / specular)
      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      const lum = (max + min) / 2;
      const sat = max === min ? 0 : (max - min) / (255 - Math.abs(2 * lum - 255) || 1);
      if (lum < 25 || lum > 235) continue;
      if (sat < 0.12) continue;
      r += R; g += G; b += B; n++;
    }
    if (n < 8) return "";
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    // RGB → HSL
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let s = 0, hue = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: hue = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
        case gn: hue = ((bn - rn) / d + 2); break;
        default: hue = ((rn - gn) / d + 4);
      }
      hue *= 60;
    }
    const S = Math.min(95, Math.round(s * 100) + 15);
    const L = Math.min(70, Math.max(35, Math.round(l * 100)));
    return `hsl(${Math.round(hue)} ${S}% ${L}%)`;
  } catch {
    return "";
  }
}

const newTrackId = (cls: string) => `${cls}-${Math.random().toString(36).slice(2, 8)}`;

// ── component ──────────────────────────────────────────────────────────
export const ComputerVisionPanel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const fpsAccumRef = useRef<number>(0);
  const tracksRef = useRef<TrackedDetection[]>([]);

  const [camState, setCamState] = useState<CamState>("idle");
  const [camError, setCamError] = useState<string>("");
  const [modelLoading, setModelLoading] = useState(true);
  const [tracks, setTracks] = useState<TrackedDetection[]>([]);
  const [fps, setFps] = useState(0);
  const [inferMs, setInferMs] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const inventory = useInventory();

  // init sample canvas once
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 24; c.height = 24;
    sampleCanvasRef.current = c;
  }, []);

  // Load COCO-SSD (use mobilenet_v2 for better accuracy)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await tf.ready();
        try { await tf.setBackend("webgl"); } catch { /* fallback to default */ }
        const model = await cocoSsd.load({ base: "mobilenet_v2" });
        if (!cancelled) { modelRef.current = model; setModelLoading(false); }
      } catch (e) {
        console.error("Model load error", e);
        if (!cancelled) setModelLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const startCamera = async () => {
    setCamState("requesting"); setCamError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera API not supported");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamState("live");
    } catch (e: any) {
      const name = e?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCamState("denied");
        setCamError("Camera permission denied. Please allow access in your browser settings.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCamState("error"); setCamError("No camera detected on this device.");
      } else {
        setCamState("error"); setCamError(e?.message || "Unable to access camera.");
      }
    }
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState("idle"); setTracks([]); tracksRef.current = []; setFps(0);
  };

  // auto-start
  useEffect(() => {
    startCamera();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detection + tracking loop
  useEffect(() => {
    if (camState !== "live" || !modelRef.current || !videoRef.current) return;
    let active = true;
    const SMOOTH = 0.4;        // EMA factor for bbox smoothing
    const MIN_CONF = 0.6;      // higher threshold = more accurate
    const IOU_MATCH = 0.35;    // tracker association
    const MAX_MISSED = 8;      // drop a track after N missed frames
    const STABLE_HITS = 6;     // frames before auto-save

    const loop = async () => {
      if (!active) return;
      const video = videoRef.current;
      const model = modelRef.current;
      const sampleCtx = sampleCanvasRef.current?.getContext("2d", { willReadFrequently: true });
      if (video && model && sampleCtx && video.readyState >= 2 && video.videoWidth > 0) {
        const t0 = performance.now();
        try {
          const preds = await model.detect(video, 12, MIN_CONF);
          const t1 = performance.now();
          setInferMs(Math.round(t1 - t0));

          const vw = video.videoWidth, vh = video.videoHeight;
          const used = new Set<number>();

          // Match each prediction to the best existing track
          for (const p of preds) {
            const [x, y, w, h] = p.bbox;
            const candidate = { px: x, py: y, pw: w, ph: h };
            let bestI = -1, bestIou = 0;
            for (let i = 0; i < tracksRef.current.length; i++) {
              if (used.has(i)) continue;
              const tr = tracksRef.current[i];
              if (tr.className !== p.class) continue;
              const v = iou(tr, candidate);
              if (v > bestIou) { bestIou = v; bestI = i; }
            }

            const meta = FOOD_CLASSES[p.class];
            // Only track items we recognise OR raw classes — skip noisy unknowns
            if (!meta) continue;

            const sampled = sampleColor(sampleCtx, video, x, y, w, h);
            const color = sampled || meta.fallbackColor;

            if (bestI >= 0 && bestIou > IOU_MATCH) {
              used.add(bestI);
              const prev = tracksRef.current[bestI];
              // EMA smoothing to remove jitter
              const npx = prev.px + (x - prev.px) * SMOOTH;
              const npy = prev.py + (y - prev.py) * SMOOTH;
              const npw = prev.pw + (w - prev.pw) * SMOOTH;
              const nph = prev.ph + (h - prev.ph) * SMOOTH;
              tracksRef.current[bestI] = {
                ...prev,
                px: npx, py: npy, pw: npw, ph: nph,
                x: (npx / vw) * 100, y: (npy / vh) * 100,
                w: (npw / vw) * 100, h: (nph / vh) * 100,
                confidence: prev.confidence * 0.7 + p.score * 0.3,
                color,
                hits: prev.hits + 1,
                missed: 0,
              };
            } else {
              tracksRef.current.push({
                trackId: newTrackId(p.class),
                className: p.class,
                label: meta.label,
                emoji: meta.emoji,
                category: meta.category,
                confidence: p.score,
                color,
                px: x, py: y, pw: w, ph: h,
                x: (x / vw) * 100, y: (y / vh) * 100,
                w: (w / vw) * 100, h: (h / vh) * 100,
                hits: 1, missed: 0, saved: false,
              });
            }
          }

          // Increment missed on unmatched tracks; drop stale ones
          tracksRef.current = tracksRef.current
            .map((tr, i) => used.has(i) ? tr : { ...tr, missed: tr.missed + 1 })
            .filter((tr) => tr.missed <= MAX_MISSED);

          // Auto-save stable detections
          if (autoSave) {
            for (const tr of tracksRef.current) {
              if (!tr.saved && tr.hits >= STABLE_HITS && tr.confidence >= 0.7) {
                upsertDetection({
                  className: tr.className,
                  label: tr.label,
                  emoji: tr.emoji,
                  category: tr.category,
                  color: tr.color,
                  confidence: tr.confidence,
                  source: "camera",
                });
                tr.saved = true;
                setJustSaved(tr.label);
                setTimeout(() => setJustSaved((c) => (c === tr.label ? null : c)), 1500);
              }
            }
          }

          setTracks([...tracksRef.current]);
          setFrameCount((f) => f + 1);

          const now = performance.now();
          const dt = now - lastTimeRef.current;
          lastTimeRef.current = now;
          const instFps = 1000 / Math.max(dt, 1);
          fpsAccumRef.current = fpsAccumRef.current * 0.8 + instFps * 0.2;
          setFps(Math.round(fpsAccumRef.current));
        } catch {
          // ignore frame errors
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [camState, modelLoading, autoSave]);

  const visible = tracks.filter((t) => t.hits >= 2); // hide flickers
  const fruits = visible.filter((d) => d.category === "fruit");
  const veggies = visible.filter((d) => d.category === "vegetable");

  const saveAllNow = () => {
    for (const tr of tracksRef.current) {
      if (tr.hits >= 2 && tr.confidence >= 0.55) {
        upsertDetection({
          className: tr.className,
          label: tr.label,
          emoji: tr.emoji,
          category: tr.category,
          color: tr.color,
          confidence: tr.confidence,
          source: "camera",
        });
        tr.saved = true;
      }
    }
    setJustSaved("Saved");
    setTimeout(() => setJustSaved(null), 1500);
  };

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Computer vision
          </h2>
          <p className="text-soft text-xs mt-1">
            Live camera · COCO-SSD MobileNetV2 · IoU tracking + color sampling · auto-saves to dashboard
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="glass-strong rounded-full px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="accent-primary" />
            Auto-save
          </label>
          <button
            onClick={saveAllNow}
            disabled={camState !== "live" || visible.length === 0}
            className="rounded-full px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-primary to-accent text-white hover:scale-105 transition-transform flex items-center gap-1.5 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Save className="h-3 w-3" strokeWidth={2} />
            Save now
          </button>
          <div className="glass-strong rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5">
            <Camera className="h-3 w-3" strokeWidth={2} />
            <span className="tabular-nums">{camState === "live" ? fps : 0} fps</span>
          </div>
          {camState === "live" ? (
            <button onClick={stopCamera} className="glass-strong rounded-full px-3 py-1.5 text-xs font-medium hover:scale-105 transition-transform flex items-center gap-1.5">
              <CameraOff className="h-3 w-3" strokeWidth={2} /> Stop
            </button>
          ) : (
            <button onClick={startCamera} className="rounded-full px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-primary to-accent text-white hover:scale-105 transition-transform flex items-center gap-1.5">
              <Camera className="h-3 w-3" strokeWidth={2} />
              {camState === "requesting" ? "Requesting…" : "Start camera"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Camera viewport */}
        <div className="lg:col-span-3 relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(210_30%_10%)] to-[hsl(220_25%_6%)] ring-1 ring-white/10">
          <video
            ref={videoRef}
            playsInline muted autoPlay
            className={cn("absolute inset-0 w-full h-full object-cover transition-opacity", camState === "live" ? "opacity-100" : "opacity-0")}
          />

          {/* Idle / error placeholder */}
          {camState !== "live" && (
            <div className="absolute inset-4 rounded-xl bg-gradient-to-b from-cyan-900/20 to-blue-900/10 flex flex-col items-center justify-center text-center p-4 gap-2">
              {camState === "denied" || camState === "error" ? (
                <>
                  <AlertTriangle className="h-6 w-6 text-warning" strokeWidth={1.5} />
                  <p className="text-xs text-soft max-w-[80%]">{camError}</p>
                  <button onClick={startCamera} className="mt-2 glass-strong rounded-full px-3 py-1.5 text-[11px] font-medium hover:scale-105 transition-transform">
                    Try again
                  </button>
                </>
              ) : camState === "requesting" ? (
                <>
                  <Camera className="h-6 w-6 text-primary animate-pulse" strokeWidth={1.5} />
                  <p className="text-xs text-soft">Requesting camera access…</p>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6 text-soft" strokeWidth={1.5} />
                  <p className="text-xs text-soft">Camera is off</p>
                </>
              )}
            </div>
          )}

          {/* Tracked detection boxes (colored from sampled pixel color) */}
          {camState === "live" && visible.map((d) => (
            <div
              key={d.trackId}
              className="absolute pointer-events-none"
              style={{
                left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`,
                transition: "left 100ms linear, top 100ms linear, width 100ms linear, height 100ms linear",
              }}
            >
              <div className="absolute inset-0 border-2 rounded-md" style={{ borderColor: d.color, boxShadow: `0 0 14px ${d.color}` }} />
              <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap flex items-center gap-1" style={{ backgroundColor: d.color }}>
                <span>{d.emoji}</span>{d.label} · {Math.round(d.confidence * 100)}%
                {d.saved && <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />}
              </div>
            </div>
          ))}

          {/* Model loading overlay */}
          {camState === "live" && modelLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Brain className="h-6 w-6 text-primary animate-pulse" strokeWidth={1.5} />
              <p className="text-xs text-white">Loading detection model…</p>
            </div>
          )}

          {/* Save toast */}
          {justSaved && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-strong rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={2} />
              Saved <span className="font-semibold">{justSaved}</span> to dashboard
            </div>
          )}

          {/* HUD */}
          <div className="absolute top-2 left-3 text-[9px] text-white/60 font-mono tabular-nums pointer-events-none">
            <div>MODEL COCO-SSD V2</div>
            <div>INF {inferMs}ms</div>
            <div>FPS {fps}</div>
            <div>TRACKS {tracksRef.current.length}</div>
          </div>
          <div className="absolute top-2 right-3 flex items-center gap-1 pointer-events-none">
            <span className={cn("h-1.5 w-1.5 rounded-full", camState === "live" ? (modelLoading ? "bg-warning animate-pulse" : "bg-success animate-pulse") : "bg-destructive")} />
            <span className="text-[9px] text-white/60">
              {camState === "live" ? (modelLoading ? "LOADING" : "DETECTING") : "OFFLINE"}
            </span>
          </div>
          <div className="absolute bottom-2 right-3 text-[9px] text-white/50 tabular-nums pointer-events-none">
            F{String(frameCount).padStart(6, "0")}
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="glass rounded-xl p-3 text-center">
              <Box className="h-4 w-4 mx-auto mb-1 text-primary" strokeWidth={1.5} />
              <p className="text-lg font-semibold tabular-nums">{visible.length}</p>
              <p className="text-[10px] text-soft">In frame</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <Apple className="h-4 w-4 mx-auto mb-1 text-accent" strokeWidth={1.5} />
              <p className="text-lg font-semibold tabular-nums">{fruits.length + veggies.length}</p>
              <p className="text-[10px] text-soft">Produce</p>
            </div>
          </div>

          {/* Live tracks */}
          <div>
            <p className="text-[10px] text-softer uppercase tracking-wider mb-2">Live detections</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
              {camState !== "live" && (<p className="text-xs text-soft italic">Start the camera to begin detection.</p>)}
              {camState === "live" && modelLoading && (<p className="text-xs text-soft italic">Loading AI model…</p>)}
              {camState === "live" && !modelLoading && visible.length === 0 && (
                <p className="text-xs text-soft italic">Point the camera at an apple, banana, orange, or other produce…</p>
              )}
              {visible.map((d) => (
                <div key={d.trackId} className="glass rounded-lg px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full ring-1 ring-white/30 shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-base leading-none">{d.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium block truncate">{d.label}</span>
                      <span className="text-[9px] text-soft capitalize">{d.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.saved && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    <span className="text-[10px] text-soft tabular-nums">{Math.round(d.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved inventory (same dashboard store) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-softer uppercase tracking-wider">Saved inventory · dashboard ({inventory.length})</p>
              {inventory.length > 0 && (
                <button onClick={clearInventory} className="text-[10px] text-soft hover:text-danger flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
              {inventory.length === 0 && (
                <p className="text-xs text-soft italic">Detected items will be saved here automatically.</p>
              )}
              {inventory.map((it) => (
                <div key={it.id} className="glass rounded-lg px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full ring-1 ring-white/30 shrink-0" style={{ backgroundColor: it.color }} />
                    <span className="text-base leading-none">{it.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium block truncate">{it.label}</span>
                      <span className="text-[9px] text-soft capitalize">{it.category} · qty {it.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => removeInventoryItem(it.id)} aria-label="Remove" className="text-soft hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
