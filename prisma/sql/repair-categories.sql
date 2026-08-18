-- Repairs the category consolidation.

-- The earlier script assumed homme/femme/sport/luxe/smart/pack all existed.
-- Only homme and femme did, so the subqueries returned NULL and the products
-- of the other categories were orphaned instead of moved. This recreates the
-- missing categories and reattaches every product by SKU.

begin;

-- 1. Recreate the six categories. Existing rows are left untouched.

insert into categories (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt")
values (gen_random_uuid()::text, 'Homme', 'homme', 'Montres pour homme', 1, true, now(), now())
on conflict (slug) do update set name = excluded.name, description = excluded.description, "sortOrder" = excluded."sortOrder", "isActive" = true;

insert into categories (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt")
values (gen_random_uuid()::text, 'Femme', 'femme', 'Montres pour femme', 2, true, now(), now())
on conflict (slug) do update set name = excluded.name, description = excluded.description, "sortOrder" = excluded."sortOrder", "isActive" = true;

insert into categories (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt")
values (gen_random_uuid()::text, 'Sport', 'sport', 'Montres sportives', 3, true, now(), now())
on conflict (slug) do update set name = excluded.name, description = excluded.description, "sortOrder" = excluded."sortOrder", "isActive" = true;

insert into categories (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt")
values (gen_random_uuid()::text, 'Luxe', 'luxe', 'Collection haute horlogerie', 4, true, now(), now())
on conflict (slug) do update set name = excluded.name, description = excluded.description, "sortOrder" = excluded."sortOrder", "isActive" = true;

insert into categories (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt")
values (gen_random_uuid()::text, 'Smart', 'smart', 'Montres connectées et modernes', 5, true, now(), now())
on conflict (slug) do update set name = excluded.name, description = excluded.description, "sortOrder" = excluded."sortOrder", "isActive" = true;

insert into categories (id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt")
values (gen_random_uuid()::text, 'Accessoires', 'pack', 'Coffrets, écrins et accessoires horlogers', 6, true, now(), now())
on conflict (slug) do update set name = excluded.name, description = excluded.description, "sortOrder" = excluded."sortOrder", "isActive" = true;

-- 2. Reattach every product to its category, matched on SKU.

update products set "categoryId" = (select id from categories where slug = 'homme')
where sku in ('CC-MEN-001', 'CC-MEN-002', 'CC-MEN-003', 'CC-MEN-004', 'CC-MEN-005', 'CC-MEN-006', 'CC-MEN-007', 'CC-MEN-008', 'CC-MEN-009', 'CC-MEN-010', 'CC-MEN-011', 'CC-MEN-012');

update products set "categoryId" = (select id from categories where slug = 'femme')
where sku in ('CC-WOM-001', 'CC-WOM-002', 'CC-WOM-003', 'CC-WOM-004', 'CC-WOM-005', 'CC-WOM-006', 'CC-WOM-007', 'CC-WOM-008');

update products set "categoryId" = (select id from categories where slug = 'sport')
where sku in ('CC-SPT-001', 'CC-SPT-002', 'CC-SPT-003', 'CC-SPT-004', 'CC-SPT-005');

update products set "categoryId" = (select id from categories where slug = 'luxe')
where sku in ('CC-LUX-001', 'CC-LUX-002', 'CC-LUX-003');

update products set "categoryId" = (select id from categories where slug = 'smart')
where sku in ('CC-SMT-001', 'CC-SMT-002', 'CC-SMT-003', 'CC-SMT-004', 'CC-SMT-005', 'CC-SMT-006', 'CC-SMT-007', 'CC-SMT-008', 'CC-SMT-009', 'CC-SMT-010', 'CC-SMT-011', 'CC-SMT-012');

update products set "categoryId" = (select id from categories where slug = 'pack')
where sku in ('CC-CLP-001', 'CC-CLP-002', 'CC-CLP-003', 'CC-CLP-004', 'CC-CLP-005', 'CC-CLP-006', 'CC-CLP-007', 'CC-CLP-008', 'CC-GFT-001', 'CC-GFT-002', 'CC-GFT-003', 'CC-GFT-004', 'CC-GFT-005', 'CC-ACC-001', 'CC-ACC-002', 'CC-ACC-003', 'CC-ACC-004', 'CC-ACC-005', 'CC-ACC-006', 'CC-ACC-007');

commit;
