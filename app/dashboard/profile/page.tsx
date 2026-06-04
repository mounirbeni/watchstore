import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { addAddressAction, deleteAddressAction, updateProfileAction } from "@/actions/profile";
import { changePasswordAction } from "@/actions/auth";
import SubmitButton from "@/components/forms/SubmitButton";
import {
  MapPin, Lock, User, Shield, Monitor,
  Smartphone, ChevronLeft, Star, Plus, Trash2,
} from "lucide-react";

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

function parseDevice(ua: string | null) {
  if (!ua) return { label: "Appareil inconnu", icon: "monitor" as const };
  const mobile = /iPhone|Android|iPad|Mobile/i.test(ua);
  const browser =
    ua.includes("Edg") ? "Edge" :
    ua.includes("Chrome") ? "Chrome" :
    ua.includes("Firefox") ? "Firefox" :
    ua.includes("Safari") ? "Safari" :
    "Navigateur";
  const os =
    ua.includes("Windows") ? "Windows" :
    ua.includes("Mac OS") ? "macOS" :
    ua.includes("iPhone") ? "iPhone" :
    ua.includes("Android") ? "Android" :
    ua.includes("Linux") ? "Linux" : "";
  return { label: os ? `${browser} · ${os}` : browser, icon: mobile ? "phone" as const : "monitor" as const };
}

const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted";
const inputClass = "input-luxury w-full";

