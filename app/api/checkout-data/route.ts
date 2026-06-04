import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { computePricing } from "@/lib/pricing";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [cart, addresses, profile] = await Promise.all([
    db.cart.findUnique({
      where: { userId: user.userId },
      include: {
        items: {
          include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
          orderBy: { addedAt: "desc" },
        },
      },
    }),
    db.address.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    db.customerProfile.findUnique({ where: { userId: user.userId } }),
  ]);

  const cartItems = (cart?.items ?? []).map((i) => ({
    id: i.id,
    productName: i.product.name,
    quantity: i.quantity,
    unitPrice: Number(i.product.price),
    total: Number(i.product.price) * i.quantity,
    imageUrl: i.product.images[0]?.url ?? null,
  }));

  const subtotal = cartItems.reduce((s, i) => s + i.total, 0);
  const pricing = computePricing(subtotal);
  const defaultPhone = profile?.phone ?? addresses.find((a) => a.isDefault)?.phone ?? addresses[0]?.phone ?? "";

  return NextResponse.json({ addresses, cartItems, pricing, defaultPhone });
}
