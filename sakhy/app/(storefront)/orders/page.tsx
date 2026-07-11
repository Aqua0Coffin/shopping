import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrdersPage() {
  return (
    <div className="py-28 px-6 sm:px-8 max-w-md mx-auto bg-ivory font-sans flex flex-col items-center text-center">
      {/* Decorative Loom/Vessel Graphic representation */}
      <div className="w-20 h-20 rounded-full border border-gold/25 flex items-center justify-center mb-8 relative bg-silk/15">
        <div className="absolute inset-1.5 border border-gold/10 rounded-full" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.2}
          stroke="currentColor"
          className="w-8 h-8 text-gold"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-light text-charcoal mb-4">
        Your digital chronicle
      </h1>
      
      <p className="text-xs text-muted/70 leading-relaxed font-light mb-8 max-w-xs">
        Your order history, shipping status, and weaver certificates live here. Please sign in to authenticate your account.
      </p>

      {/* Disabled authentication trigger stub for Phase 2 */}
      <div className="w-full flex flex-col gap-3">
        <Button variant="outline" className="w-full !py-4 opacity-50 cursor-not-allowed hover:bg-transparent" disabled>
          Sign In
        </Button>
        <span className="text-[10px] text-crimson font-light tracking-wide block leading-relaxed px-2 bg-crimson/5 py-3 border border-crimson/15">
          Customer Authentication (NextAuth) will be activated in Phase 4.
        </span>
      </div>

      <Link
        href="/"
        className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors duration-300 font-sans font-medium mt-8"
      >
        Back to Home
      </Link>
    </div>
  );
}
