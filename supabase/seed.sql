-- ============================================================================
-- Aroma Cafe — seed menu data
-- Run AFTER schema.sql. Re-runnable (upserts on id).
-- image_key values map to bundled assets in src/lib/productImages.js
-- ============================================================================
insert into public.products (id, name, price, category, description, image_key, color, rank, sizes)
values
  ('coffee-1', 'HOT CAPPUCCINO', 180, 'hot',
   'A classic Italian espresso-based drink with steamed milk foam. Rich, bold, and perfectly balanced for any time of day.',
   'cappuccino', 'from-amber-700 to-yellow-600', 1, '{"Small":0,"Medium":30,"Large":50}'),

  ('coffee-2', 'AFFOGATO', 200, 'hot',
   'A scoop of creamy vanilla gelato drowned in a shot of hot espresso. The perfect dessert-meets-coffee experience.',
   'affogato', 'from-yellow-700 to-amber-800', 2, '{"Small":0,"Medium":30,"Large":50}'),

  ('coffee-3', 'DOUBLE ESPRESSO', 185, 'hot',
   'Two shots of our finest espresso for a bold and intense coffee kick. Pure, unapologetic coffee at its best.',
   'doubleEspresso', 'from-stone-700 to-amber-700', 3, '{"Small":0,"Medium":30,"Large":50}'),

  ('coffee-4', 'FRAPPE CARAMEL MACCHIATO', 195, 'frappe',
   'A blended iced coffee layered with velvety caramel and topped with whipped cream. Sweet, creamy, and refreshing.',
   'machiatto', 'from-orange-600 to-amber-700', 4, '{"Small":0,"Medium":30,"Large":50}'),

  ('coffee-5', 'FRAPPE MOCHA LATTE', 190, 'frappe',
   'A heavenly blend of chocolate, espresso, and milk blended with ice. The ultimate treat for chocolate and coffee lovers.',
   'frappeMocha', 'from-amber-600 to-orange-600', 5, '{"Small":0,"Medium":30,"Large":50}'),

  ('pastry-1', 'BISCOTTI', 120, 'pastry',
   'Crunchy, twice-baked Italian almond cookies. The perfect companion to dip into your favorite coffee.',
   'biscotti', 'from-yellow-600 to-orange-600', 1, null),

  ('pastry-2', 'CARAMEL PUDDING', 165, 'pastry',
   'Silky smooth custard with a golden caramel glaze. A classic comfort dessert made fresh daily.',
   'caramel', 'from-amber-500 to-yellow-600', 2, null),

  ('pastry-3', 'TIRAMISU CAKE', 190, 'pastry',
   'Layers of coffee-soaked ladyfingers and mascarpone cream dusted with cocoa. An Italian masterpiece.',
   'tiramisu', 'from-orange-500 to-amber-600', 3, null),

  ('pastry-4', 'CHOCOLATE CROISSANT', 145, 'pastry',
   'Flaky, buttery pastry filled with rich dark chocolate. Baked fresh every morning for that perfect crunch.',
   'croissant', 'from-yellow-500 to-orange-500', 4, null),

  ('pastry-5', 'CHEESECAKE', 175, 'pastry',
   'Creamy New York-style cheesecake on a buttery graham cracker crust. Rich, decadent, and unforgettable.',
   'cheesecake', 'from-pink-400 to-orange-500', 5, null)
on conflict (id) do update set
  name        = excluded.name,
  price       = excluded.price,
  category    = excluded.category,
  description = excluded.description,
  image_key   = excluded.image_key,
  color       = excluded.color,
  rank        = excluded.rank,
  sizes       = excluded.sizes;
