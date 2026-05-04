import { useState } from "react";
import { Search, Sparkles, Clock, ShoppingCart, Plus, Package, TrendingUp, BarChart3, Boxes } from "lucide-react";
import { StatusCard } from "./StatusCard";
import { FoodItemCard } from "./FoodItemCard";
import { FridgeShowcase } from "./FridgeShowcase";
import { GasSensorPanel } from "./GasSensorPanel";
import { ComputerVisionPanel } from "./ComputerVisionPanel";
import { ExpiryTrackingPanel } from "./ExpiryTrackingPanel";
import { RecommendationEngine } from "./RecommendationEngine";
import { IotDevicePanel } from "./IotDevicePanel";
import { DataFlowPanel } from "./DataFlowPanel";
import { useInventory, removeInventoryItem } from "@/lib/inventoryStore";
import { Trash2 } from "lucide-react";

import milk from "@/assets/food-milk.jpg";
import apples from "@/assets/food-apples.jpg";
import eggs from "@/assets/food-eggs.jpg";
import broccoli from "@/assets/food-broccoli.jpg";
import cheese from "@/assets/food-cheese.jpg";

const foodItems = [
  { image: milk, name: "Whole Milk", quantity: "2L" },
  { image: apples, name: "Red Apples", quantity: "8 units" },
  { image: eggs, name: "Free-range Eggs", quantity: "12 units" },
  { image: broccoli, name: "Broccoli", quantity: "2 heads" },
  { image: cheese, name: "Cheddar", quantity: "300g" },
];

const categories = [
  { name: "Dairy", count: 5, color: "from-blue-500 to-cyan-400" },
  { name: "Vegetables", count: 4, color: "from-emerald-500 to-green-400" },
  { name: "Fruits", count: 8, color: "from-orange-500 to-yellow-400" },
  { name: "Proteins", count: 3, color: "from-rose-500 to-pink-400" },
  { name: "Beverages", count: 6, color: "from-violet-500 to-purple-400" },
];

const SectionLabel = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
      {number}
    </div>
    <h2 className="text-xs font-semibold text-soft uppercase tracking-wider">{title}</h2>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

export const DashboardView = () => {
  const [search, setSearch] = useState("");
  const inventory = useInventory();

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Overview Stats */}
      <div>
        <SectionLabel number="01" title="Inventory Overview" />

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Package, label: "Total Items", value: "26", sub: "in stock", gradient: "from-primary to-accent" },
            { icon: Sparkles, label: "Fresh", value: "14", sub: "items", gradient: "from-emerald-500 to-green-400" },
            { icon: Clock, label: "Expiring Soon", value: "3", sub: "within 48h", gradient: "from-amber-500 to-yellow-400" },
            { icon: TrendingUp, label: "Weekly Usage", value: "82%", sub: "efficiency", gradient: "from-violet-500 to-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 hover:scale-[1.02] transition-transform">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-soft">{stat.sub}</p>
              <p className="text-[10px] text-softer uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <p className="text-sm font-medium">Category Breakdown</p>
          </div>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <p className="text-xs text-soft w-20 shrink-0">{cat.name}</p>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-1000`}
                    style={{ width: `${(cat.count / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums w-6 text-right">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatusCard icon={Sparkles} label="fresh" count={14} tone="fresh" />
          <StatusCard icon={Clock} label="expiring" count={3} tone="expiring" />
          <StatusCard icon={ShoppingCart} label="need" count={6} tone="need" />
        </div>

        {/* Search & Add */}
        <div className="glass rounded-3xl p-2 pl-5 flex items-center gap-3 mb-5">
          <Search className="h-4 w-4 text-soft shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or add food..."
            className="bg-transparent border-0 outline-none flex-1 text-sm placeholder:text-softer py-2"
          />
          <button
            aria-label="Add food"
            className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 hover:scale-105 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>

        {/* Food Items */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
          {foodItems.map((it) => (
            <FoodItemCard key={it.name} {...it} />
          ))}
        </div>

        {/* Camera-detected inventory (auto-saved from Computer Vision) */}
        {inventory.length > 0 && (
          <div className="mt-6 glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Detected by camera ({inventory.length})
              </p>
              <p className="text-[10px] text-softer uppercase tracking-wider">Live · saved from CV</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {inventory.map((it) => (
                <div key={it.id} className="glass glass-hover rounded-2xl p-3 flex items-center gap-3 group">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ring-1 ring-white/15"
                    style={{ background: `linear-gradient(135deg, ${it.color}, hsl(0 0% 100% / 0.05))` }}
                  >
                    {it.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{it.label}</p>
                    <p className="text-[10px] text-soft capitalize">{it.category} · qty {it.quantity}</p>
                    <p className="text-[10px] text-softer tabular-nums">{Math.round(it.confidence * 100)}% confidence</p>
                  </div>
                  <button
                    onClick={() => removeInventoryItem(it.id)}
                    aria-label="Remove"
                    className="opacity-0 group-hover:opacity-100 text-soft hover:text-danger transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Computer Vision */}
      <div>
        <SectionLabel number="02" title="Computer Vision · AI Core" />
        <ComputerVisionPanel />
      </div>

      {/* Expiry Tracking */}
      <div>
        <SectionLabel number="03" title="Expiry & Freshness Tracking" />
        <ExpiryTrackingPanel />
      </div>

      {/* Recommendation Engine */}
      <div>
        <SectionLabel number="04" title="Recommendation Engine" />
        <RecommendationEngine />
      </div>

      {/* Fridge Showcase */}
      <div>
        <SectionLabel number="05" title="User Interface · Fridge Display" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FridgeShowcase />
          <GasSensorPanel />
        </div>
      </div>

      {/* IoT */}
      <div>
        <SectionLabel number="06" title="IoT & Hardware Integration" />
        <IotDevicePanel />
      </div>

      {/* User Manual */}
      <div>
        <SectionLabel number="📖" title="User Manual · How It Works" />
        <DataFlowPanel />
      </div>
    </div>
  );
};
