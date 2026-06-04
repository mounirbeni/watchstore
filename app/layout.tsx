import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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
    statusBarStyle: "black-translucent",
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
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
