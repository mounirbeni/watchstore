import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NotificationCategory } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const CLIENT_CATEGORIES: NotificationCategory[] = [
  NotificationCategory.ORDER,
  NotificationCategory.PAYMENT,
  NotificationCategory.RESERVATION,
  NotificationCategory.SHIPPING,
  NotificationCategory.ACCOUNT,
  NotificationCategory.SECURITY,
];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();
  const onlyUnread = searchParams.get("unread") === "1";

  const where: Prisma.NotificationWhereInput = {
    userId: user.userId,
    category: { in: CLIENT_CATEGORIES },
  };

  if (category && category !== "ALL" && CLIENT_CATEGORIES.includes(category as NotificationCategory)) {
    where.category = category as NotificationCategory;
  }
  if (onlyUnread) where.isRead = false;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, unreadCount, total] = await Promise.all([
    db.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
    db.notification.count({ where: { userId: user.userId, isRead: false, category: { in: CLIENT_CATEGORIES } } }),
    db.notification.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category,
      priority: n.priority,
      actionUrl: n.actionUrl,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
    unreadCount,
    total,
  });
}
