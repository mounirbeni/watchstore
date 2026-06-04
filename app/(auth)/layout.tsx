import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Authentification" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold gold-text">ChronoCraft</h1>
            <p className="text-xs text-luxury-muted mt-1 tracking-widest uppercase">Montres de Luxe</p>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
