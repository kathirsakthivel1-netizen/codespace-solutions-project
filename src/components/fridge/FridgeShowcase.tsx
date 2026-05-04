import { useEffect, useState } from "react";
import { Snowflake, Thermometer, Droplets, Wifi } from "lucide-react";
import milk from "@/assets/food-milk.jpg";
import apples from "@/assets/food-apples.jpg";
import eggs from "@/assets/food-eggs.jpg";
import broccoli from "@/assets/food-broccoli.jpg";
import cheese from "@/assets/food-cheese.jpg";
import { cn } from "@/lib/utils";

const leftShelves = [
  [{ img: milk, name: "Milk" }, { img: cheese, name: "Cheese" }],
  [{ img: eggs, name: "Eggs" }],
  [{ img: broccoli, name: "Broccoli" }, { img: apples, name: "Apples" }],
  [{ img: cheese, name: "Cheese" }],
];

const rightShelves = [
  [{ img: apples, name: "Apples" }],
  [{ img: cheese, name: "Cheese" }, { img: milk, name: "Milk" }],
  [{ img: broccoli, name: "Broccoli" }],
  [{ img: eggs, name: "Eggs" }, { img: apples, name: "Apples" }],
];

const Shelf = ({ items }: { items: { img: string; name: string }[] }) => (
  <div className="relative flex-1 flex items-end justify-around gap-2 px-3 pb-2 border-b border-white/10 last:border-b-0">
    {/* Glass shelf edge */}
    <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_1px_4px_hsl(0_0%_0%/0.5)]" />
    {items.map((it, i) => (
      <div
        key={i}
        className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-md overflow-hidden ring-1 ring-white/20 shadow-[0_4px_12px_hsl(0_0%_0%/0.7)] hover:scale-110 transition-transform z-10"
      >
        <img src={it.img} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
      </div>
    ))}
  </div>
);

const DoorScreen = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[78%] h-[38%] rounded-xl overflow-hidden shadow-[0_0_30px_hsl(200_100%_50%/0.25),inset_0_0_0_2px_hsl(0_0%_8%),inset_0_0_0_4px_hsl(0_0%_15%)] bg-[hsl(220_40%_4%)]">
      {/* Screen content */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_60%_8%)] via-[hsl(240_50%_6%)] to-[hsl(260_60%_5%)] p-3 flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between text-[8px] text-white/60 mb-2">
          <span className="flex items-center gap-1">
            <Wifi className="h-2 w-2" strokeWidth={2} />
            Smart Hub
          </span>
          <span className="tabular-nums">{time}</span>
        </div>

        {/* Big temp */}
        <div className="flex-1 flex items-center justify-center gap-4">
          <Snowflake className="h-6 w-6 text-cyan-300 animate-[float_4s_ease-in-out_infinite]" strokeWidth={1.5} />
          <div>
            <p className="text-3xl font-light text-white tracking-tight tabular-nums leading-none">
              3.4<span className="text-base text-white/60">°C</span>
            </p>
            <p className="text-[8px] text-white/50 mt-1">{date}</p>
          </div>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <div className="rounded bg-white/5 px-1.5 py-1 flex items-center gap-1">
            <Thermometer className="h-2.5 w-2.5 text-cyan-300" strokeWidth={2} />
            <span className="text-[8px] text-white/80 tabular-nums">3.4°</span>
          </div>
          <div className="rounded bg-white/5 px-1.5 py-1 flex items-center gap-1">
            <Droplets className="h-2.5 w-2.5 text-blue-300" strokeWidth={2} />
            <span className="text-[8px] text-white/80 tabular-nums">62%</span>
          </div>
          <div className="rounded bg-success/15 px-1.5 py-1 flex items-center justify-center">
            <span className="text-[8px] text-success font-medium">OK</span>
          </div>
        </div>

        {/* Scanline glow */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
      {/* Bezel highlight */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/5 pointer-events-none" />
    </div>
  );
};

const Door = ({ open, side, withScreen }: { open: boolean; side: "left" | "right"; withScreen?: boolean }) => (
  <div
    className={cn(
      "absolute top-0 bottom-0 w-1/2 transition-transform duration-[900ms] ease-in-out [transform-style:preserve-3d] z-20",
      side === "left" ? "left-0 origin-left" : "right-0 origin-right",
      open && (side === "left"
        ? "[transform:perspective(1600px)_rotateY(-115deg)]"
        : "[transform:perspective(1600px)_rotateY(115deg)]")
    )}
  >
    {/* Door panel - black brushed metal */}
    <div
      className={cn(
        "absolute inset-0 [backface-visibility:hidden] overflow-hidden",
        side === "left" ? "rounded-l-[28px] rounded-r-md" : "rounded-r-[28px] rounded-l-md"
      )}
      style={{
        background:
          "linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(0 0% 6%) 40%, hsl(0 0% 9%) 60%, hsl(0 0% 4%) 100%)",
        boxShadow:
          "inset 0 1px 0 hsl(0 0% 25%), inset 0 -1px 0 hsl(0 0% 0%), 0 12px 40px hsl(0 0% 0% / 0.7)",
      }}
    >
      {/* Brushed metal vertical streaks */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, hsl(0 0% 100% / 0.04) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* Top edge highlight */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-b from-white/20 to-transparent" />

      {/* Display screen on left door only */}
      {withScreen && <DoorScreen />}

      {/* Brand badge */}
      {!withScreen && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-white/30 font-light">
          NOVA·CHILL
        </div>
      )}

      {/* Long vertical chrome handle */}
      <div
        className={cn(
          "absolute top-[18%] bottom-[18%] w-[6px] rounded-full",
          side === "left" ? "right-3" : "left-3"
        )}
        style={{
          background:
            "linear-gradient(90deg, hsl(0 0% 70%) 0%, hsl(0 0% 95%) 50%, hsl(0 0% 50%) 100%)",
          boxShadow:
            "0 2px 6px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.5)",
        }}
      />
      {/* Handle mounting brackets */}
      {[0.18, 0.82].map((t) => (
        <div
          key={t}
          className={cn(
            "absolute h-3 w-2 bg-gradient-to-b from-zinc-400 to-zinc-700 rounded-sm",
            side === "left" ? "right-2" : "left-2"
          )}
          style={{ top: `calc(${t * 100}% - 6px)` }}
        />
      ))}

      {/* Inner door rim (when closed, gives depth) */}
      <div
        className={cn(
          "absolute inset-y-2 w-[3px] bg-black/60",
          side === "left" ? "right-0" : "left-0"
        )}
      />
    </div>

    {/* Inner door back (visible when opened) - shows door bins */}
    <div
      className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gradient-to-b from-zinc-200 to-zinc-400 p-3 flex flex-col gap-3"
      style={{ borderRadius: side === "left" ? "28px 6px 6px 28px" : "6px 28px 28px 6px" }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex-1 rounded-lg bg-gradient-to-b from-white/40 to-zinc-300/60 border border-white/40 shadow-inner"
        />
      ))}
    </div>
  </div>
);

