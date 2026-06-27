import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShoppingBag, RefreshCw, Star } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../lib/api';
import { formatPrice } from '../data/products';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'completed'];
const STATUS_LABEL = {
  pending: 'Order received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatusBar({ status }) {
  if (status === 'cancelled') return null;
  const activeIndex = STATUS_STEPS.indexOf(status);
  const done = status === 'completed';
  return (
    <div className="flex items-end gap-1.5 mt-4">
      {STATUS_STEPS.map((s, i) => {
        const reached = i <= activeIndex;
        const isCurrent = i === activeIndex && !done;
        return (
          <div key={s} className="flex-1">
            <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  reached ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-transparent'
                } ${isCurrent ? 'animate-pulse' : ''}`}
                style={{ width: reached ? '100%' : '0%' }}
              />
            </div>
            <p className={`text-[10px] mt-1 transition-colors ${
              reached ? 'text-stone-700 font-semibold' : 'text-stone-400'
            }`}>
              {STATUS_LABEL[s]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// A labelled row of selectable stars.
function StarRow({ label, value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-stone-600 text-sm font-medium">{label}</span>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReadStars({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-stone-500 text-xs">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-4 h-4 ${i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
        ))}
      </div>
    </div>
  );
}

// Shown only on completed orders. Dimensions depend on the order type:
//  - delivery → rate the delivery service
//  - pickup   → rate the product and the service
function RatingBlock({ order, existing, user, onRated }) {
  const isDelivery = order.order_type === 'delivery';
  const [product, setProduct] = useState(0);
  const [service, setService] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (existing) {
    return (
      <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
        <p className="text-stone-500 text-xs mb-1 font-semibold">Your rating</p>
        {existing.product_rating || existing.service_rating || existing.delivery_rating ? (
          <>
            <ReadStars label="Product" value={existing.product_rating} />
            <ReadStars label="Service" value={existing.service_rating} />
            <ReadStars label="Delivery" value={existing.delivery_rating} />
          </>
        ) : (
          <ReadStars label="Overall" value={existing.rating} />
        )}
        {existing.comment && <p className="text-stone-500 text-sm mt-1 italic">&ldquo;{existing.comment}&rdquo;</p>}
      </div>
    );
  }

  const submit = async () => {
    if (isDelivery && !delivery) return toast.error('Please rate the delivery service');
    if (!isDelivery && (!product || !service)) return toast.error('Please rate the product and service');

    setSaving(true);
    const payload = {
      comment,
      customerName: order.customer_name,
      orderId: order.id,
      userId: user.id,
      ...(isDelivery
        ? { deliveryRating: delivery }
        : { productRating: product, serviceRating: service }),
    };
    const { error } = await submitFeedback(payload);
    setSaving(false);
    if (error) return toast.error(error);
    toast.success('Thanks for your rating!', {
      icon: '⭐',
      style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' },
    });
    onRated(order.id, {
      rating: 0,
      product_rating: isDelivery ? null : product,
      service_rating: isDelivery ? null : service,
      delivery_rating: isDelivery ? delivery : null,
      comment,
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-stone-100">
      <p className="text-stone-700 text-sm font-semibold mb-3">
        {isDelivery ? 'How was the delivery?' : 'How was your order?'}
      </p>
      <div className="space-y-2.5 mb-3">
        {isDelivery ? (
          <StarRow label="Delivery service" value={delivery} onChange={setDelivery} />
        ) : (
          <>
            <StarRow label="Product quality" value={product} onChange={setProduct} />
            <StarRow label="Service" value={service} onChange={setService} />
          </>
        )}
      </div>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)"
        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all text-sm mb-3"
      />
      <button
        onClick={submit}
        disabled={saving}
        className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm py-2.5 px-6 rounded-full transition-all disabled:opacity-60 inline-flex items-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit rating
      </button>
    </div>
  );
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({}); // order_id -> { rating, comment }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/account?redirect=/orders', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;
    setLoading(true);
    const [ordersRes, feedbackRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('feedback').select('order_id, rating, product_rating, service_rating, delivery_rating, comment'),
    ]);
    if (ordersRes.error) toast.error(ordersRes.error.message);
    else setOrders(ordersRes.data || []);

    const map = {};
    (feedbackRes.data || []).forEach((f) => {
      if (f.order_id) map[f.order_id] = f;
    });
    setRatings(map);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Live order updates — no manual refresh needed.
  const [live, setLive] = useState(false);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return undefined;
    const channel = supabase
      .channel('my-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            load();
            return;
          }
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            const prev = ordersRef.current.find((o) => o.id === updated.id);
            setOrders((list) =>
              list.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
            if (prev && prev.status !== updated.status) {
              toast.success(`Order ${updated.order_code} is now “${STATUS_LABEL[updated.status] || updated.status}”`, {
                icon: '🔔',
                style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' },
              });
            }
          }
        }
      )
      .subscribe((s) => setLive(s === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const markRated = (orderId, value) => {
    setRatings((prev) => ({ ...prev, [orderId]: value }));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-stone-800 text-4xl sm:text-5xl font-bold tracking-tight">My Orders</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-stone-500">{user.email}</p>
              {live && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Live
                </span>
              )}
            </div>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 font-semibold mb-1">No orders yet</p>
            <p className="text-stone-400 text-sm mb-6">When you place an order, it&apos;ll show up here.</p>
            <Link
              to="/menu"
              className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-8 rounded-full transition-all"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold tracking-[0.15em] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {o.order_code}
                    </span>
                    <p className="text-stone-400 text-xs mt-2">
                      {formatDate(o.created_at)} · <span className="capitalize">{o.order_type}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-700 font-bold text-lg">{formatPrice(o.total)}</p>
                    <span className={`inline-flex items-center gap-1.5 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || 'bg-stone-100 text-stone-600'}`}>
                      {['pending', 'preparing', 'ready'].includes(o.status) && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                        </span>
                      )}
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 mt-4 pt-3 space-y-1.5">
                  {(o.order_items || []).map((it) => (
                    <div key={it.id} className="flex justify-between text-sm text-stone-600">
                      <span>
                        {it.quantity}× {it.product_name}
                        {it.size ? <span className="text-stone-400"> ({it.size})</span> : null}
                      </span>
                      <span className="text-stone-500">{formatPrice(it.unit_price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <StatusBar status={o.status} />

                {o.status === 'completed' && (
                  <RatingBlock
                    order={o}
                    existing={ratings[o.id]}
                    user={user}
                    onRated={markRated}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
