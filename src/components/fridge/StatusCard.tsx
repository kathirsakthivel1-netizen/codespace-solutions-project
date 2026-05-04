import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  count: number;
  tone: "fresh" | "expiring" | "need";
}

const toneStyles: Record<Props["tone"], string> = {
  fresh: "from-success/30 to-success/5 text-success",
  expiring: "from-warning/30 to-warning/5 text-warning",
  need: "from-danger/30 to-danger/5 text-danger",
};

export const StatusCard = ({ icon: Icon, label, count, tone }: Props) => {
  return (
    <div className="glass glass-hover rounded-3xl p-4 flex items-center gap-4 cursor-pointer">
      <div className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0", toneStyles[tone])}>
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-2xl font-semibold leading-none">{count}</span>
        <span className="text-xs text-soft mt-1 capitalize truncate">{label}</span>
      </div>
    </div>
  );
};
