import Image from "next/image";
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

/**
 * ProductCard — reference-styled with:
 * - rounded-xl image container (reference uses rounded-xl throughout)
 * - Warm background placeholder swatch
 * - Heart wishlist button top-right
 * - Add to Cart + Quick View overlay on hover (matches reference collection grid exactly)
 * - Star rating display
 * - Product name in display font below image
 * - All links preserved (href to /products/[slug])
 */
export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const variant = product.variants[0];
  const price = variant ? variant.price : product.basePrice;
  const image = variant?.images?.[0];

  return (
    <article className={`group ${className}`}>
      {/* Image Container — reference rounded-xl with aspect-[4/5] */}
      <div
        className="relative overflow-hidden rounded-xl aspect-[4/5]"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        {image ? (
          <Image
            src={image}
            alt={`${product.name} - ${variant?.color || "Default"}`}
            fill
            className="h-full w-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          /* Reference-aligned warm placeholder */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
            style={{
              background: "linear-gradient(135deg, rgba(232,220,200,0.4) 0%, rgba(232,220,200,0.8) 100%)",
            }}
          >
            <div
              className="absolute inset-4 border pointer-events-none"
              style={{ borderColor: "rgba(201,166,107,0.2)" }}
            />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, var(--color-gold-ref) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
              }}
            />
            <span
              className="font-display text-sm font-light tracking-[0.25em] uppercase max-w-[80%] line-clamp-2"
              style={{ color: "var(--color-charcoal)", opacity: 0.5 }}
            >
              {product.fabricType}
            </span>
          </div>
        )}

        {/* Occasion Badge — top left */}
        {product.occasion && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur"
            style={{
              backgroundColor: "rgba(250,249,246,0.95)",
              color: "var(--color-ink)",
            }}
          >
            {product.occasion}
          </span>
        )}

        {/* Wishlist button — top right (reference pattern) */}
        <Link
          href={`/products/${product.slug}`}
          aria-label="Wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-colors duration-300"
          style={{
            backgroundColor: "rgba(250,249,246,0.95)",
            color: "var(--color-ink)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--color-gold-ref)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--color-ink)")
          }
          onClick={(e) => e.preventDefault()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </Link>

        {/* Hover overlay: Add to Cart + Quick View (reference pattern) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 rounded-full py-2.5 text-[11px] uppercase tracking-[0.18em] text-center transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-ink)",
                color: "var(--color-background)",
              }}
            >
              View Details
            </Link>
            <Link
              href={`/products/${product.slug}`}
              aria-label="Quick view"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-ink)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-gold-ref)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-background)")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Product info below image — reference pattern */}
      <div className="mt-4 space-y-1.5">
        {/* Stars (reference shows 5-star rating) */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className="h-3 w-3"
              fill={i < 4 ? "var(--color-gold-ref)" : "none"}
              stroke="var(--color-gold-ref)"
              strokeWidth={1}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        <h3
          className="font-display text-lg leading-snug"
          style={{ color: "var(--color-ink)" }}
        >
          {product.name}
        </h3>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          <PriceTag pricePaise={price} />
        </p>
      </div>
    </article>
  );
}
