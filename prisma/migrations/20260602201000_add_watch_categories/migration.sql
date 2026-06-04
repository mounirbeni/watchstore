INSERT INTO "categories" ("id", "name", "slug", "description", "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat_smart', 'Smart', 'smart', 'Montres connectees et modernes', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_pack', 'Pack', 'pack', 'Packs et coffrets de montres', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat_limited_edition', 'Limited Edition', 'limited-edition', 'Editions limitees et pieces exclusives', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "imageUrl" = EXCLUDED."imageUrl",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
