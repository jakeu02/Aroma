import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Loader2, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../lib/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, configured } = useAuth();
  const [orderType, setOrderType] = useState('pickup');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState(null);
  const [placing, setPlacing] = useState(false);

  // Prefill the checkout form from the signed-in account.
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const tax = cartTotal * 0.12;
  const grandTotal = cartTotal + tax;

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (configured && !user) {
      toast.error('Please sign in to place your order');
      return;
    }
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }
    setPlacing(true);
    const { error, orderCode: code } = await placeOrder({
      customer: formData,
      orderType,
      items: cartItems,
      subtotal: cartTotal,
      tax,
      total: grandTotal,
      userId: user?.id,
    });
    setPlacing(false);

    if (error) {
      toast.error(error, { duration: 5000 });
      return;
    }

    setOrderCode(code || null);
    setOrderPlaced(true);
    clearCart();
    toast.success('Order placed successfully!', {
      icon: '🎉',
      duration: 4000,
      style: {
        background: '#422006',
        color: '#fde68a',
        border: '1px solid #92400e',
      },
    });
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-stone-800 text-3xl font-bold mb-4">Order Confirmed!</h2>
          <p className="text-stone-500 mb-6">
            Thank you, {formData.name}! Your order has been placed. We&apos;ll notify you when
            it&apos;s ready for {orderType}.
          </p>

          {orderCode && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200 mb-8 shadow-sm">
              <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Your order code</p>
              <p className="text-stone-800 text-3xl font-bold tracking-[0.2em]">{orderCode}</p>
              <p className="text-stone-400 text-xs mt-3">
                Follow your order&apos;s progress in{' '}
                <Link to="/orders" className="text-amber-700 font-semibold hover:underline">My Orders</Link>.
                Once it&apos;s {orderType === 'delivery' ? 'delivered' : 'picked up'}, you can leave a rating there.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              View My Orders
            </Link>
            <Link
              to="/menu"
              className="inline-block bg-white border border-stone-200 hover:border-amber-400 text-stone-700 font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-sm"
            >
              Order Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-stone-300 mx-auto mb-6" />
          <h2 className="text-stone-800 text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-stone-400 mb-8">Add some coffee or pastries to get started!</p>
          <Link
            to="/menu"
            className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-stone-800 text-4xl md:text-5xl font-bold tracking-tight text-center mb-10">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const sizeExtra = item.product.sizes?.[item.size] || 0;
              const itemPrice = (item.product.price + sizeExtra) * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
                >
                  {/* Image */}
                  <Link to={`/menu/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-stone-800 font-bold text-sm tracking-wider">
                      {item.product.name}
                    </h3>
                    {item.size && (
                      <p className="text-stone-400 text-xs mt-1">Size: {item.size}</p>
                    )}
                    {item.notes && (
                      <p className="text-stone-400 text-xs mt-1 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.size, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 text-stone-600 hover:border-amber-400 transition-all flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-stone-800 font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.size, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 text-stone-600 hover:border-amber-400 transition-all flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex items-center gap-4">
                    <span className="text-amber-700 font-bold text-lg">
                      ₱ {itemPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="text-red-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 sticky top-28 shadow-sm">
              <h2 className="text-stone-800 text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>₱ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Tax (12%)</span>
                  <span>₱ {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-800 font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-amber-700">₱ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {configured && !user ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-6 h-6 text-amber-700" />
                  </div>
                  <p className="text-stone-700 font-semibold mb-1">Sign in to check out</p>
                  <p className="text-stone-400 text-sm mb-5">
                    Create an account to place your order and track it anytime.
                  </p>
                  <Link
                    to="/account?redirect=/cart"
                    className="block w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 rounded-full transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
                  >
                    Sign in / Create account
                  </Link>
                </div>
              ) : (
              <>
              {/* Order Type */}
              <div className="mb-6">
                <label className="text-stone-700 text-sm font-semibold block mb-3">
                  Order Type
                </label>
                <div className="flex gap-3">
                  {['pickup', 'delivery'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 capitalize ${
                        orderType === type
                          ? 'bg-stone-800 text-white shadow-lg'
                          : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-amber-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all text-sm"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all text-sm"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={placing}
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-full text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing && <Loader2 className="w-5 h-5 animate-spin" />}
                  {placing ? 'Placing order…' : `Place Order — ₱ ${grandTotal.toFixed(2)}`}
                </button>
              </form>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
