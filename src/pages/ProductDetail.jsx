import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProductById, loading } = useProducts();
  const product = getProductById(productId);
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  const [selectedSize, setSelectedSize] = useState('Medium');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 text-2xl mb-4">Product not found</p>
          <Link
            to="/menu"
            className="text-amber-700 hover:text-amber-800 underline transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const sizeExtra = product.sizes?.[selectedSize] || 0;
  const unitPrice = product.price + sizeExtra;
  const totalPrice = unitPrice * quantity;
  const favorited = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, notes);
    toast.success(`${product.name} added to cart!`, {
      icon: '☕',
      style: {
        background: '#422006',
        color: '#fde68a',
        border: '1px solid #92400e',
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="bg-white rounded-3xl p-10 border border-stone-200 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50 rounded-3xl"></div>
              <img
                src={product.image}
                alt={product.name}
                className="relative z-10 w-64 h-64 object-contain mx-auto"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className={`bg-gradient-to-r ${product.color} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg`}>
                Rank {product.rank}
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`transition-all duration-300 p-2 rounded-full ${
                  favorited
                    ? 'text-red-500 bg-red-50 scale-110'
                    : 'text-stone-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart size={24} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2.5} />
              </button>
            </div>

            <h1 className="text-stone-800 text-3xl font-bold tracking-wider mb-4">
              {product.name}
            </h1>

            <p className="text-stone-500 text-base leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="text-amber-700 font-bold text-3xl mb-8">
              ₱ {totalPrice.toFixed(2)}
              {sizeExtra > 0 && (
                <span className="text-stone-400 text-sm font-normal ml-2">
                  (+₱{sizeExtra.toFixed(2)} for {selectedSize})
                </span>
              )}
            </div>

            {/* Size Selector */}
            {product.sizes && (
              <div className="mb-6">
                <label className="text-stone-700 text-sm font-semibold block mb-3">Size</label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(product.sizes).map(([size, extra]) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-stone-800 text-white shadow-lg'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400'
                      }`}
                    >
                      {size}
                      {extra > 0 && <span className="text-xs ml-1 opacity-70">+₱{extra}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-stone-700 text-sm font-semibold block mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700 transition-all flex items-center justify-center"
                >
                  <Minus size={18} />
                </button>
                <span className="text-stone-800 text-xl font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700 transition-all flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mb-8">
              <label className="text-stone-700 text-sm font-semibold block mb-3">
                Special Instructions (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Less sugar, extra hot, oat milk..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
              />
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-3"
            >
              <ShoppingCart size={22} />
              Add to Cart — ₱ {totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
