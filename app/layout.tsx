import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import IntroReveal from "@/components/brand/IntroReveal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chronocraft.ma"),
  title: {
    default: "ChronoCraft — Montres de Luxe",
    template: "%s | ChronoCraft",
  },
  description:
    "Découvrez notre collection exclusive de montres de luxe. Authenticité, élégance, prestige.",
  keywords: ["montres", "luxe", "horlogerie", "chronographe", "tourbillon"],
  applicationName: "ChronoCraft",
  appleWebApp: {
    capable: true,
    title: "ChronoCraft",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "ChronoCraft — Montres de Luxe",
    description: "La maison des montres d'exception.",
    type: "website",
    locale: "fr_MA",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
};

/**
 * Stamped on <html> before first paint so returning visitors never catch a
 * frame of the intro overlay that ships in the server HTML.
 */
const INTRO_GUARD = `try{if(sessionStorage.getItem('cc-intro-v1')||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-done')}}catch(e){document.documentElement.classList.add('intro-done')}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GUARD }} />
      </head>
      <body>
        <IntroReveal />
        {children}
      </body>
    </html>
  );
}
