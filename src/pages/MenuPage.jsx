import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'hot', label: 'Hot Coffee' },
  { key: 'frappe', label: 'Frappe' },
  { key: 'pastry', label: 'Pastries' },
];

function CardSkeleton() {
  return (
    <div className="px-2">
      <div className="bg-white rounded-3xl p-6 border border-stone-200 animate-pulse">
        <div className="h-6 w-20 bg-stone-200 rounded-full mx-auto mb-6" />
        <div className="w-32 h-32 bg-stone-200 rounded-2xl mx-auto mb-6" />
        <div className="h-4 bg-stone-200 rounded w-3/4 mx-auto mb-6" />
        <div className="flex justify-between items-center pt-4 border-t border-stone-100">
          <div className="h-5 w-16 bg-stone-200 rounded" />
          <div className="h-8 w-16 bg-stone-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { availableProducts, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let products = availableProducts;

    if (activeCategory !== 'all') {
      products = products.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }

    return products;
  }, [availableProducts, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-8 sm:mb-10">
        <h1 className="font-display text-stone-800 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center mb-3">
          Our Menu
        </h1>
        <p className="text-stone-500 text-center text-base sm:text-lg">
          Discover our handcrafted coffee and freshly baked pastries
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto px-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a drink or pastry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-full text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 mb-8 sm:mb-10">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 sm:px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeCategory === cat.key
                  ? 'bg-stone-800 text-white shadow-lg'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-xl">No products found</p>
            <p className="text-stone-300 text-sm mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showAddToCart light />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
