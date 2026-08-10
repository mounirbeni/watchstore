import type { Metadata } from "next";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Authentification" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" withTagline priority className="flex-col text-center" />
        </div>
        {children}
      </div>
    </div>
  );
}
