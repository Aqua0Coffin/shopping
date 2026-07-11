import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import PageLoader from "@/components/motion/PageLoader";
import CustomCursor from "@/components/motion/CustomCursor";
import { CartProvider } from "@/lib/cart-context";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PageLoader />
      <CustomCursor />
      <div className="flex flex-col min-h-screen bg-ivory text-charcoal relative">
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
