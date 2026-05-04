import { useEffect, useState } from "react";
import { CalendarClock, AlertTriangle, Leaf, RotateCcw, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackedItem {
  id: string;
  name: string;
  addedDaysAgo: number;
  shelfLifeDays: number;
  category: string;
}

const items: TrackedItem[] = [
  { id: "1", name: "Whole Milk",      addedDaysAgo: 5,  shelfLifeDays: 7,  category: "Dairy" },
  { id: "2", name: "Red Apples",      addedDaysAgo: 3,  shelfLifeDays: 21, category: "Fruit" },
  { id: "3", name: "Free-range Eggs", addedDaysAgo: 8,  shelfLifeDays: 28, category: "Dairy" },
  { id: "4", name: "Broccoli",        addedDaysAgo: 4,  shelfLifeDays: 5,  category: "Vegetable" },
  { id: "5", name: "Cheddar",         addedDaysAgo: 12, shelfLifeDays: 30, category: "Dairy" },
  { id: "6", name: "Yogurt",          addedDaysAgo: 6,  shelfLifeDays: 10, category: "Dairy" },
  { id: "7", name: "Lettuce",         addedDaysAgo: 3,  shelfLifeDays: 4,  category: "Vegetable" },
  { id: "8", name: "Orange Juice",    addedDaysAgo: 9,  shelfLifeDays: 14, category: "Beverage" },
];

type FreshnessLevel = "fresh" | "okay" | "expiring" | "expired";

function getFreshness(item: TrackedItem): { level: FreshnessLevel; daysLeft: number; pct: number } {
  const daysLeft = item.shelfLifeDays - item.addedDaysAgo;
  const pct = Math.max(0, Math.min(100, (daysLeft / item.shelfLifeDays) * 100));
  if (daysLeft <= 0) return { level: "expired", daysLeft, pct: 0 };
  if (daysLeft <= 2) return { level: "expiring", daysLeft, pct };
  if (pct < 50) return { level: "okay", daysLeft, pct };
  return { level: "fresh", daysLeft, pct };
}

const freshnessStyles: Record<FreshnessLevel, { text: string; bg: string; bar: string; label: string }> = {
  fresh:    { text: "text-success", bg: "bg-success/15", bar: "bg-success", label: "Fresh" },
  okay:     { text: "text-blue-400", bg: "bg-blue-400/15", bar: "bg-blue-400", label: "Good" },
  expiring: { text: "text-warning", bg: "bg-warning/15", bar: "bg-warning", label: "Expiring" },
  expired:  { text: "text-danger",  bg: "bg-danger/15",  bar: "bg-danger",  label: "Expired" },
};

export const ExpiryTrackingPanel = () => {
  const [trackedItems, setTrackedItems] = useState(items);
  const [spoilageScore, setSpoilageScore] = useState(14);

  // Simulate AI spoilage score fluctuation
  useEffect(() => {
    const t = setInterval(() => setSpoilageScore((p) => Math.max(0, Math.min(100, p + (Math.random() - 0.45) * 3))), 4000);
    return () => clearInterval(t);
  }, []);

  const grouped = {
    expired: trackedItems.filter((i) => getFreshness(i).level === "expired"),
    expiring: trackedItems.filter((i) => getFreshness(i).level === "expiring"),
    okay: trackedItems.filter((i) => getFreshness(i).level === "okay"),
    fresh: trackedItems.filter((i) => getFreshness(i).level === "fresh"),
  };

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Expiry & freshness
          </h2>
          <p className="text-soft text-xs mt-1">AI-predicted shelf life tracking</p>
        </div>
        <div className="flex gap-2">
          {grouped.expired.length > 0 && (
            <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-danger font-medium animate-pulse">
              <AlertTriangle className="h-3 w-3" strokeWidth={2} />
              {grouped.expired.length} expired
            </div>
          )}
          {grouped.expiring.length > 0 && (
            <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-warning font-medium">
              <TrendingDown className="h-3 w-3" strokeWidth={2} />
              {grouped.expiring.length} expiring soon
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {(["fresh", "okay", "expiring", "expired"] as FreshnessLevel[]).map((level) => {
          const s = freshnessStyles[level];
          const count = grouped[level].length;
          return (
            <div key={level} className="glass rounded-xl p-3 text-center">
              <div className={cn("h-8 w-8 rounded-lg mx-auto mb-2 flex items-center justify-center", s.bg)}>
                <Leaf className={cn("h-4 w-4", s.text)} strokeWidth={1.5} />
              </div>
              <p className="text-lg font-semibold">{count}</p>
              <p className={cn("text-[10px] font-medium", s.text)}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* AI Spoilage detector */}
      <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <RotateCcw className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">AI spoilage detection</p>
          <p className="text-xs text-soft">MQ3 + vision composite score</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", spoilageScore < 30 ? "bg-success" : spoilageScore < 60 ? "bg-warning" : "bg-danger")}
              style={{ width: `${spoilageScore}%` }}
            />
          </div>
        </div>
        <p className="text-2xl font-semibold tabular-nums shrink-0">{Math.round(spoilageScore)}%</p>
      </div>

      {/* Item list */}
      <div>
        <p className="text-[10px] text-softer uppercase tracking-wider mb-2">All tracked items</p>
        <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
          {trackedItems
            .sort((a, b) => getFreshness(a).daysLeft - getFreshness(b).daysLeft)
            .map((item) => {
              const f = getFreshness(item);
              const s = freshnessStyles[f.level];
              return (
                <div key={item.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", s.bar)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", s.bg, s.text)}>
                        {f.daysLeft <= 0 ? "Expired" : `${f.daysLeft}d left`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500", s.bar)} style={{ width: `${f.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-softer">{item.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};
