import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { addAddressAction, deleteAddressAction, updateProfileAction } from "@/actions/profile";
import { changePasswordAction } from "@/actions/auth";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { MapPin } from "lucide-react";

export const metadata = { title: "Mon profil" };

async function updateProfile(formData: FormData) {
  "use server";
  await updateProfileAction(formData);
}

async function changePassword(formData: FormData) {
  "use server";
  await changePasswordAction(formData);
}

async function addAddress(formData: FormData) {
  "use server";
  await addAddressAction(formData);
}

async function deleteAddress(formData: FormData) {
  "use server";
  await deleteAddressAction(formData);
}

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-luxury-muted";

export default async function DashboardProfilePage() {
  const session = await requireAuth();
  const [profile, addresses, sessions] = await Promise.all([
    db.customerProfile.findUnique({ where: { userId: session.userId } }),
    db.address.findMany({ where: { userId: session.userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    db.loginSession.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mon profil"
        subtitle="Vos informations personnelles, adresses et sécurité."
        backHref="/dashboard"
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Informations personnelles</h2>
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Prénom</label>
                <input name="firstName" required defaultValue={profile?.firstName ?? session.firstName} className="input-luxury w-full" />
              </div>
              <div>
                <label className={fieldLabel}>Nom</label>
                <input name="lastName" required defaultValue={profile?.lastName ?? session.lastName} className="input-luxury w-full" />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Téléphone</label>
              <input name="phone" defaultValue={profile?.phone ?? ""} className="input-luxury w-full" placeholder="+212 ..." />
            </div>
            <SubmitButton>Enregistrer</SubmitButton>
          </form>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Mot de passe</h2>
          <form action={changePassword} className="space-y-4">
            <div>
              <label className={fieldLabel}>Mot de passe actuel</label>
              <input name="currentPassword" required type="password" className="input-luxury w-full" />
            </div>
            <div>
              <label className={fieldLabel}>Nouveau mot de passe</label>
              <input name="newPassword" required type="password" minLength={12} className="input-luxury w-full" />
            </div>
            <div>
              <label className={fieldLabel}>Confirmer le mot de passe</label>
              <input name="confirmPassword" required type="password" minLength={12} className="input-luxury w-full" />
            </div>
            <p className="text-xs text-luxury-muted">12 caractères minimum.</p>
            <SubmitButton>Mettre à jour</SubmitButton>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Mes adresses</h2>
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">Aucune adresse enregistrée.</p>
            ) : addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-luxury-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium text-white">
                      <MapPin className="h-4 w-4 text-gold-400" />
                      {address.label}
                      {address.isDefault && (
                        <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs text-gold-400">Par défaut</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-luxury-muted">{address.street}, {address.city} {address.postalCode}</p>
                    <p className="text-sm text-luxury-muted">{address.phone}</p>
                  </div>
                  <form action={deleteAddress}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <SubmitButton variant="ghost">Supprimer</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Ajouter une adresse</h2>
          <form action={addAddress} className="space-y-3">
            <input name="label" className="input-luxury w-full" placeholder="Libellé (Domicile, Bureau…)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="firstName" required className="input-luxury w-full" placeholder="Prénom" />
              <input name="lastName" required className="input-luxury w-full" placeholder="Nom" />
            </div>
            <input name="phone" required className="input-luxury w-full" placeholder="Téléphone" />
            <input name="street" required className="input-luxury w-full" placeholder="Rue" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="city" required className="input-luxury w-full" placeholder="Ville" />
              <input name="postalCode" required className="input-luxury w-full" placeholder="Code postal" />
            </div>
            <input type="hidden" name="isDefault" value="false" />
            <SubmitButton>Ajouter l&apos;adresse</SubmitButton>
          </form>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <h2 className="mb-4 text-xl font-serif text-white">Sessions de connexion</h2>
        <div className="space-y-3">
          {sessions.map((item) => (
            <div key={item.id} className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{item.userAgent ?? "Appareil inconnu"}</p>
                <span className={item.revokedAt ? "text-luxury-muted" : "text-green-400"}>
                  {item.revokedAt ? "Révoquée" : "Active"}
                </span>
              </div>
              <p className="mt-1">Connectée le {item.createdAt.toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
