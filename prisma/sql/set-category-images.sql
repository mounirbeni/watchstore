-- Cover image for each category, taken from a watch actually sold in it.
--
-- Picks one product image per category rather than a stock photo, so the
-- banner always shows something a visitor can click through and buy. Safe to
-- re-run: it repicks from current inventory, and a category whose products
-- have no images keeps whatever cover it already had.
--
-- Preference order within a category:
--   1. featured products first
--   2. then the best-selling
--   3. then the product's primary image, else its first image

update categories c
set "imageUrl" = chosen.url,
    "updatedAt" = now()
from (
  select distinct on (p."categoryId")
         p."categoryId",
         pi.url
  from products p
  join product_images pi on pi."productId" = p.id
  where p."isActive"
  order by p."categoryId",
           p."isFeatured" desc,
           p."soldCount" desc,
           pi."isPrimary" desc,
           pi."sortOrder" asc
) as chosen
where chosen."categoryId" = c.id;