export default async function DashboardProfilePage() {
  const session = await requireAuth();
  const [profile, addresses, loginSessions, user] = await Promise.all([
    db.customerProfile.findUnique({ where: { userId: session.userId } }),
    db.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    db.loginSession.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.user.findUnique({
      where: { id: session.userId },
      select: { createdAt: true, emailVerified: true },
    }),
  ]);

  const firstName = profile?.firstName ?? session.firstName;
  const lastName = profile?.lastName ?? session.lastName;
  const totalOrders = profile?.orderCount ?? 0;
  const loyaltyLevel =
    totalOrders >= 10 ? "Platinum" :
    totalOrders >= 5 ? "Or" :
    totalOrders >= 2 ? "Argent" :
    "Membre";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;

  const activeSessions = loginSessions.filter((s) => !s.revokedAt && s.expiresAt > new Date());

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Mobile back link ── */}
      <Link
        href="/dashboard"
        className="lg:hidden inline-flex items-center gap-1 text-sm text-luxury-muted hover:text-gold-500 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Tableau de bord
      </Link>

      {/* ━━━━━━━━━━━━━━━  PROFILE HERO  ━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark px-5 py-6 sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/6 blur-3xl" />
        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-gold-500/40 bg-gold-500/15 text-xl font-bold text-gold-500 sm:h-[72px] sm:w-[72px] sm:text-2xl">
            {firstName[0]?.toUpperCase()}{lastName[0]?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <h1 className="font-serif text-xl font-semibold text-luxury-white sm:text-2xl">
              {firstName} {lastName}
            </h1>
            <p className="mt-0.5 text-sm text-luxury-muted">{session.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 text-[11px] font-semibold text-gold-500">
                <Star className="h-3 w-3 fill-gold-500" />
                {loyaltyLevel}
              </span>
              {user?.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  <Shield className="h-3 w-3" />
                  Vérifié
                </span>
              )}
              {memberSince && (
                <span className="text-[11px] text-luxury-muted">Membre depuis {memberSince}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 border-t border-luxury-border pt-4">
          <div className="text-center">
            <p className="font-serif text-lg font-semibold text-luxury-white">{totalOrders}</p>
            <p className="mt-0.5 text-[11px] text-luxury-muted">Commandes</p>
          </div>
          <div className="border-x border-luxury-border text-center">
            <p className="font-serif text-lg font-semibold text-luxury-white">{addresses.length}</p>
            <p className="mt-0.5 text-[11px] text-luxury-muted">Adresses</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-lg font-semibold text-luxury-white">{activeSessions.length}</p>
            <p className="mt-0.5 text-[11px] text-luxury-muted">Sessions actives</p>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━  PERSONAL INFO  ━━━━━━━━━━━━━━━ */}
      <section className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
          <User className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="text-sm font-semibold text-luxury-white">Informations personnelles</h2>
        </div>
        <form action={updateProfile} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Prénom</label>
              <input
                name="firstName"
                required
                defaultValue={firstName}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nom</label>
              <input
                name="lastName"
                required
                defaultValue={lastName}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              placeholder="+212 6XX XXX XXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Adresse e-mail</label>
            <input
              value={session.email}
              disabled
              className="input-luxury w-full opacity-50 cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-luxury-muted">L&apos;adresse e-mail ne peut pas être modifiée.</p>
          </div>
          <SubmitButton>Enregistrer les modifications</SubmitButton>
        </form>
      </section>

      {/* ━━━━━━━━━━━━━━━  ADDRESSES  ━━━━━━━━━━━━━━━ */}
      <section className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-luxury-border px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-[15px] w-[15px] text-gold-500" />
            <h2 className="text-sm font-semibold text-luxury-white">Mes adresses</h2>
            {addresses.length > 0 && (
              <span className="rounded-full bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-500">
                {addresses.length}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Address list */}
          {addresses.length === 0 ? (
            <p className="rounded-xl border border-dashed border-luxury-border py-6 text-center text-sm text-luxury-muted">
              Aucune adresse enregistrée.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative rounded-xl border p-4 ${
                    address.isDefault
                      ? "border-gold-500/40 bg-gold-500/[0.03]"
                      : "border-luxury-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
                        <MapPin className="h-3.5 w-3.5 text-gold-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-luxury-white">{address.label}</p>
                        {address.isDefault && (
                          <span className="text-[10px] font-semibold text-gold-500">Par défaut</span>
                        )}
                      </div>
                    </div>
                    <form action={deleteAddress}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <button
                        type="submit"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-luxury-muted transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                  <div className="mt-3 space-y-0.5 text-xs text-luxury-muted">
                    <p className="text-luxury-light">{address.firstName} {address.lastName}</p>
                    <p>{address.street}</p>
                    <p>{address.city}{address.postalCode ? `, ${address.postalCode}` : ""}</p>
                    <p>{address.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add address form */}
          <div className="rounded-xl border border-dashed border-luxury-border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-gold-500" />
              <h3 className="text-sm font-semibold text-luxury-white">Ajouter une adresse</h3>
            </div>
            <form action={addAddress} className="space-y-3">
              <input name="label" className={inputClass} placeholder="Libellé (Domicile, Bureau…)" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="firstName" required className={inputClass} placeholder="Prénom" />
                <input name="lastName" required className={inputClass} placeholder="Nom" />
              </div>
              <input name="phone" required className={inputClass} placeholder="Téléphone" />
              <input name="street" required className={inputClass} placeholder="Rue et numéro" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="city" required className={inputClass} placeholder="Ville" />
                <input name="postalCode" required className={inputClass} placeholder="Code postal" />
              </div>
              <input type="hidden" name="isDefault" value="false" />
              <SubmitButton>Ajouter l&apos;adresse</SubmitButton>
            </form>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━  PASSWORD  ━━━━━━━━━━━━━━━ */}
      <section className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
          <Lock className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="text-sm font-semibold text-luxury-white">Mot de passe</h2>
        </div>
        <form action={changePassword} className="space-y-4 p-5">
          <div>
            <label className={labelClass}>Mot de passe actuel</label>
            <input name="currentPassword" required type="password" autoComplete="current-password" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nouveau mot de passe</label>
            <input name="newPassword" required type="password" minLength={12} autoComplete="new-password" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Confirmer le nouveau mot de passe</label>
            <input name="confirmPassword" required type="password" minLength={12} autoComplete="new-password" className={inputClass} />
          </div>
          <div className="rounded-xl bg-luxury-dark px-4 py-3 border border-luxury-border">
            <p className="text-[11px] text-luxury-muted leading-relaxed">
              Minimum 12 caractères · 1 majuscule · 1 chiffre · 1 caractère spécial
            </p>
          </div>
          <SubmitButton>Mettre à jour le mot de passe</SubmitButton>
        </form>
      </section>

      {/* ━━━━━━━━━━━━━━━  LOGIN SESSIONS  ━━━━━━━━━━━━━━━ */}
      <section className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
          <Shield className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="text-sm font-semibold text-luxury-white">Sessions de connexion</h2>
          <span className="rounded-full bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-500">
            {activeSessions.length} active{activeSessions.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y divide-luxury-border">
          {loginSessions.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-luxury-muted">Aucune session enregistrée.</p>
          ) : (
            loginSessions.map((item) => {
              const { label, icon } = parseDevice(item.userAgent);
              const isActive = !item.revokedAt && item.expiresAt > new Date();
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? "bg-emerald-50" : "bg-luxury-dark"
                  }`}>
                    {icon === "phone"
                      ? <Smartphone className={`h-4 w-4 ${isActive ? "text-emerald-500" : "text-luxury-muted"}`} />
                      : <Monitor className={`h-4 w-4 ${isActive ? "text-emerald-500" : "text-luxury-muted"}`} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-luxury-white truncate">{label}</p>
                    <p className="text-xs text-luxury-muted">
                      {item.ipAddress ? `${item.ipAddress} · ` : ""}
                      {item.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-luxury-dark text-luxury-muted"
                  }`}>
                    {isActive ? "Active" : item.revokedAt ? "Révoquée" : "Expirée"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
