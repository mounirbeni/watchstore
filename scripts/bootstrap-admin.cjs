const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role } = require("@prisma/client");

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

const email = process.env.ADMIN_EMAIL || "admin@chronocraft.com";
const password = process.env.ADMIN_PASSWORD || "Admin@123456";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to bootstrap the admin account.");
  }

  const db = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      profile: { create: { firstName: "Admin", lastName: "ChronoCraft" } },
      cart: { create: {} },
      wishlist: { create: {} },
    },
    include: { profile: true, cart: true, wishlist: true },
  });

  if (!user.profile) {
    await db.customerProfile.create({
      data: { userId: user.id, firstName: "Admin", lastName: "ChronoCraft" },
    });
  }
  if (!user.cart) await db.cart.create({ data: { userId: user.id } });
  if (!user.wishlist) await db.wishlist.create({ data: { userId: user.id } });

  await db.$disconnect();
  console.log(`Admin account is ready: ${email}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
