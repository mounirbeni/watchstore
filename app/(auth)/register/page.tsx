"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await registerAction(formData);
      if (result.success) {
        router.push("/dashboard");
      }
      return result;
    },
    null,
  );

  const fieldError = (field: string) =>
    state && !state.success ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <Card>
      <h2 className="text-2xl font-serif font-semibold text-white mb-2">Créer un compte</h2>
      <p className="text-sm text-luxury-muted mb-8">
        Rejoignez la communauté ChronoCraft
      </p>

      {state && !state.success && !state.fieldErrors && (
        <div className="mb-4 p-3 rounded-lg bg-luxury-dark border border-gold-500/30 text-sm text-gold-400">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input id="firstName" name="firstName" label="Prénom" placeholder="Mohammed" required error={fieldError("firstName")} />
          <Input id="lastName" name="lastName" label="Nom" placeholder="Benali" required error={fieldError("lastName")} />
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="votre@email.com"
          autoComplete="email"
          required
          error={fieldError("email")}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Min. 12 caracteres, 1 majuscule, 1 chiffre"
          autoComplete="new-password"
          required
          error={fieldError("password")}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          required
          error={fieldError("confirmPassword")}
        />

        <Button type="submit" className="w-full mt-2" loading={isPending}>
          {isPending ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-luxury-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
