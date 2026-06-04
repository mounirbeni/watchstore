---
name: project-chronocraft-rebuild
description: Full-stack Next.js 15 rebuild of ChronoCraft luxury watch store — replaced static HTML with real application
metadata:
  type: project
---

The watchstore project was completely rebuilt from static HTML/CSS/JS into a full-stack Next.js 15 TypeScript application.

**Why:** The original codebase had 100% fake data — hardcoded JS arrays for products, static admin dashboard numbers, no auth, no database, no real orders.

**Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS, Prisma ORM, PostgreSQL, iron-session (httpOnly cookies), bcryptjs, Zod validation, lucide-react icons.

**How to apply:** Future work should build on the real database and server actions — never add fake/hardcoded data back.

**Key file structure:**
- `prisma/schema.prisma` — 16 models (User, Product, Order, Reservation, Payment, etc.)
- `prisma/seed.ts` — realistic demo data (12 products, admin + demo customer)
- `lib/session.ts` — iron-session auth helpers
- `lib/db.ts` — Prisma singleton
- `middleware.ts` — route protection (admin/dashboard/checkout require auth)
- `actions/` — server actions (auth, products, orders, reservations, cart, wishlist, profile)
- `validations/index.ts` — Zod schemas for all forms
- `app/admin/*` — full admin dashboard with CRUD, audit logs
- `app/dashboard/*` — client portal (orders, reservations, wishlist, profile)
- `app/(shop)/*` — shop, product detail, cart, checkout
- `app/(auth)/*` — login, register

**Database setup required:**
1. Set DATABASE_URL in .env.local (PostgreSQL)
2. `npm run db:push` or `npm run db:migrate`
3. `npm run db:seed` for demo data

**Demo accounts (after seeding):**
- Admin: admin@chronocraft.com / Admin@123456
- Client: demo@client.com / Demo@123456
