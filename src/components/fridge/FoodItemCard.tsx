interface Props {
  image: string;
  name: string;
  quantity: string;
}

export const FoodItemCard = ({ image, name, quantity }: Props) => {
  return (
    <div className="glass glass-hover rounded-3xl p-3 w-36 shrink-0 cursor-pointer">
      <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3 bg-secondary/40">
        <img src={image} alt={name} loading="lazy" width={512} height={512} className="h-full w-full object-cover" />
        <span className="absolute top-2 right-2 glass-strong text-[10px] font-medium px-2 py-1 rounded-full">
          {quantity}
        </span>
      </div>
      <div className="px-1">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-[11px] text-soft mt-0.5">In stock</p>
      </div>
    </div>
  );
};
