"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";

interface VariantWithInventory {
  id: string;
  sku: string;
  color: string;
  blouseIncluded: boolean;
  borderType: string | null;
  price: number;
  images: string[];
  weightGrams: number | null;
  inventory?: {
    stockQty: number;
    reservedQty: number;
    lowStockThreshold: number;
  } | null;
}

interface InteractiveProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fabricType: string;
  basePrice: number;
  occasion: string | null;
  category: {
    name: string;
    slug: string;
  };
  variants: VariantWithInventory[];
}

interface ProductInteractiveProps {
  product: InteractiveProduct;
}

export default function ProductInteractive({ product }: ProductInteractiveProps) {
  const { addItem } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants[selectedVariantIdx];
  const stockQty = selectedVariant?.inventory?.stockQty ?? 0;
  const reservedQty = selectedVariant?.inventory?.reservedQty ?? 0;
  const availableStock = Math.max(0, stockQty - reservedQty);
  const lowStockThreshold = selectedVariant?.inventory?.lowStockThreshold ?? 5;

  // Manage images: if no images, show swatch placeholder
  const activeImages = selectedVariant?.images && selectedVariant.images.length > 0
    ? selectedVariant.images
    : [];
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      sku: selectedVariant.sku,
      color: selectedVariant.color,
      price: selectedVariant.price,
      fabricType: product.fabricType,
      stockQty: availableStock,
      image: activeImages[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
      {/* 1. Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="aspect-[2/3] w-full bg-silk/20 border border-gold/10 overflow-hidden flex items-center justify-center relative">
          {activeImages.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImages[activeImageIdx]}
              alt={`${product.name} — ${selectedVariant.color}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            /* Luxury Swatch Placeholder */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-silk/30 to-silk/70 select-none">
              <div className="absolute inset-4 border border-gold/10" />
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--color-gold)_1px,_transparent_1px)] bg-[size:12px_12px]" />
              <span className="font-accent italic text-xs text-gold tracking-widest uppercase mb-4">
                {product.fabricType}
              </span>
              <span className="font-display text-md text-charcoal/40 font-light tracking-[0.25em] uppercase text-center max-w-[80%]">
                {product.name}
              </span>
              <span className="text-[10px] text-muted tracking-widest uppercase mt-4">
                No Imagery Available
              </span>
            </div>
          )}

          {/* Saree Accent badge */}
          {selectedVariant.blouseIncluded && (
            <span className="absolute top-4 right-4 bg-deep/95 backdrop-blur-sm text-gold text-[9px] font-sans font-light tracking-widest uppercase px-3 py-1.5 border border-gold/20 shadow-sm">
              Blouse Piece Included
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {activeImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {activeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-20 aspect-[2/3] flex-shrink-0 border transition-all duration-300 relative cursor-pointer ${
                  activeImageIdx === idx
                    ? "border-gold scale-95"
                    : "border-gold/10 opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Details Panel */}
      <div className="flex flex-col">
        {/* Fabric Eyebrow */}
        <span className="text-gold text-xs tracking-[0.35em] uppercase font-sans font-light mb-3 block">
          {product.fabricType}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-light text-charcoal leading-tight mb-4">
          {product.name}
        </h1>

        {/* Pricing */}
        <div className="flex items-baseline gap-4 mb-8">
          <span className="font-display text-3xl font-light text-crimson">
            {formatPrice(selectedVariant.price)}
          </span>
          <span className="text-[10px] text-muted tracking-widest uppercase font-sans font-light">
            incl. of all taxes (GST)
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gold/15 mb-8" />

        {/* Description */}
        <div className="mb-8">
          <span className="text-[10px] text-gold tracking-[0.2em] uppercase font-sans font-semibold mb-2 block">
            The Legend of Weave
          </span>
          <p className="text-sm leading-relaxed text-charcoal/80 font-sans font-light">
            {product.description || "This heritage masterpiece is hand-woven by master weavers using traditional loom dynamics, combining high-grade silk with authenticated metal threads."}
          </p>
        </div>

        {/* Variant Selector (Colors) */}
        {product.variants.length > 0 && (
          <div className="mb-8">
            <span className="text-[10px] text-gold tracking-[0.2em] uppercase font-sans font-semibold mb-3.5 block">
              Weaver Colorways
            </span>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVariantIdx(idx);
                    setActiveImageIdx(0);
                    setQuantity(1);
                  }}
                  className={`px-4 py-2.5 border text-xs tracking-wider uppercase transition-all duration-300 font-sans cursor-pointer ${
                    selectedVariantIdx === idx
                      ? "border-gold text-gold bg-gold/5 font-medium"
                      : "border-gold/15 text-charcoal/70 font-light hover:border-gold/45"
                  }`}
                >
                  {v.color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-silk/15 border border-gold/10 p-5 mb-8 text-xs font-sans font-light text-charcoal/80">
          <div>
            <span className="text-muted text-[10px] tracking-wider block mb-1">SKU Code</span>
            <span className="font-mono tracking-widest">{selectedVariant.sku}</span>
          </div>
          <div>
            <span className="text-muted text-[10px] tracking-wider block mb-1">Weaving Border</span>
            <span>{selectedVariant.borderType || "Standard Selvedge"}</span>
          </div>
          <div>
            <span className="text-muted text-[10px] tracking-wider block mb-1">Blouse Piece</span>
            <span>{selectedVariant.blouseIncluded ? "Included (80cm Contrast)" : "Not Included"}</span>
          </div>
          {selectedVariant.weightGrams && (
            <div>
              <span className="text-muted text-[10px] tracking-wider block mb-1">Weave Weight</span>
              <span>{selectedVariant.weightGrams} grams</span>
            </div>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="mb-8 flex items-center gap-2">
          {availableStock > 0 ? (
            <>
              <span className={`w-2 h-2 rounded-full ${availableStock <= lowStockThreshold ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              <span className="text-xs font-sans font-light tracking-wide text-charcoal/80">
                {availableStock <= lowStockThreshold
                  ? `Exceedingly Rare: Only ${availableStock} left in inventory`
                  : "Currently Available"}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-sans font-light tracking-wide text-crimson font-medium">
                Under Custom Weave (Out of Stock)
              </span>
            </>
          )}
        </div>

        {/* Add to Cart Actions */}
        {availableStock > 0 ? (
          <div className="flex gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gold/30">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-sm text-charcoal hover:bg-gold/10 active:bg-gold/20 transition-all font-sans cursor-pointer focus:outline-none"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-4 text-xs font-sans font-medium text-charcoal select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="px-4 py-3 text-sm text-charcoal hover:bg-gold/10 active:bg-gold/20 transition-all font-sans cursor-pointer focus:outline-none"
                disabled={quantity >= availableStock}
              >
                +
              </button>
            </div>

            {/* CTA */}
            <Button
              variant={added ? "crimson" : "primary"}
              className="flex-grow !py-4"
              onClick={handleAddToCart}
            >
              {added ? "Added to Bag" : "Add to Bag"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full !py-4 opacity-60" disabled>
            Temporarily Unavailable
          </Button>
        )}
      </div>
    </div>
  );
}
