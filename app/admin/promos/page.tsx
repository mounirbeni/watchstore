import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { createPromoCodeAction, togglePromoCodeAction, deletePromoCodeAction } from "@/actions/promos";
import { Tag, Plus, ToggleLeft, ToggleRight, Trash2, Percent, DollarSign } from "lucide-react";
import type { Metadata } from "next";
import type { PromoCode } from "@prisma/client";

export const metadata: Metadata = { title: "Codes Promo" };
export const dynamic = "force-dynamic";

async function createPromo(formData: FormData) {
  "use server";
  await createPromoCodeAction(formData);
}

async function togglePromo(formData: FormData) {
  "use server";
  await togglePromoCodeAction(formData);
}

async function deletePromo(formData: FormData) {
  "use server";
  await deletePromoCodeAction(formData);
}

export default async function AdminPromosPage() {
  const promos = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-luxury-white">Codes Promo</h1>
          <p className="text-sm text-luxury-muted mt-1">{promos.length} code{promos.length !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Create form */}
      <div className="bg-white border border-luxury-border rounded-2xl p-6 shadow-card">
        <h2 className="text-base font-semibold text-luxury-white mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4 text-gold-500" /> Nouveau code promo
        </h2>
        <form action={createPromo} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Code *</label>
            <input name="code" required placeholder="SUMMER20" className="input-luxury uppercase" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Description</label>
            <input name="description" placeholder="Promo été 2025" className="input-luxury" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Type de remise *</label>
            <select name="discountType" className="input-luxury" defaultValue="PERCENT">
              <option value="PERCENT">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (MAD)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Valeur *</label>
            <input name="discountValue" type="number" min="1" step="0.01" required placeholder="20" className="input-luxury" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Commande min. (MAD)</label>
            <input name="minOrderAmount" type="number" min="0" step="0.01" placeholder="500" className="input-luxury" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Utilisations max.</label>
            <input name="maxUses" type="number" min="1" step="1" placeholder="Illimité" className="input-luxury" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-luxury-light uppercase tracking-wide">Expire le</label>
            <input name="expiresAt" type="date" className="input-luxury" />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <button type="submit" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold">
              Créer le code
            </button>
          </div>
        </form>
      </div>

      {/* Promo list */}
      {promos.length === 0 ? (
        <div className="bg-white border border-luxury-border rounded-2xl p-12 text-center shadow-card">
          <Tag className="h-10 w-10 text-luxury-muted mx-auto mb-3" />
          <p className="text-luxury-muted">Aucun code promo créé.</p>
        </div>
      ) : (
        <div className="bg-white border border-luxury-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-luxury-border bg-luxury-dark">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-luxury-muted">Code</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-luxury-muted">Remise</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-luxury-muted hidden md:table-cell">Min. commande</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-luxury-muted hidden lg:table-cell">Utilisations</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-luxury-muted hidden lg:table-cell">Expiration</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-luxury-muted">Statut</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {promos.map((promo: PromoCode) => {
                  const expired = promo.expiresAt && promo.expiresAt < new Date();
                  const maxed = promo.maxUses !== null && promo.usedCount >= promo.maxUses;
                  const isEffectivelyActive = promo.isActive && !expired && !maxed;
                  return (
                    <tr key={promo.id} className="hover:bg-luxury-dark/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-luxury-white">{promo.code}</span>
                          {promo.description && (
                            <span className="text-xs text-luxury-muted hidden sm:inline">{promo.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-gold-500">
                          {promo.discountType === "PERCENT" ? (
                            <><Percent className="h-3.5 w-3.5" />{Number(promo.discountValue)}%</>
                          ) : (
                            <><DollarSign className="h-3.5 w-3.5" />{formatPrice(Number(promo.discountValue))}</>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-luxury-muted hidden md:table-cell">
                        {promo.minOrderAmount ? formatPrice(Number(promo.minOrderAmount)) : "—"}
                      </td>
                      <td className="px-5 py-4 text-luxury-muted hidden lg:table-cell">
                        {promo.usedCount}{promo.maxUses !== null ? ` / ${promo.maxUses}` : ""}
                      </td>
                      <td className="px-5 py-4 text-luxury-muted hidden lg:table-cell">
                        {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("fr-MA") : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isEffectivelyActive
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-luxury-border text-luxury-muted"
                        }`}>
                          {isEffectivelyActive ? "Actif" : expired ? "Expiré" : maxed ? "Épuisé" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <form action={togglePromo}>
                            <input type="hidden" name="id" value={promo.id} />
                            <button type="submit" title={promo.isActive ? "Désactiver" : "Activer"}
                              className="text-luxury-muted hover:text-luxury-white transition-colors p-1.5 rounded-lg hover:bg-luxury-dark">
                              {promo.isActive
                                ? <ToggleRight className="h-5 w-5 text-green-500" />
                                : <ToggleLeft className="h-5 w-5" />
                              }
                            </button>
                          </form>
                          <form action={deletePromo}>
                            <input type="hidden" name="id" value={promo.id} />
                            <button type="submit" title="Supprimer"
                              className="text-luxury-muted hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
