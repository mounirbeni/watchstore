import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ valid: false, error: "Connexion requise" }, { status: 401 });

  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? "0");

  if (!code) return NextResponse.json({ valid: false, error: "Code requis" });

  const promo = await db.promoCode.findUnique({ where: { code } });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ valid: false, error: "Code promo invalide ou expiré" });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Ce code promo a expiré" });
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ valid: false, error: "Ce code promo a atteint sa limite d'utilisation" });
  }
  if (promo.minOrderAmount !== null && subtotal < Number(promo.minOrderAmount)) {
    return NextResponse.json({
      valid: false,
      error: `Commande minimum de ${Number(promo.minOrderAmount)} MAD requise`,
    });
  }

  let discountAmount: number;
  if (promo.discountType === "PERCENT") {
    discountAmount = Math.round((subtotal * Number(promo.discountValue)) / 100);
  } else {
    discountAmount = Math.min(Number(promo.discountValue), subtotal);
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: Number(promo.discountValue),
    discountAmount,
  });
}