export const FridgeShowcase = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Smart fridge</h2>
          <p className="text-soft text-xs mt-1">Black double-door · live display</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="glass-strong px-4 py-2 rounded-full text-xs font-medium hover:scale-105 transition-transform"
        >
          {open ? "Close doors" : "Open doors"}
        </button>
      </div>

      {/* Outer floor / scene */}
      <div className="relative mx-auto w-full max-w-md">
        <div className="relative h-[560px] sm:h-[620px] [perspective:1800px]">
          {/* Fridge cabinet (black exterior) */}
          <div
            className="absolute inset-x-0 top-0 bottom-6 rounded-[32px] overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, hsl(0 0% 8%) 0%, hsl(0 0% 4%) 50%, hsl(0 0% 6%) 100%)",
              boxShadow:
                "0 40px 80px -20px hsl(0 0% 0% / 0.9), inset 0 0 0 1px hsl(0 0% 18%), inset 0 2px 0 hsl(0 0% 25%)",
            }}
          >
            {/* Top trim */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-zinc-700 to-transparent" />

            {/* Interior cavity */}
            <div
              className="absolute inset-x-3 top-3 bottom-16 rounded-2xl overflow-hidden flex"
              style={{
                background:
                  "linear-gradient(180deg, hsl(210 30% 92%) 0%, hsl(210 25% 82%) 100%)",
                boxShadow:
                  "inset 0 0 40px hsl(220 40% 60% / 0.4), inset 0 2px 8px hsl(0 0% 0% / 0.4)",
              }}
            >
              {/* Cold blue interior light */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-200/80 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-cyan-100/20 pointer-events-none" />

              {/* Center divider */}
              <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2px] bg-zinc-400/60" />

              {/* Two columns of shelves */}
              <div className="relative flex-1 flex flex-col pt-2">
                {leftShelves.map((s, i) => <Shelf key={i} items={s} />)}
              </div>
              <div className="relative flex-1 flex flex-col pt-2">
                {rightShelves.map((s, i) => <Shelf key={i} items={s} />)}
              </div>
            </div>

            {/* Freezer drawer at bottom */}
            <div
              className="absolute bottom-2 inset-x-3 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(180deg, hsl(0 0% 14%), hsl(0 0% 6%))",
                boxShadow: "inset 0 1px 0 hsl(0 0% 25%), 0 4px 12px hsl(0 0% 0% / 0.5)",
              }}
            >
              <div className="h-1 w-20 rounded-full bg-zinc-500/60" />
              <span className="absolute right-4 text-[9px] tracking-[0.3em] text-white/30">FREEZER</span>
            </div>

            {/* Doors layer */}
            <div className="absolute inset-x-0 top-0 bottom-16">
              <Door open={open} side="left" withScreen />
              <Door open={open} side="right" />
              {/* Center seam shadow when closed */}
              {!open && (
                <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2px] bg-black/80 z-30 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Feet */}
          <div className="absolute bottom-0 left-6 h-6 w-6 rounded-b-lg bg-gradient-to-b from-zinc-800 to-black shadow-md" />
          <div className="absolute bottom-0 right-6 h-6 w-6 rounded-b-lg bg-gradient-to-b from-zinc-800 to-black shadow-md" />

          {/* Floor reflection */}
          <div className="absolute -bottom-2 inset-x-10 h-4 rounded-full bg-black/60 blur-xl" />
          <div className="absolute -bottom-3 inset-x-16 h-3 rounded-full bg-primary/15 blur-2xl" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="glass rounded-2xl py-3">
          <p className="text-lg font-semibold">3.4°C</p>
          <p className="text-[10px] text-soft mt-0.5">Interior temp</p>
        </div>
        <div className="glass rounded-2xl py-3">
          <p className="text-lg font-semibold">62%</p>
          <p className="text-[10px] text-soft mt-0.5">Humidity</p>
        </div>
        <div className="glass rounded-2xl py-3">
          <p className="text-lg font-semibold text-success">OK</p>
          <p className="text-[10px] text-soft mt-0.5">Door seal</p>
        </div>
      </div>
    </div>
  );
};
