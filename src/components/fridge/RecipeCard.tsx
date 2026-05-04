import { Flame, Feather, Drumstick } from "lucide-react";

interface Props {
  image: string;
  name: string;
  calories: number;
  weight: "light" | "heavy";
}

export const RecipeCard = ({ image, name, calories, weight }: Props) => {
  const Icon = weight === "light" ? Feather : Drumstick;
  return (
    <div className="glass glass-hover rounded-3xl overflow-hidden w-64 shrink-0 cursor-pointer">
      <div className="relative h-36 w-full overflow-hidden">
        <img src={image} alt={name} loading="lazy" width={768} height={512} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-deep/80 to-transparent" />
        <span className="absolute top-3 right-3 glass-strong text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 capitalize">
          <Icon className="h-3 w-3" strokeWidth={1.5} />
          {weight}
        </span>
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm mb-2 truncate">{name}</p>
        <div className="flex items-center gap-1.5 text-soft text-xs">
          <Flame className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{calories} kcal</span>
        </div>
      </div>
    </div>
  );
};
