import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Dancing_Script } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Restaurant d'Iroma au Cambille",
  description: "Carte du Restaurant d'Iroma au Cambille — Cuisine italienne et spécialités au feu de bois.",
};

export default function DiRomaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${cormorant.variable} ${dancing.variable}`}>
      {children}
    </div>
  );
}
