-- Post-delivery customer feedback, kept private to the admin.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerRating" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerReview" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "ratedAt" TIMESTAMP(3);
