import Link from "next/link";
import PriceTag from "./PriceTag";

interface SimpleVariant {
  sku: string;
  color: string;
  price: number;
  images: string[];
}

interface SimpleProduct {
  id: string;
  name: string;
  slug: string;
  fabricType: string;
  basePrice: number;
  occasion?: string | null;
  variants: SimpleVariant[];
}

interface ProductCardProps {
  product: SimpleProduct;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  // Use first variant's details if available
  const variant = product.variants[0];
  const price = variant ? variant.price : product.basePrice;
  const image = variant?.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group flex flex-col h-full bg-silk/15 border border-gold/10 p-5 transition-all duration-500 hover:border-gold/30 hover:shadow-[0_12px_30px_-10px_rgba(201,168,76,0.12)] ${className}`}
    >
      {/* Aspect Ratio Container for Saree Thumbnail */}
      <div className="relative aspect-[2/3] w-full bg-silk/30 overflow-hidden mb-6 flex items-center justify-center border border-gold/5">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${product.name} - ${variant?.color || "Default"}`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Luxury Editorial Swatch Placeholder when image is missing */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-silk/30 to-silk/70">
            {/* Fine line border */}
            <div className="absolute inset-4 border border-gold/10 pointer-events-none" />
            <div className="absolute inset-5 border border-gold/5 pointer-events-none" />

            {/* Micro weave pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--color-gold)_1px,_transparent_1px)] bg-[size:10px_10px]" />

            {/* Swatch detail */}
            <span className="font-accent italic text-[11px] text-gold tracking-widest uppercase mb-3 block">
              {product.fabricType}
            </span>
            <span className="font-display text-sm text-charcoal/40 font-light tracking-[0.2em] uppercase max-w-[80%] line-clamp-2">
              {product.name}
            </span>
            <div className="w-6 h-[1px] bg-gold/30 mt-4" />
          </div>
        )}

        {/* Dynamic Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.occasion && (
            <span className="bg-deep/95 backdrop-blur-sm text-ivory text-[9px] font-sans font-light tracking-[0.25em] uppercase px-3 py-1.5 border border-gold/20 shadow-sm">
              {product.occasion}
            </span>
          )}
          {price > 6000000 && (
            <span className="bg-crimson/95 backdrop-blur-sm text-ivory text-[9px] font-sans font-light tracking-[0.25em] uppercase px-3 py-1.5 border border-gold/15 shadow-sm">
              Heirloom
            </span>
          )}
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-deep/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-500 flex items-center justify-center group-hover:opacity-100">
          <span className="bg-ivory text-deep font-sans text-[10px] tracking-[0.3em] uppercase py-3.5 px-6 border border-gold/30 shadow-lg transform translate-y-4 transition-transform duration-500 ease-out group-hover:translate-y-0">
            View Details
          </span>
        </div>
      </div>

      {/* Info */}
      <span className="text-[10px] text-gold tracking-[0.3em] uppercase font-sans font-light mb-1.5 block">
        {product.fabricType}
      </span>
      <h3 className="font-display text-[17px] text-charcoal font-light leading-snug mb-3 group-hover:text-gold transition-colors duration-300">
        {product.name}
      </h3>
      <div className="mt-auto pt-2 border-t border-gold/5 flex justify-between items-center">
        <PriceTag pricePaise={price} />
        {variant?.color && (
          <span className="text-[10px] font-sans text-muted tracking-widest uppercase">
            {variant.color}
          </span>
        )}
      </div>
    </Link>
  );
}
