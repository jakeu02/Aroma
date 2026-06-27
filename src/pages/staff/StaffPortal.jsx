import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Plus, Minus, Trash2, Search, Coffee, LogOut, Armchair,
  Loader2, Check, Banknote, CreditCard, ExternalLink, Menu, X, Utensils, ShoppingBag,
} from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { placeOrder } from '../../lib/api';
import { formatPrice } from '../../data/products';
import { OrdersTab, FloorTab } from '../admin/AdminDashboard';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'pos', label: 'Point of Sale', icon: ShoppingCart, desc: 'Take counter orders' },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, desc: 'Live order queue' },
  { key: 'floor', label: 'Reservations', icon: Armchair, desc: 'Dining tables & bookings' },
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'hot', label: 'Hot Coffee' },
  { key: 'frappe', label: 'Frappe' },
  { key: 'pastry', label: 'Pastry' },
];

/* ------------------------------------------------------------------ shell */
function Sidebar({ tab, setTab, user, signOut, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-sm">Aroma Cafe</p>
          <p className="text-stone-400 text-[11px]">Staff Terminal</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); onNavigate?.(); }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-amber-500/15 text-amber-300' : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-amber-400" />}
              <Icon size={18} /> {t.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-200 flex items-center justify-center text-xs font-bold uppercase">
            {user?.email?.[0] || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-stone-300 text-xs truncate">{user?.email}</p>
            <p className="text-stone-500 text-[10px]">Employee</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function StaffPortal() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('pos');
  const [mobileNav, setMobileNav] = useState(false);
  const meta = TABS.find((t) => t.key === tab) || TABS[0];

  return (
    <div className="min-h-screen bg-stone-50">
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-stone-900 z-40">
        <Sidebar tab={tab} setTab={setTab} user={user} signOut={signOut} />
      </aside>

      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} />
          <aside className="relative w-60 bg-stone-900 h-full">
            <button onClick={() => setMobileNav(false)} className="absolute top-4 right-4 text-stone-400 hover:text-white">
              <X size={20} />
            </button>
            <Sidebar tab={tab} setTab={setTab} user={user} signOut={signOut} onNavigate={() => setMobileNav(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setMobileNav(true)} className="lg:hidden text-stone-600 p-1 -ml-1" aria-label="Open menu">
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-stone-900 font-bold text-xl leading-tight truncate">{meta.label}</h1>
                <p className="text-stone-400 text-xs truncate hidden sm:block">{meta.desc}</p>
              </div>
            </div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-stone-100 transition-all">
              <ExternalLink size={16} /> <span className="hidden sm:inline">View site</span>
            </Link>
          </div>
        </header>

        <main className={tab === 'pos' ? '' : 'px-4 sm:px-6 py-6'}>
          {tab === 'pos' && <POS user={user} />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'floor' && <FloorTab canEdit={false} />}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- POS */
function POS({ user }) {
  const { availableProducts, loading } = useProducts();
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState('');
  const [cash, setCash] = useState('');
  const [charging, setCharging] = useState(false);
  const [done, setDone] = useState(null); // { code, change }

  const loadTables = useCallback(async () => {
    const { data } = await supabase.from('cafe_tables').select('*').eq('kind', 'table').order('label');
    setTables(data || []);
  }, []);
  useEffect(() => { loadTables(); }, [loadTables]);

  const products = availableProducts.filter((p) => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const lineUnit = (i) => i.product.price + (i.product.sizes?.[i.size] || 0);
  const subtotal = cart.reduce((s, i) => s + lineUnit(i) * i.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const change = cash ? Number(cash) - total : 0;

  const addToCart = (product) => {
    const size = product.sizes ? 'Medium' : null;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.size === size);
      if (idx >= 0) {
        const c = [...prev];
        c[idx] = { ...c[idx], quantity: c[idx].quantity + 1 };
        return c;
      }
      return [...prev, { product, size, quantity: 1, notes: '' }];
    });
  };

  const setQty = (idx, delta) => {
    setCart((prev) => prev.flatMap((i, n) => {
      if (n !== idx) return [i];
      const q = i.quantity + delta;
      return q <= 0 ? [] : [{ ...i, quantity: q }];
    }));
  };

  const setSize = (idx, size) => {
    setCart((prev) => prev.map((i, n) => (n === idx ? { ...i, size } : i)));
  };

  const reset = () => {
    setCart([]); setCash(''); setTableId(''); setDone(null);
  };

  const charge = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (cash && Number(cash) < total) return toast.error('Cash is less than the total');

    const table = tables.find((t) => t.id === tableId);
    const tableLabel = orderType === 'dine-in' ? (table?.label || null) : null;

    setCharging(true);
    const { error, orderCode } = await placeOrder({
      customer: { name: tableLabel ? `Table ${tableLabel}` : 'Walk-in', phone: '' },
      orderType,
      items: cart,
      subtotal,
      tax,
      total,
      status: 'preparing',
      tableLabel,
    });

    if (!error && orderType === 'dine-in' && table) {
      await supabase.from('cafe_tables').update({ status: 'occupied' }).eq('id', table.id);
      loadTables();
    }
    setCharging(false);

    if (error) return toast.error(error, { duration: 5000 });
    setDone({ code: orderCode, change: cash ? change : null });
    setCart([]); setCash('');
    toast.success('Sale completed!', { icon: '✅', style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-0 lg:h-[calc(100vh-4rem)]">
      {/* Menu */}
      <div className="p-4 sm:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  cat === c.key ? 'bg-stone-800 text-white shadow' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-600 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="group bg-white rounded-2xl border border-stone-200 p-3 text-left hover:border-amber-400 hover:shadow-md transition-all active:scale-95"
              >
                <div className="aspect-square rounded-xl bg-stone-50 flex items-center justify-center mb-2 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-stone-800 text-xs font-bold leading-tight line-clamp-2 min-h-[2rem]">{p.name}</p>
                <p className="text-amber-700 font-bold text-sm mt-1">{p.priceLabel}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order panel */}
      <div className="bg-white border-l border-stone-200 flex flex-col lg:h-full">
        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-800 mb-1">Sale complete</h3>
            <p className="text-stone-500 mb-4">Order <span className="font-mono font-bold tracking-widest text-amber-700">{done.code}</span> sent to the queue.</p>
            {done.change !== null && (
              <div className="bg-stone-50 rounded-2xl px-6 py-4 mb-6">
                <p className="text-stone-400 text-xs uppercase tracking-wide">Change due</p>
                <p className="text-3xl font-bold text-stone-900">{formatPrice(done.change)}</p>
              </div>
            )}
            <button onClick={reset} className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-8 rounded-full transition-all">
              New sale
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-stone-100">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'dine-in', label: 'Dine-in', icon: Utensils },
                  { key: 'takeout', label: 'Takeout', icon: ShoppingBag },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setOrderType(t.key)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        orderType === t.key ? 'bg-stone-800 text-white shadow' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <Icon size={16} /> {t.label}
                    </button>
                  );
                })}
              </div>
              {orderType === 'dine-in' && (
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="mt-2 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">No table / assign later</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id} disabled={t.status === 'occupied'}>
                      {t.label} · {t.seats} seats {t.status !== 'vacant' ? `(${t.status})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <ShoppingCart className="w-10 h-10 text-stone-200 mb-2" />
                  <p className="text-stone-400 text-sm">Tap items to add them to the order</p>
                </div>
              ) : (
                cart.map((i, idx) => (
                  <div key={`${i.product.id}-${i.size}`} className="flex gap-3">
                    <img src={i.product.image} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="text-stone-800 text-sm font-semibold leading-tight">{i.product.name}</p>
                        <button onClick={() => setQty(idx, -i.quantity)} className="text-stone-300 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {i.product.sizes && (
                        <div className="flex gap-1 mt-1">
                          {Object.keys(i.product.sizes).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setSize(idx, sz)}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                i.size === sz ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'
                              }`}
                            >
                              {sz[0]}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setQty(idx, -1)} className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200">
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{i.quantity}</span>
                          <button onClick={() => setQty(idx, 1)} className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200">
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-amber-700 font-bold text-sm">{formatPrice(lineUnit(i) * i.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & payment */}
            <div className="border-t border-stone-100 p-4 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Tax (12%)</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between text-stone-900 font-bold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="Cash received (optional)"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              {cash && Number(cash) >= total && (
                <div className="flex justify-between items-center bg-green-50 text-green-700 rounded-xl px-4 py-2 text-sm font-semibold">
                  <span>Change</span><span>{formatPrice(change)}</span>
                </div>
              )}

              <button
                onClick={charge}
                disabled={charging || cart.length === 0}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 rounded-full text-lg transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {charging ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard size={20} />}
                {charging ? 'Processing…' : `Charge ${formatPrice(total)}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
