import { Cloud } from "lucide-react";
import { useEffect, useState } from "react";

export const WeatherWidget = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="glass rounded-3xl px-5 py-4 flex items-center gap-4 animate-fade-in">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
        <Cloud className="h-6 w-6 text-white" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold leading-none">22°C</span>
        <span className="text-xs text-soft mt-1">{time} · {date}</span>
      </div>
    </div>
  );
};
