import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Loader2, PackageCheck, Clock, Coffee, CheckCircle2, XCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatPrice } from '../data/products';
import toast from 'react-hot-toast';

const STEPS = [
  { key: 'pending', label: 'Order received', icon: Clock },
  { key: 'preparing', label: 'Preparing', icon: Coffee },
  { key: 'ready', label: `Ready for pickup / out for delivery`, icon: PackageCheck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TrackOrderPage() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) {
      toast.error('Enter your order code and phone number');
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error('Order tracking is not available yet.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('track_order', {
      p_code: code.trim(),
      p_phone: phone.trim(),
    });
    setLoading(false);
    setSearched(true);

    if (error) {
      toast.error(error.message);
      setOrder(null);
      return;
    }
    setOrder(data || null);
  };

  const cancelled = order?.status === 'cancelled';
  const activeIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-display text-stone-800 text-4xl sm:text-5xl font-bold tracking-tight text-center mb-3">
          Track Your Order
        </h1>
        <p className="text-stone-500 text-center mb-10">
          Enter the order code from your receipt and the phone number you ordered with.
        </p>

        <form
          onSubmit={handleTrack}
          className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Order code (e.g. AB12CD)"
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all tracking-widest uppercase"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search size={18} />}
            <span className="sm:hidden">Track</span>
          </button>
        </form>

        {searched && !order && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <XCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-semibold">No order found</p>
            <p className="text-stone-400 text-sm mt-1">
              Double-check your order code and phone number.
            </p>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-6 pb-6 border-b border-stone-100">
              <div>
                <p className="text-stone-400 text-xs uppercase tracking-wider">Order</p>
                <p className="text-stone-800 text-2xl font-bold tracking-[0.2em]">{order.order_code}</p>
                <p className="text-stone-400 text-sm mt-1">{formatDate(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-stone-400 text-xs uppercase tracking-wider">Total</p>
                <p className="text-amber-700 text-2xl font-bold">{formatPrice(order.total)}</p>
                <p className="text-stone-400 text-sm mt-1 capitalize">{order.order_type}</p>
              </div>
            </div>

            {/* Status */}
            {cancelled ? (
              <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-4 mb-6">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <p className="font-semibold">This order was cancelled. Please contact us if this is unexpected.</p>
              </div>
            ) : (
              <div className="space-y-1 mb-6">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= activeIndex;
                  const current = i === activeIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            done ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'
                          } ${current ? 'ring-4 ring-amber-200' : ''}`}
                        >
                          <Icon size={18} />
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-0.5 h-6 ${i < activeIndex ? 'bg-amber-600' : 'bg-stone-200'}`} />
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${done ? 'text-stone-800' : 'text-stone-400'} ${i < STEPS.length - 1 ? 'mb-6' : ''}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Items */}
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <p className="text-stone-700 font-semibold text-sm mb-2">Items</p>
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex justify-between text-sm text-stone-600">
                  <span>
                    {it.quantity}× {it.product_name}
                    {it.size ? <span className="text-stone-400"> ({it.size})</span> : null}
                  </span>
                  <span className="text-stone-500">{formatPrice(it.unit_price * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/menu" className="text-amber-700 font-semibold text-sm hover:underline">
            ← Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
