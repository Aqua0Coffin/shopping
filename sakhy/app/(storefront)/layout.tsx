import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import PageLoader from "@/components/motion/PageLoader";
import { CartProvider } from "@/lib/cart-context";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PageLoader />
      <div className="flex flex-col min-h-screen text-charcoal relative" style={{ backgroundColor: "var(--color-background)" }}>
        <Navbar />
        {/* Main page content area */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
