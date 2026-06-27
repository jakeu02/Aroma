import Cappuccino from '../assets/categories/hot_cappuccino.png';
import Affogato from '../assets/categories/affogato.png';
import DoubleEspresso from '../assets/categories/dbespresso.png';
import Machiatto from '../assets/categories/machiatto.png';
import FrappeMocha from '../assets/categories/frappe_mocha.png';
import Biscotti from '../assets/categories/biscotti.png';
import Caramel from '../assets/categories/caramel_pudding.png';
import Croissant from '../assets/categories/croissant.png';
import Tiramisu from '../assets/categories/tiramisu.png';
import Cheesecake from '../assets/categories/cheesecake.png';
import placeholder from '../assets/coffee.png';

// Maps a product's `image_key` (stored in Supabase) to a bundled asset so the
// menu keeps working offline and images stay optimized by the bundler.
export const productImages = {
  cappuccino: Cappuccino,
  affogato: Affogato,
  doubleEspresso: DoubleEspresso,
  machiatto: Machiatto,
  frappeMocha: FrappeMocha,
  biscotti: Biscotti,
  caramel: Caramel,
  croissant: Croissant,
  tiramisu: Tiramisu,
  cheesecake: Cheesecake,
};

export function resolveImage(imageKey) {
  return productImages[imageKey] || placeholder;
}

export function formatPrice(price) {
  return `₱ ${Number(price).toFixed(2)}`;
}

// Normalizes a Supabase row into the shape the UI components expect.
export function normalizeProduct(row) {
  return {
    id: row.id,
    rank: row.rank ?? 0,
    name: row.name,
    price: Number(row.price),
    priceLabel: formatPrice(row.price),
    image: resolveImage(row.image_key),
    imageKey: row.image_key,
    color: row.color || 'from-amber-700 to-yellow-600',
    category: row.category,
    description: row.description || '',
    sizes: row.sizes || undefined,
    isAvailable: row.is_available ?? true,
  };
}

// Fallback data — used when Supabase isn't configured or a fetch fails.
const RAW_PRODUCTS = [
  { id: 'coffee-1', rank: 1, name: 'HOT CAPPUCCINO', price: 180, image_key: 'cappuccino', color: 'from-amber-700 to-yellow-600', category: 'hot', description: 'A classic Italian espresso-based drink with steamed milk foam. Rich, bold, and perfectly balanced for any time of day.', sizes: { Small: 0, Medium: 30, Large: 50 } },
  { id: 'coffee-2', rank: 2, name: 'AFFOGATO', price: 200, image_key: 'affogato', color: 'from-yellow-700 to-amber-800', category: 'hot', description: 'A scoop of creamy vanilla gelato drowned in a shot of hot espresso. The perfect dessert-meets-coffee experience.', sizes: { Small: 0, Medium: 30, Large: 50 } },
  { id: 'coffee-3', rank: 3, name: 'DOUBLE ESPRESSO', price: 185, image_key: 'doubleEspresso', color: 'from-stone-700 to-amber-700', category: 'hot', description: 'Two shots of our finest espresso for a bold and intense coffee kick. Pure, unapologetic coffee at its best.', sizes: { Small: 0, Medium: 30, Large: 50 } },
  { id: 'coffee-4', rank: 4, name: 'FRAPPE CARAMEL MACCHIATO', price: 195, image_key: 'machiatto', color: 'from-orange-600 to-amber-700', category: 'frappe', description: 'A blended iced coffee layered with velvety caramel and topped with whipped cream. Sweet, creamy, and refreshing.', sizes: { Small: 0, Medium: 30, Large: 50 } },
  { id: 'coffee-5', rank: 5, name: 'FRAPPE MOCHA LATTE', price: 190, image_key: 'frappeMocha', color: 'from-amber-600 to-orange-600', category: 'frappe', description: 'A heavenly blend of chocolate, espresso, and milk blended with ice. The ultimate treat for chocolate and coffee lovers.', sizes: { Small: 0, Medium: 30, Large: 50 } },
  { id: 'pastry-1', rank: 1, name: 'BISCOTTI', price: 120, image_key: 'biscotti', color: 'from-yellow-600 to-orange-600', category: 'pastry', description: 'Crunchy, twice-baked Italian almond cookies. The perfect companion to dip into your favorite coffee.' },
  { id: 'pastry-2', rank: 2, name: 'CARAMEL PUDDING', price: 165, image_key: 'caramel', color: 'from-amber-500 to-yellow-600', category: 'pastry', description: 'Silky smooth custard with a golden caramel glaze. A classic comfort dessert made fresh daily.' },
  { id: 'pastry-3', rank: 3, name: 'TIRAMISU CAKE', price: 190, image_key: 'tiramisu', color: 'from-orange-500 to-amber-600', category: 'pastry', description: 'Layers of coffee-soaked ladyfingers and mascarpone cream dusted with cocoa. An Italian masterpiece.' },
  { id: 'pastry-4', rank: 4, name: 'CHOCOLATE CROISSANT', price: 145, image_key: 'croissant', color: 'from-yellow-500 to-orange-500', category: 'pastry', description: 'Flaky, buttery pastry filled with rich dark chocolate. Baked fresh every morning for that perfect crunch.' },
  { id: 'pastry-5', rank: 5, name: 'CHEESECAKE', price: 175, image_key: 'cheesecake', color: 'from-pink-400 to-orange-500', category: 'pastry', description: 'Creamy New York-style cheesecake on a buttery graham cracker crust. Rich, decadent, and unforgettable.' },
];

export const fallbackProducts = RAW_PRODUCTS.map((r) =>
  normalizeProduct({ ...r, is_available: true })
);

export const coffeeProducts = fallbackProducts.filter((p) => p.category !== 'pastry');
export const pastryProducts = fallbackProducts.filter((p) => p.category === 'pastry');
export const allProducts = fallbackProducts;

export function getProductById(id) {
  return fallbackProducts.find((p) => p.id === id);
}
