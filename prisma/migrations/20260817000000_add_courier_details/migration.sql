-- Courier handover details, surfaced to the customer once the parcel is out for delivery.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "carrierName" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "courierName" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "courierPhone" TEXT;
