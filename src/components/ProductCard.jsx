import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product, showAddToCart = false, light = false }) {
  const { toggleFavorite, isFavorite, addToCart } = useCart();
  const favorited = isFavorite(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes ? 'Medium' : undefined);
    toast.success(`${product.name} added to cart!`, {
      icon: '☕',
      style: {
        background: '#422006',
        color: '#fde68a',
        border: '1px solid #92400e',
      },
    });
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  if (light) {
    return (
      <div className="h-full px-2">
        <Link to={`/menu/${product.id}`} className="block h-full">
          <div className="bg-white rounded-3xl p-6 h-full flex flex-col items-center border border-stone-200 hover:border-amber-400 transition-all duration-500 hover:shadow-xl hover:shadow-amber-200/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50 group-hover:to-orange-50 transition-all duration-500 rounded-3xl"></div>

            <div className={`relative bg-gradient-to-r ${product.color} text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-lg z-10`}>
              Rank {product.rank}
            </div>

            <div className="relative text-8xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10">
              <img src={product.image} alt={product.name} className="w-32 h-32 object-contain" />
            </div>

            <h3 className="relative text-stone-800 text-base font-bold tracking-wider mb-4 text-center px-2 z-10 group-hover:text-amber-700 transition-colors duration-300">
              {product.name}
            </h3>

            <div className="relative flex items-center justify-between w-full mt-auto pt-4 border-t border-stone-200 z-10">
              <span className="text-amber-700 font-bold text-xl group-hover:text-amber-600 transition-colors duration-300">
                {product.priceLabel}
              </span>
              <div className="flex items-center gap-2">
                {showAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    className="transition-all duration-300 p-2 rounded-full text-stone-600 hover:text-amber-700 hover:bg-amber-100 hover:scale-110"
                  >
                    <ShoppingCart size={20} />
                  </button>
                )}
                <button
                  onClick={handleToggleFavorite}
                  className={`transition-all duration-300 p-2 rounded-full ${
                    favorited
                      ? 'text-red-500 bg-red-50 scale-110'
                      : 'text-stone-400 hover:text-red-500 hover:bg-red-50 hover:scale-110'
                  }`}
                >
                  <Heart size={22} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full px-2">
      <Link to={`/menu/${product.id}`} className="block h-full">
        <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 h-full flex flex-col items-center border border-amber-700/50 hover:border-amber-500 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 group relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-orange-600/0 to-amber-600/0 group-hover:from-amber-600/10 group-hover:via-orange-600/10 group-hover:to-amber-600/10 transition-all duration-500 rounded-3xl"></div>

          <div className={`relative bg-gradient-to-r ${product.color} text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-lg z-10`}>
            Rank {product.rank}
          </div>

          <div className="relative text-8xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10">
            <img src={product.image} alt={product.name} className="w-32 h-32 object-contain" />
          </div>

          <h3 className="relative text-white text-base font-bold tracking-wider mb-4 text-center px-2 z-10 group-hover:text-amber-300 transition-colors duration-300">
            {product.name}
          </h3>

          <div className="relative flex items-center justify-between w-full mt-auto pt-4 border-t border-amber-700/40 z-10">
            <span className="text-amber-400 font-bold text-xl group-hover:text-amber-300 transition-colors duration-300">
              {product.priceLabel}
            </span>
            <div className="flex items-center gap-2">
              {showAddToCart && (
                <button
                  onClick={handleAddToCart}
                  className="transition-all duration-300 p-2 rounded-full text-white hover:text-amber-400 hover:bg-amber-500/20 hover:scale-110"
                >
                  <ShoppingCart size={20} />
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`transition-all duration-300 p-2 rounded-full ${
                  favorited
                    ? 'text-red-500 bg-red-500/20 scale-110'
                    : 'text-white hover:text-red-500 hover:bg-red-500/20 hover:scale-110'
                }`}
              >
                <Heart size={22} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
