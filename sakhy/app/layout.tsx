import type { Metadata } from "next";
import Script from "next/script";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Raleway,
} from "next/font/google";
import "./globals.css";

// ── FONTS (self-hosted via next/font — no external CDN link) ──
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sakhy — Heritage Sarees",
    template: "%s | Sakhy",
  },
  description:
    "Handwoven masterpieces born from centuries of tradition. Explore Sakhy's curated collection of Kanjivaram, Banarasi, Paithani, and Chanderi sarees.",
  keywords: ["heritage sarees", "Kanjivaram", "Banarasi", "handwoven", "silk sarees", "Indian textiles"],
  openGraph: {
    title: "Sakhy — Heritage Sarees",
    description:
      "Handwoven masterpieces born from centuries of tradition.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${raleway.variable}`}
    >
      <body className="antialiased font-sans font-light">
        {process.env.NODE_ENV === "development" && (
          <Script src="https://unpkg.com/react-scan/dist/auto.global.js" crossOrigin="anonymous" />
        )}
        {children}
      </body>
    </html>
  );
}
