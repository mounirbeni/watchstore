import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [cart, addresses] = await Promise.all([
    db.cart.findUnique({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          },
        },
      },
    }),
    db.address.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
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

  return NextResponse.json({ addresses, cartItems, subtotal });
}
