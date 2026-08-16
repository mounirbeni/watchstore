/**
 * Deletes orders and/or users along with the rows that block them via
 * foreign keys (payments, orders, reservations, audit log references).
 *
 * Dry run (default) — reports what would be removed, changes nothing:
 *   node scripts/delete-records.cjs
 *
 * Perform the deletion:
 *   node scripts/delete-records.cjs --confirm
 *
 * Target ids come from ORDER_IDS / USER_IDS (comma separated) when set,
 * otherwise from the defaults below.
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const DEFAULT_ORDER_IDS = [
  "cmq039b3f001pqrmjawowlb9p",
  "cmq06j88y0001jzdm37z0jeb8",
];

const DEFAULT_USER_IDS = [
  "cmpvw88oh0000atunixqsdojn",
  "cmpx7hagl0000i8ctctsx5bg2",
  "cmpxbx0ev0009udntz5od8bjr",
  "cmpya9psw0000ozaye5pm95fm",
];

function idsFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

const orderIds = idsFromEnv("ORDER_IDS", DEFAULT_ORDER_IDS);
const userIds = idsFromEnv("USER_IDS", DEFAULT_USER_IDS);
const confirmed = process.argv.includes("--confirm");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Set it in .env or the shell.");
  }

  const db = new PrismaClient();

  // What exists right now, so the report reflects reality rather than the input list.
  const orders = await db.order.findMany({
    where: { OR: [{ id: { in: orderIds } }, { userId: { in: userIds } }] },
    select: { id: true, orderNumber: true, userId: true, total: true },
  });
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, role: true },
  });
  const targetOrderIds = orders.map((o) => o.id);

  const payments = await db.payment.count({
    where: { OR: [{ orderId: { in: targetOrderIds } }, { userId: { in: userIds } }] },
  });
  const reservations = await db.reservation.count({ where: { userId: { in: userIds } } });
  const auditLogs = await db.auditLog.count({ where: { userId: { in: userIds } } });

  console.log("Users to delete:      ", users.length);
  for (const u of users) console.log(`  - ${u.email} (${u.role}) ${u.id}`);
  console.log("Orders to delete:     ", orders.length);
  for (const o of orders) console.log(`  - ${o.orderNumber} total=${o.total} ${o.id}`);
  console.log("Payments to delete:   ", payments);
  console.log("Reservations to delete:", reservations);
  console.log("Audit logs to detach: ", auditLogs, "(userId set to null, rows kept)");

  const missingUsers = userIds.filter((id) => !users.some((u) => u.id === id));
  const missingOrders = orderIds.filter((id) => !targetOrderIds.includes(id));
  if (missingUsers.length) console.log("Users not found:      ", missingUsers.join(", "));
  if (missingOrders.length) console.log("Orders not found:     ", missingOrders.join(", "));

  if (!confirmed) {
    console.log("\nDry run — nothing was deleted. Re-run with --confirm to apply.");
    await db.$disconnect();
    return;
  }

  // Order matters: payments block orders, and orders block reservations.
  const result = await db.$transaction(async (tx) => {
    const deletedPayments = await tx.payment.deleteMany({
      where: { OR: [{ orderId: { in: targetOrderIds } }, { userId: { in: userIds } }] },
    });
    const deletedOrders = await tx.order.deleteMany({ where: { id: { in: targetOrderIds } } });
    const deletedReservations = await tx.reservation.deleteMany({ where: { userId: { in: userIds } } });
    const detachedLogs = await tx.auditLog.updateMany({
      where: { userId: { in: userIds } },
      data: { userId: null },
    });
    const deletedUsers = await tx.user.deleteMany({ where: { id: { in: userIds } } });

    return { deletedPayments, deletedOrders, deletedReservations, detachedLogs, deletedUsers };
  });

  console.log("\nDeleted.");
  console.log("  payments:    ", result.deletedPayments.count);
  console.log("  order_items: cascaded");
  console.log("  orders:      ", result.deletedOrders.count);
  console.log("  reservations:", result.deletedReservations.count);
  console.log("  audit_logs:  ", result.detachedLogs.count, "detached");
  console.log("  users:       ", result.deletedUsers.count);
  console.log("  profiles / addresses / carts / wishlists / notifications / sessions: cascaded");

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
