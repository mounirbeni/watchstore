"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await loginAction(formData);
      if (result.success) {
        const dest = from ?? (result.data.role === "ADMIN" ? "/admin" : "/dashboard");
        router.push(dest);
      }
      return result;
    },
    null,
  );

  return (
    <Card>
      <h2 className="text-2xl font-serif font-semibold text-white mb-2">Connexion</h2>
      <p className="text-sm text-luxury-muted mb-8">
        Accédez à votre espace personnel
      </p>

      {state && !state.success && (
        <div className="mb-4 p-3 rounded-lg bg-luxury-dark border border-gold-500/30 text-sm text-gold-400">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="votre@email.com"
          autoComplete="email"
          required
          error={state && !state.success ? state.fieldErrors?.["email"]?.[0] : undefined}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          error={state && !state.success ? state.fieldErrors?.["password"]?.[0] : undefined}
        />

        <Button type="submit" className="w-full mt-2" loading={isPending}>
          {isPending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-luxury-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-gold-400 hover:text-gold-300 transition-colors">
          S&apos;inscrire
        </Link>
      </p>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 pt-6 border-t border-luxury-border">
          <p className="text-xs text-luxury-muted text-center mb-3">Comptes de demonstration</p>
          <div className="space-y-1 text-xs text-luxury-muted font-mono">
            <div className="flex justify-between gap-3 px-3 py-1.5 bg-luxury-dark rounded">
              <span className="text-gold-400">Admin</span>
              <span>admin@chronocraft.com / Admin@123456</span>
            </div>
            <div className="flex justify-between gap-3 px-3 py-1.5 bg-luxury-dark rounded">
              <span className="text-gold-400">Client</span>
              <span>demo@client.com / Demo@1234567</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <h2 className="text-2xl font-serif font-semibold text-white mb-2">Connexion</h2>
          <p className="text-sm text-luxury-muted">Chargement...</p>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
