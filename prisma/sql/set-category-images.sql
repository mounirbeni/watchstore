-- Cover image for each category.
--
-- Unsplash photography, sized for the two places the site uses these:
-- the two-panel banner on the home page and the square category tiles.
-- Replace any row with a Cloudinary URL once you upload your own artwork
-- through Admin → Categories (next.config.ts only allows images.unsplash.com,
-- plus.unsplash.com and res.cloudinary.com, so an arbitrary host will not load).

update categories set "imageUrl" = 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1200&q=85' where slug = 'homme';
update categories set "imageUrl" = 'https://images.unsplash.com/photo-1612902456551-b6a23b7c6de1?w=1200&q=85' where slug = 'femme';
update categories set "imageUrl" = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&q=85' where slug = 'sport';
update categories set "imageUrl" = 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=1200&q=85' where slug = 'luxe';
update categories set "imageUrl" = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=85' where slug = 'smart';
update categories set "imageUrl" = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85' where slug = 'pack';
