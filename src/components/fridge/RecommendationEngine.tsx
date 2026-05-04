import { useState } from "react";
import { ChefHat, ShoppingCart, BarChart3, Lightbulb, ArrowRight, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import paneer from "@/assets/recipe-paneer.jpg";
import salad from "@/assets/recipe-salad.jpg";
import pasta from "@/assets/recipe-pasta.jpg";

type Tab = "recipes" | "shopping" | "patterns";

const recipes = [
  { image: paneer, name: "Paneer Tandoori Tikka", calories: 420, match: 92, ingredients: ["Cheese", "Broccoli", "Yogurt"] },
  { image: salad, name: "Garden Greens Bowl", calories: 180, match: 88, ingredients: ["Lettuce", "Apples", "Eggs"] },
  { image: pasta, name: "Mushroom Pasta", calories: 510, match: 75, ingredients: ["Milk", "Cheese", "Eggs"] },
];

const shoppingList = [
  { name: "Tomatoes", priority: "high" as const, reason: "Used in 4 recipes" },
  { name: "Butter", priority: "high" as const, reason: "Running low" },
  { name: "Garlic", priority: "medium" as const, reason: "Frequently used" },
  { name: "Onions", priority: "medium" as const, reason: "Staple item" },
  { name: "Chicken breast", priority: "low" as const, reason: "Recipe suggestion" },
  { name: "Pasta", priority: "low" as const, reason: "Pantry stock" },
];

const consumptionData = [
  { category: "Dairy", weeklyAvg: 4.2, trend: "up" as const },
  { category: "Vegetables", weeklyAvg: 3.1, trend: "down" as const },
  { category: "Fruit", weeklyAvg: 2.8, trend: "stable" as const },
  { category: "Beverages", weeklyAvg: 1.5, trend: "up" as const },
];

const priorityStyles = {
  high: { text: "text-danger", bg: "bg-danger/15" },
  medium: { text: "text-warning", bg: "bg-warning/15" },
  low: { text: "text-soft", bg: "bg-white/5" },
};

export const RecommendationEngine = () => {
  const [tab, setTab] = useState<Tab>("recipes");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (name: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Smart recommendations
          </h2>
          <p className="text-soft text-xs mt-1">AI-powered suggestions based on inventory</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-full p-1 mb-5">
        {([
          { id: "recipes" as Tab, icon: ChefHat, label: "Recipes" },
          { id: "shopping" as Tab, icon: ShoppingCart, label: "Shopping list" },
          { id: "patterns" as Tab, icon: BarChart3, label: "Consumption" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all",
              tab === t.id ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" : "text-soft hover:text-white"
            )}
          >
            <t.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Recipes tab */}
      {tab === "recipes" && (
        <div className="space-y-3">
          {recipes.map((r) => (
            <div key={r.name} className="glass glass-hover rounded-2xl overflow-hidden flex group cursor-pointer">
              <div className="w-24 h-24 shrink-0 overflow-hidden">
                <img src={r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
                      {r.match}% match
                    </span>
                  </div>
                  <p className="text-[10px] text-soft mt-0.5">{r.calories} kcal · Uses: {r.ingredients.join(", ")}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                  <span>View recipe</span>
                  <ArrowRight className="h-2.5 w-2.5" strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shopping list tab */}
      {tab === "shopping" && (
        <div className="space-y-2">
          {shoppingList.map((item) => {
            const s = priorityStyles[item.priority];
            const checked = checkedItems.has(item.name);
            return (
              <div
                key={item.name}
                onClick={() => toggleCheck(item.name)}
                className={cn("glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-opacity", checked && "opacity-50")}
              >
                <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                  checked ? "bg-primary border-primary" : "border-white/20"
                )}>
                  {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", checked && "line-through")}>{item.name}</p>
                  <p className="text-[10px] text-soft">{item.reason}</p>
                </div>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", s.bg, s.text)}>
                  {item.priority}
                </span>
              </div>
            );
          })}
          <button className="w-full glass rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-xs text-soft hover:text-white transition-colors">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add item
          </button>
        </div>
      )}

      {/* Consumption patterns tab */}
      {tab === "patterns" && (
        <div className="space-y-3">
          {consumptionData.map((c) => (
            <div key={c.category} className="glass rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{c.category}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-soft tabular-nums">{c.weeklyAvg}/week</span>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                    c.trend === "up" && "bg-success/15 text-success",
                    c.trend === "down" && "bg-danger/15 text-danger",
                    c.trend === "stable" && "bg-blue-400/15 text-blue-400",
                  )}>
                    {c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→"} {c.trend}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${(c.weeklyAvg / 5) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="glass rounded-xl p-4 mt-3">
            <p className="text-xs font-medium mb-1">AI insight</p>
            <p className="text-[11px] text-soft leading-relaxed">
              Your dairy consumption increased 18% this week. Vegetable intake is below your 4-week average. 
              Consider adding more greens — you have broccoli and lettuce available.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
