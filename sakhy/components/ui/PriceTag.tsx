import { formatPrice } from "@/lib/format";

interface PriceTagProps {
  pricePaise: number;
  compareAtPricePaise?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function PriceTag({
  pricePaise,
  compareAtPricePaise,
  className = "",
  size = "md",
}: PriceTagProps) {
  const formattedPrice = formatPrice(pricePaise);
  const formattedCompare = compareAtPricePaise ? formatPrice(compareAtPricePaise) : null;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-3 font-display ${className}`}>
      <span className={`font-normal text-crimson ${sizeClasses[size]}`}>
        {formattedPrice}
      </span>
      {formattedCompare && (
        <span className="text-muted line-through text-xs font-light tracking-wider opacity-60">
          {formattedCompare}
        </span>
      )}
    </div>
  );
}
