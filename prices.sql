-- Update catalog prices to the 300–800 MAD range (prices-only, safe for production).
-- Run against the production database, e.g.:
--   psql "$DATABASE_URL" -f prices.sql
-- The storefront reads prices live from the DB, so changes appear immediately
-- (no redeploy needed).

UPDATE products SET price=699, "comparePrice"=799  WHERE slug='royal-chronograph-gold';
UPDATE products SET price=749, "comparePrice"=NULL WHERE slug='aventurier-noir-titane';
UPDATE products SET price=799, "comparePrice"=NULL WHERE slug='prestige-tourbillon';
UPDATE products SET price=649, "comparePrice"=799  WHERE slug='elegance-rose-diamant';
UPDATE products SET price=599, "comparePrice"=749  WHERE slug='navigator-gmt-bleu';
UPDATE products SET price=699, "comparePrice"=NULL WHERE slug='monaco-carbon-racing';
UPDATE products SET price=449, "comparePrice"=599  WHERE slug='perle-doree-femme';
UPDATE products SET price=499, "comparePrice"=649  WHERE slug='commandant-militaire';
UPDATE products SET price=759, "comparePrice"=NULL WHERE slug='executive-platine';
UPDATE products SET price=549, "comparePrice"=699  WHERE slug='capitaine-marine';
UPDATE products SET price=779, "comparePrice"=799  WHERE slug='sultan-or-arabe';
UPDATE products SET price=349, "comparePrice"=NULL WHERE slug='gentleman-cuir-noir';
