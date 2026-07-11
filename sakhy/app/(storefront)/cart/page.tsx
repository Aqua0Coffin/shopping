"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { state, removeItem, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <div className="py-28 px-6 sm:px-8 max-w-5xl mx-auto bg-ivory font-sans">
      <h1 className="font-display text-3xl sm:text-4xl font-light text-charcoal mb-10 text-center lg:text-left">
        Your Shopping Bag
      </h1>

      {state.items.length === 0 ? (
        <div className="border border-gold/15 p-16 text-center bg-silk/10">
          <span className="font-display text-xl text-muted block mb-3">Your Bag is Empty</span>
          <p className="text-xs text-muted/70 max-w-sm mx-auto font-light leading-relaxed mb-8">
            You haven&apos;t added any heritage creations to your collection yet.
          </p>
          <Button variant="primary" href="/collections" className="px-8">
            Browse Creations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {state.items.map((item) => (
              <div
                key={item.variantId}
                className="border border-gold/10 p-5 bg-silk/5 flex gap-4 sm:gap-6 relative"
              >
                {/* Product Image Swatch */}
                <div className="w-24 aspect-[2/3] bg-silk/40 border border-gold/5 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <div className="absolute inset-2 border border-gold/5" />
                      <span className="text-[8px] font-accent italic text-gold tracking-widest uppercase block mb-1">
                        {item.fabricType}
                      </span>
                      <span className="text-[7px] text-charcoal/40 font-light tracking-widest uppercase line-clamp-2">
                        {item.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-grow">
                  <span className="text-[9px] text-gold tracking-[0.25em] uppercase font-light mb-1 block">
                    {item.fabricType}
                  </span>
                  <Link
                    href={`/products/${item.sku.split("-")[1]?.toLowerCase() || ""}`}
                    className="font-display text-[17px] text-charcoal leading-snug hover:text-gold transition-colors duration-300 font-normal mb-1.5"
                  >
                    {item.name}
                  </Link>
                  <span className="text-[10px] text-muted tracking-widest uppercase font-light mb-3">
                    Color: {item.color}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gold/15 w-fit mt-auto bg-ivory">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1.5 text-xs text-charcoal hover:bg-gold/5 active:bg-gold/10 transition-all font-sans cursor-pointer focus:outline-none"
                    >
                      −
                    </button>
                    <span className="px-3 text-[11px] font-sans font-medium text-charcoal select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1.5 text-xs text-charcoal hover:bg-gold/5 active:bg-gold/10 transition-all font-sans cursor-pointer focus:outline-none"
                      disabled={item.quantity >= item.stockQty}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price and Remove Button */}
                <div className="flex flex-col items-end justify-between ml-auto">
                  <span className="font-display text-lg text-crimson">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-[9px] uppercase tracking-widest text-muted hover:text-crimson transition-colors duration-300 focus:outline-none font-sans cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="border border-gold/15 bg-silk/10 p-6 flex flex-col gap-6">
            <span className="text-xs uppercase tracking-widest font-sans font-medium text-charcoal border-b border-gold/15 pb-3 block">
              Order Summary
            </span>

            <div className="flex flex-col gap-3.5 text-xs tracking-wider text-charcoal/80">
              <div className="flex justify-between">
                <span className="font-light">Creations ({cartCount})</span>
                <span className="font-display text-sm">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-light">Artisan Packaging</span>
                <span className="text-gold text-[10px] tracking-widest uppercase font-medium">Complimentary</span>
              </div>
              <div className="flex justify-between">
                <span className="font-light">Shipping (India)</span>
                <span className="text-gold text-[10px] tracking-widest uppercase font-medium">Free Delivery</span>
              </div>
              <div className="w-full h-[1px] bg-gold/10 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-normal text-charcoal">Subtotal</span>
                <span className="font-display text-xl text-crimson font-normal">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Stop boundary for Phase 2: Checkout is disabled */}
            <div className="mt-4 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full !py-4 opacity-50 cursor-not-allowed hover:bg-transparent"
                disabled
              >
                Proceed to Checkout
              </Button>
              <span className="text-[10px] text-center text-crimson font-light tracking-wide block leading-relaxed px-2 bg-crimson/5 py-3.5 border border-crimson/15">
                Checkout & UPI/Card Payment gateways will be enabled in Phase 3.
              </span>
            </div>
            
            <Link
              href="/collections"
              className="text-[10px] uppercase tracking-widest text-center text-gold hover:text-gold-light transition-colors duration-300 font-sans font-medium mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
