import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, MessageSquare, Star, Coffee, LogOut, RefreshCw,
  Plus, Pencil, Trash2, X, Loader2, ExternalLink, Check, Search,
  LayoutDashboard, TrendingUp, Wallet, Clock, Award, ChevronRight,
  Menu, ArrowUpRight, ArrowDownRight, Flame, ArrowDown,
  Armchair, Plus as PlusIcon, Lock, Unlock,
  Users, UserPlus, ShieldCheck,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductsContext';
import { createStaffAccount, updateStaffRole } from '../../lib/api';
import { productImages, resolveImage, formatPrice } from '../../data/products';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Sales and performance at a glance' },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, desc: 'Manage the live order queue' },
  { key: 'floor', label: 'Floor Plan', icon: Armchair, desc: 'Dining-in tables and reservations' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, desc: 'Customer enquiries from the contact form' },
  { key: 'feedback', label: 'Feedback', icon: Star, desc: 'Ratings left after completed orders' },
  { key: 'products', label: 'Products', icon: Coffee, desc: 'Your menu items and availability' },
  { key: 'staff', label: 'Staff', icon: Users, desc: 'Team accounts and roles' },
];

// Short notification chime via Web Audio (no asset needed).
function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [880, 1175];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.27);
    });
  } catch {
    /* ignore audio errors */
  }
}

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const ACTIVE_STATUSES = ['pending', 'preparing', 'ready'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const isValidSale = (o) => o.status !== 'cancelled';
// Queue order: flagged-priority first, then oldest waiting first (FIFO).
function queueSort(a, b) {
  if (!!b.is_priority !== !!a.is_priority) return b.is_priority ? 1 : -1;
  return new Date(a.created_at) - new Date(b.created_at);
}
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function sameDay(a, b) { return startOfDay(a).getTime() === startOfDay(b).getTime(); }
// Compact peso label for big KPI numbers, e.g. ₱12,500
function peso(n) {
  return `₱${Math.round(Number(n) || 0).toLocaleString('en-PH')}`;
}

function SidebarContent({ tab, setTab, user, signOut, onNavigate, badges = {} }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-sm">Aroma Cafe</p>
          <p className="text-stone-400 text-[11px]">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); onNavigate?.(); }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-amber-400" />}
              <Icon size={18} /> {t.label}
              {badges[t.key] > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {badges[t.key] > 9 ? '9+' : badges[t.key]}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-200 flex items-center justify-center text-xs font-bold uppercase">
            {user?.email?.[0] || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-stone-300 text-xs truncate">{user?.email}</p>
            <p className="text-stone-500 text-[10px]">Administrator</p>
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

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [newOrders, setNewOrders] = useState(0);
  const [orderPing, setOrderPing] = useState(0); // bumped on new order → tabs reload
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const meta = TABS.find((t) => t.key === tab) || TABS[0];

  // Live "new order" alerts for staff: toast + chime + sidebar badge.
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const o = payload.new;
          setOrderPing((n) => n + 1);
          if (tabRef.current !== 'orders') setNewOrders((c) => c + 1);
          playChime();
          toast(
            `New order ${o.order_code} · ${peso(o.total)}`,
            { icon: '🛎️', duration: 6000, style: { background: '#422006', color: '#fde68a', border: '1px solid #92400e' } }
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const goTab = (key) => {
    setTab(key);
    if (key === 'orders') setNewOrders(0);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-stone-900 z-40">
        <SidebarContent tab={tab} setTab={goTab} user={user} signOut={signOut} badges={{ orders: newOrders }} />
      </aside>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} />
          <aside className="relative w-64 bg-stone-900 h-full">
            <button
              onClick={() => setMobileNav(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent
              tab={tab} setTab={goTab} user={user} signOut={signOut}
              onNavigate={() => setMobileNav(false)} badges={{ orders: newOrders }}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileNav(true)}
                className="lg:hidden text-stone-600 hover:text-stone-900 p-1 -ml-1"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-stone-900 font-bold text-xl leading-tight truncate">{meta.label}</h1>
                <p className="text-stone-400 text-xs truncate hidden sm:block">{meta.desc}</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-stone-100 transition-all"
            >
              <ExternalLink size={16} /> <span className="hidden sm:inline">View site</span>
            </Link>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {tab === 'overview' && <OverviewTab onJump={goTab} refreshSignal={orderPing} />}
          {tab === 'orders' && <OrdersTab refreshSignal={orderPing} />}
          {tab === 'floor' && <FloorTab />}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'feedback' && <FeedbackTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'staff' && <StaffTab />}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shared */
function Panel({ loading, empty, emptyText, children, onRefresh, title, count }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-stone-800 text-lg font-bold">
          {title}
          {typeof count === 'number' && (
            <span className="ml-2 text-stone-400 text-sm font-normal">({count})</span>
          )}
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      ) : empty ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-400">{emptyText}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- overview */
function Delta({ trend }) {
  if (!trend || trend.value === null) return null;
  const up = trend.value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
        up ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
      }`}
      title={trend.label}
    >
      <Icon size={12} /> {Math.abs(trend.value)}%
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent = 'amber', onClick, trend }) {
  const accents = {
    amber: 'from-amber-500 to-orange-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-fuchsia-600',
  };
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border border-stone-200 p-5 shadow-sm w-full ${
        onClick ? 'hover:border-amber-400 hover:shadow-md transition-all' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center shadow`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend ? <Delta trend={trend} /> : onClick && <ChevronRight className="w-4 h-4 text-stone-300" />}
      </div>
      <p className="text-stone-900 text-2xl font-bold leading-tight tracking-tight">{value}</p>
      <p className="text-stone-500 text-sm font-medium">{label}</p>
      {sub && <p className="text-stone-400 text-xs mt-1">{sub}</p>}
    </Wrapper>
  );
}

// % change vs a previous value; null when there's no baseline to compare to.
function pctDelta(current, previous) {
  if (!previous) return current > 0 ? { value: 100, label: 'vs previous' } : { value: null };
  return { value: Math.round(((current - previous) / previous) * 100), label: 'vs previous' };
}

// Professional SVG area chart — gradient fill, gridlines, hover tooltip.
function RevenueChart({ series }) {
  const [active, setActive] = useState(null);
  const W = 720;
  const H = 240;
  const padX = 16;
  const padTop = 24;
  const padBottom = 34;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const n = series.length;

  const xAt = (i) => padX + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const yAt = (v) => padTop + plotH * (1 - v / max);
  const points = series.map((d, i) => ({ x: xAt(i), y: yAt(d.revenue), ...d }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[n - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => padTop + plotH * t);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {gridYs.map((y, i) => (
          <line key={i} x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* area + line */}
        <path d={areaPath} fill="url(#revFill)" />
        <path d={linePath} fill="none" stroke="url(#revLine)" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* active guide + points */}
        {points.map((p, i) => (
          <g key={i}>
            {active === i && (
              <line x1={p.x} y1={padTop} x2={p.x} y2={padTop + plotH} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 4" />
            )}
            <circle cx={p.x} cy={p.y} r={active === i ? 6 : 4}
              fill="#fff" stroke="#ea580c" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <text x={p.x} y={H - 12} textAnchor="middle" className="fill-stone-400" fontSize="12">
              {p.label}
            </text>
            {/* hover hit area */}
            <rect
              x={p.x - plotW / (2 * (n - 1 || 1))} y={0}
              width={plotW / (n - 1 || 1)} height={H}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          </g>
        ))}
      </svg>

      {active !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none bg-stone-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{
            left: `${(points[active].x / W) * 100}%`,
            top: `${(points[active].y / H) * 100 - 4}%`,
          }}
        >
          <span className="text-stone-400">{points[active].label}: </span>
          <span className="font-bold">{peso(points[active].revenue)}</span>
        </div>
      )}
    </div>
  );
}

function DonutChart({ data, centerValue, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 60, cx = 80, cy = 80, sw = 22;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="w-32 h-32 flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {total > 0 && data.map((d, i) => {
          const len = (d.value / total) * C;
          const seg = (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          acc += len;
          return seg;
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-stone-900" fontSize="22" fontWeight="700">
          {centerValue}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-stone-400" fontSize="11">
          {centerLabel}
        </text>
      </svg>
      <div className="flex-1 space-y-2 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-stone-600 flex-1 truncate">{d.label}</span>
            <span className="text-stone-800 font-semibold">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoursBars({ hours }) {
  const max = Math.max(...hours.map((h) => h.count), 1);
  const fmt = (h) => (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`);
  return (
    <div className="flex items-end gap-1 h-40">
      {hours.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${fmt(h.hour)} · ${h.count} order${h.count === 1 ? '' : 's'}`}>
          <div
            className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-md transition-all hover:from-amber-600 hover:to-orange-500"
            style={{ height: `${(h.count / max) * 100}%`, minHeight: h.count ? '6px' : '2px', opacity: h.count ? 1 : 0.4 }}
          />
          <span className="text-[9px] text-stone-400 mt-1">{i % 3 === 0 ? fmt(h.hour) : ''}</span>
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ onJump, refreshSignal }) {
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersRes, fbRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('feedback').select('rating'),
    ]);
    if (ordersRes.error) toast.error(ordersRes.error.message);
    else setOrders(ordersRes.data || []);
    setRatings(fbRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (refreshSignal) load(); }, [refreshSignal, load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const valid = orders.filter(isValidSale);
  const todayOrders = valid.filter((o) => sameDay(o.created_at, now));
  const revenueToday = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const totalRevenue = valid.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = valid.length ? totalRevenue / valid.length : 0;

  // Yesterday baseline for the "today" trend.
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayOrders = valid.filter((o) => sameDay(o.created_at, yesterday));
  const revenueYesterday = yesterdayOrders.reduce((s, o) => s + Number(o.total), 0);

  // Last 7 days revenue series.
  const series = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const revenue = valid
      .filter((o) => sameDay(o.created_at, d))
      .reduce((s, o) => s + Number(o.total), 0);
    return { label: d.toLocaleDateString('en-PH', { weekday: 'short' }), revenue };
  });
  const weekRevenue = series.reduce((s, d) => s + d.revenue, 0);

  // Previous 7 days (days -13..-7) for the week-over-week trend.
  const prevWeekRevenue = valid
    .filter((o) => {
      const diffDays = (startOfDay(now) - startOfDay(o.created_at)) / 86400000;
      return diffDays >= 7 && diffDays < 14;
    })
    .reduce((s, o) => s + Number(o.total), 0);

  const monthRevenue = valid
    .filter((o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + Number(o.total), 0);

  // Top sellers by quantity across all valid orders.
  const productMap = {};
  valid.forEach((o) => (o.order_items || []).forEach((it) => {
    const key = it.product_name;
    if (!productMap[key]) productMap[key] = { name: key, qty: 0, revenue: 0 };
    productMap[key].qty += it.quantity;
    productMap[key].revenue += it.unit_price * it.quantity;
  }));
  const topSellers = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const avgRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : '—';

  // Sales by menu category (resolve each line item's category from products).
  const catOf = {};
  products.forEach((p) => { catOf[p.id] = p.category; });
  const CAT_META = {
    hot: { label: 'Hot Coffee', color: '#d97706' },
    frappe: { label: 'Frappe', color: '#f97316' },
    pastry: { label: 'Pastry', color: '#fb7185' },
    other: { label: 'Other', color: '#a8a29e' },
  };
  const catTotals = {};
  valid.forEach((o) => (o.order_items || []).forEach((it) => {
    const c = catOf[it.product_id] || 'other';
    catTotals[c] = (catTotals[c] || 0) + it.unit_price * it.quantity;
  }));
  const categoryData = Object.entries(catTotals)
    .map(([k, v]) => ({ label: CAT_META[k]?.label || k, value: v, color: CAT_META[k]?.color || '#a8a29e' }))
    .sort((a, b) => b.value - a.value);

  // Pickup vs delivery (by order count).
  const typeCounts = { pickup: 0, delivery: 0 };
  valid.forEach((o) => { typeCounts[o.order_type] = (typeCounts[o.order_type] || 0) + 1; });
  const orderTypeData = [
    { label: 'Pickup', value: typeCounts.pickup, color: '#0d9488' },
    { label: 'Delivery', value: typeCounts.delivery, color: '#6366f1' },
  ];

  // Busiest hours (cafe window 7am–10pm).
  const hourCounts = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  valid.forEach((o) => { hourCounts[new Date(o.created_at).getHours()].count += 1; });
  const hours = hourCounts.slice(7, 23);

  // Order status breakdown (all orders).
  const STATUS_HEX = {
    pending: '#f59e0b', preparing: '#3b82f6', ready: '#a855f7',
    completed: '#22c55e', cancelled: '#ef4444',
  };
  const statusCounts = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-stone-800 text-lg font-bold">
          Today · {now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white transition-all"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet} accent="green"
          label="Sales today" value={peso(revenueToday)}
          sub={`${todayOrders.length} order${todayOrders.length === 1 ? '' : 's'} · vs ${peso(revenueYesterday)} yesterday`}
          trend={pctDelta(revenueToday, revenueYesterday)}
        />
        <StatCard
          icon={Clock} accent="amber"
          label="Active now" value={active.length}
          sub="Tap to manage queue"
          onClick={() => onJump('orders')}
        />
        <StatCard
          icon={TrendingUp} accent="blue"
          label="Last 7 days" value={peso(weekRevenue)}
          sub={`This month: ${peso(monthRevenue)}`}
          trend={pctDelta(weekRevenue, prevWeekRevenue)}
        />
        <StatCard
          icon={Award} accent="purple"
          label="Avg order value" value={peso(avgOrder)}
          sub={`Avg rating: ${avgRating} ★`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-day revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-stone-800 font-bold">Revenue</h3>
            <span className="text-stone-400 text-sm">Last 7 days</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 tracking-tight mb-4">{peso(weekRevenue)}</p>
          <RevenueChart series={series} />
        </div>

        {/* Top sellers */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="text-stone-800 font-bold mb-4">Top sellers</h3>
          {topSellers.length === 0 ? (
            <p className="text-stone-400 text-sm">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topSellers.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-700 text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-stone-400 text-xs">{p.qty} sold · {peso(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2: category mix + busiest hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="text-stone-800 font-bold mb-4">Sales by category</h3>
          {categoryData.length === 0 ? (
            <p className="text-stone-400 text-sm">No sales yet.</p>
          ) : (
            <DonutChart data={categoryData} centerValue={categoryData.length} centerLabel="categories" />
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-800 font-bold">Busiest hours</h3>
            <span className="text-stone-400 text-sm">Orders by time of day</span>
          </div>
          <HoursBars hours={hours} />
        </div>
      </div>

      {/* Charts row 3: order type + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="text-stone-800 font-bold mb-4">Order type</h3>
          <DonutChart
            data={orderTypeData}
            centerValue={typeCounts.pickup + typeCounts.delivery}
            centerLabel="orders"
          />
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="text-stone-800 font-bold mb-4">Order status breakdown</h3>
          <div className="space-y-3">
            {ORDER_STATUSES.map((s) => {
              const c = statusCounts[s] || 0;
              const pct = orders.length ? (c / orders.length) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-stone-600 font-medium">{s}</span>
                    <span className="text-stone-500 font-semibold">{c}</span>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: STATUS_HEX[s] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active queue preview */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-800 font-bold">Orders to prepare</h3>
          <button
            onClick={() => onJump('orders')}
            className="text-amber-700 text-sm font-semibold hover:underline inline-flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        {active.length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">All caught up — no active orders. 🎉</p>
        ) : (
          <div className="space-y-2">
            {[...active].sort(queueSort).slice(0, 6).map((o, i) => (
              <div key={o.id} className="flex items-center justify-between gap-3 py-2 border-b border-stone-50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    o.is_priority ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {o.order_code}
                  </span>
                  {o.is_priority && <Flame size={13} className="text-amber-500 flex-shrink-0" />}
                  <span className="text-stone-700 text-sm truncate">{o.customer_name}</span>
                  <span className="text-stone-400 text-xs hidden sm:inline">
                    {(o.order_items || []).reduce((s, it) => s + it.quantity, 0)} items
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-stone-600 text-sm font-semibold">{peso(o.total)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ orders */
export function OrdersTab({ refreshSignal }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (refreshSignal) load(); }, [refreshSignal, load]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order marked ${status}`);
  };

  const togglePriority = async (id, value) => {
    const { error } = await supabase.from('orders').update({ is_priority: value }).eq('id', id);
    if (error) return toast.error(error.message);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, is_priority: value } : o)));
    toast.success(value ? 'Bumped to front of queue' : 'Removed from priority');
  };

  const isQueue = statusFilter === 'active';
  const q = query.trim().toLowerCase();
  const byStatus = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ACTIVE_STATUSES.includes(o.status);
    return o.status === statusFilter;
  });
  const searched = q
    ? byStatus.filter(
        (o) =>
          o.order_code?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.phone?.toLowerCase().includes(q)
      )
    : byStatus;
  // In the active "queue" view, line up by priority then oldest-first.
  const filtered = isQueue ? [...searched].sort(queueSort) : searched;

  const FILTERS = [
    { key: 'active', label: 'Active', count: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length },
    { key: 'all', label: 'All', count: orders.length },
    ...ORDER_STATUSES.map((s) => ({ key: s, label: s, count: orders.filter((o) => o.status === s).length })),
  ];

  return (
    <Panel
      title="Orders"
      count={filtered.length}
      loading={loading}
      empty={orders.length === 0}
      emptyText="No orders yet."
      onRefresh={load}
    >
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
              statusFilter === f.key
                ? 'bg-stone-800 text-white shadow'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400'
            }`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              statusFilter === f.key ? 'bg-white/20' : 'bg-stone-100 text-stone-500'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order code, name, or phone…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-400">
            {q ? `No orders match “${query}”.` : 'No orders in this view.'}
          </p>
        </div>
      ) : (
      <div className="space-y-4">
        {filtered.map((o, idx) => (
          <div
            key={o.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
              o.is_priority && isQueue ? 'border-amber-300 ring-1 ring-amber-200' : 'border-stone-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                {isQueue && (
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    o.is_priority ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {idx + 1}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold tracking-[0.15em] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {o.order_code}
                    </span>
                    {o.is_priority && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        <Flame size={11} /> Priority
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-stone-800">{o.customer_name}</p>
                  <p className="text-stone-400 text-sm">
                    {o.phone}{o.email ? ` · ${o.email}` : ''}
                  </p>
                  <p className="text-stone-400 text-xs mt-1">
                    {formatDate(o.created_at)} · <span className="capitalize">{o.order_type}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-700 font-bold text-lg">{formatPrice(o.total)}</p>
                <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[o.status] || 'bg-stone-100 text-stone-600'}`}>
                  {o.status}
                </span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3 space-y-1.5 mb-3">
              {(o.order_items || []).map((it) => (
                <div key={it.id} className="flex justify-between text-sm text-stone-600">
                  <span>
                    {it.quantity}× {it.product_name}
                    {it.size ? <span className="text-stone-400"> ({it.size})</span> : null}
                    {it.notes ? <span className="text-stone-400 italic"> — {it.notes}</span> : null}
                  </span>
                  <span className="text-stone-500">{formatPrice(it.unit_price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(o.id, s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all ${
                    o.status === s
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
              {ACTIVE_STATUSES.includes(o.status) && (
                <button
                  onClick={() => togglePriority(o.id, !o.is_priority)}
                  className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    o.is_priority
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-stone-100 text-stone-500 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                  title={o.is_priority ? 'Remove priority' : 'Bump to front of queue'}
                >
                  {o.is_priority ? <ArrowDown size={13} /> : <Flame size={13} />}
                  {o.is_priority ? 'Unprioritize' : 'Prioritize'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------------------- messages */
function MessagesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
  };

  return (
    <Panel
      title="Contact Messages"
      count={items.length}
      loading={loading}
      empty={items.length === 0}
      emptyText="No messages yet."
      onRefresh={load}
    >
      <div className="space-y-4">
        {items.map((m) => (
          <div
            key={m.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm ${m.is_read ? 'border-stone-200' : 'border-amber-300'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-bold text-stone-800">
                  {m.name}
                  {!m.is_read && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">New</span>
                  )}
                </p>
                <a href={`mailto:${m.email}`} className="text-amber-700 text-sm hover:underline">{m.email}</a>
              </div>
              <p className="text-stone-400 text-xs">{formatDate(m.created_at)}</p>
            </div>
            {m.subject && <p className="text-stone-700 font-semibold text-sm mb-1">{m.subject}</p>}
            <p className="text-stone-600 text-sm whitespace-pre-wrap">{m.message}</p>
            {!m.is_read && (
              <button
                onClick={() => markRead(m.id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-green-700 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-green-50 transition-all"
              >
                <Check size={14} /> Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------- feedback */
function FeedbackTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const avgOf = (key) => {
    const vals = items.map((f) => f[key]).filter(Boolean);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : null;
  };
  const avg = avgOf('rating');
  const avgProduct = avgOf('product_rating');
  const avgService = avgOf('service_rating');
  const avgDelivery = avgOf('delivery_rating');

  const MiniStat = ({ label, value }) => (
    <div className="bg-stone-50 rounded-xl px-4 py-3 text-center">
      <p className="text-xl font-bold text-stone-800">{value ?? '—'}<span className="text-amber-500"> ★</span></p>
      <p className="text-stone-400 text-xs">{label}</p>
    </div>
  );

  return (
    <Panel
      title="Customer Feedback"
      count={items.length}
      loading={loading}
      empty={items.length === 0}
      emptyText="No feedback yet."
      onRefresh={load}
    >
      {avg && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-amber-700">{avg}</div>
            <div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-5 h-5 ${i <= Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
                ))}
              </div>
              <p className="text-stone-400 text-sm mt-1">Overall · {items.length} reviews</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Product" value={avgProduct} />
            <MiniStat label="Service" value={avgService} />
            <MiniStat label="Delivery" value={avgDelivery} />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
                ))}
              </div>
              <p className="text-stone-400 text-xs">{formatDate(f.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {f.product_rating ? <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Product {f.product_rating}★</span> : null}
              {f.service_rating ? <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Service {f.service_rating}★</span> : null}
              {f.delivery_rating ? <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Delivery {f.delivery_rating}★</span> : null}
            </div>
            {f.comment && <p className="text-stone-600 text-sm mb-2">&ldquo;{f.comment}&rdquo;</p>}
            <p className="text-stone-400 text-xs">{f.customer_name || 'Anonymous'}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- floor plan */
const TABLE_STATUS_STYLE = {
  vacant: 'bg-green-100 border-green-400 text-green-800',
  reserved: 'bg-amber-100 border-amber-400 text-amber-800',
  occupied: 'bg-red-100 border-red-400 text-red-800',
};
const KIND_PRESETS = [
  { kind: 'table', shape: 'round', label: 'Round table' },
  { kind: 'table', shape: 'square', label: 'Square table' },
  { kind: 'table', shape: 'rect', label: 'Long table' },
  { kind: 'chair', shape: 'square', label: 'Chair' },
  { kind: 'counter', shape: 'rect', label: 'Counter' },
  { kind: 'plant', shape: 'round', label: 'Plant' },
  { kind: 'door', shape: 'rect', label: 'Door' },
];

function sizeFor(item) {
  if (item.kind === 'table') {
    if (item.shape === 'rect') return { w: 112, h: 64, radius: '1rem' };
    return { w: 74, h: 74, radius: item.shape === 'round' ? '9999px' : '1rem' };
  }
  if (item.kind === 'chair') return { w: 30, h: 30, radius: '0.4rem' };
  if (item.kind === 'counter') return { w: 150, h: 40, radius: '0.5rem' };
  if (item.kind === 'plant') return { w: 38, h: 38, radius: '9999px' };
  if (item.kind === 'door') return { w: 54, h: 16, radius: '0.3rem' };
  return { w: 60, h: 60, radius: '0.5rem' };
}

export function FloorTab({ canEdit = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [locked, setLocked] = useState(false);
  const canvasRef = useRef(null);
  const drag = useRef(null);
  const noDrag = locked || !canEdit;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('cafe_tables').select('*').order('created_at');
    if (error) toast.error(error.message);
    else setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selected = items.find((i) => i.id === selectedId) || null;
  const tables = items.filter((i) => i.kind === 'table');
  const counts = {
    vacant: tables.filter((t) => t.status === 'vacant').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
  };

  const addItem = async (preset) => {
    const tableNo = items.filter((i) => i.kind === 'table').length + 1;
    const row = {
      kind: preset.kind,
      shape: preset.shape,
      label: preset.kind === 'table' ? `T${tableNo}` : '',
      x: 45 + (Math.random() * 10 - 5),
      y: 45 + (Math.random() * 10 - 5),
      seats: preset.kind === 'table' ? (preset.shape === 'rect' ? 6 : 4) : 0,
      status: 'vacant',
    };
    const { data, error } = await supabase.from('cafe_tables').insert(row).select().single();
    if (error) return toast.error(error.message);
    setItems((prev) => [...prev, data]);
    setSelectedId(data.id);
  };

  const updateItem = async (id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const { error } = await supabase.from('cafe_tables').update(patch).eq('id', id);
    if (error) toast.error(error.message);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Remove this item from the floor?')) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedId(null);
    const { error } = await supabase.from('cafe_tables').delete().eq('id', id);
    if (error) toast.error(error.message);
  };

  // --- dragging ---
  const onPointerDown = (e, item) => {
    setSelectedId(item.id);
    if (noDrag) return;
    e.preventDefault();
    drag.current = {
      id: item.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: item.x,
      startY: item.y,
      moved: false,
    };
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.current.startClientX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.current.startClientY) / rect.height) * 100;
    if (Math.abs(dxPct) > 0.3 || Math.abs(dyPct) > 0.3) drag.current.moved = true;
    const nx = Math.min(98, Math.max(2, drag.current.startX + dxPct));
    const ny = Math.min(96, Math.max(2, drag.current.startY + dyPct));
    setItems((prev) => prev.map((i) => (i.id === drag.current.id ? { ...i, x: nx, y: ny } : i)));
  };

  const onPointerUp = () => {
    if (drag.current && drag.current.moved) {
      const moved = items.find((i) => i.id === drag.current.id);
      if (moved) updateItem(moved.id, { x: moved.x, y: moved.y });
    }
    drag.current = null;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {canEdit && KIND_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => addItem(p)}
            className="inline-flex items-center gap-1.5 bg-white border border-stone-200 hover:border-amber-400 text-stone-700 text-xs font-semibold px-3 py-2 rounded-full transition-all"
          >
            <PlusIcon size={14} /> {p.label}
          </button>
        ))}
        {canEdit && (
          <button
            onClick={() => setLocked((l) => !l)}
            className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-all ${
              locked ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400'
            }`}
            title={locked ? 'Unlock to rearrange' : 'Lock layout (monitor mode)'}
          >
            {locked ? <Lock size={14} /> : <Unlock size={14} />}
            {locked ? 'Locked' : 'Editing'}
          </button>
        )}
        <button
          onClick={load}
          className={`inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-xs font-semibold px-3 py-2 rounded-full hover:bg-white transition-all ${canEdit ? '' : 'ml-auto'}`}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400" /> Vacant <b className="text-stone-700">{counts.vacant}</b></span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> Reserved <b className="text-stone-700">{counts.reserved}</b></span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400" /> Occupied <b className="text-stone-700">{counts.occupied}</b></span>
        <span className="text-stone-400 ml-auto hidden sm:block">
          {noDrag ? 'Tap a table to manage it' : 'Drag to arrange · tap to manage'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Canvas */}
        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
          className="relative h-[560px] rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden select-none touch-none"
          style={{
            backgroundImage:
              'linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <Armchair className="w-12 h-12 text-stone-300 mb-3" />
              <p className="text-stone-500 font-semibold">Your floor is empty</p>
              <p className="text-stone-400 text-sm">Add tables and chairs from the toolbar, then drag them to match your shop.</p>
            </div>
          ) : (
            items.map((item) => {
              const s = sizeFor(item);
              const isTable = item.kind === 'table';
              const base = isTable
                ? TABLE_STATUS_STYLE[item.status]
                : item.kind === 'plant'
                ? 'bg-emerald-200 border-emerald-400 text-emerald-800'
                : item.kind === 'counter'
                ? 'bg-stone-300 border-stone-400 text-stone-700'
                : item.kind === 'door'
                ? 'bg-amber-700/70 border-amber-800'
                : 'bg-stone-200 border-stone-300 text-stone-600';
              return (
                <div
                  key={item.id}
                  onPointerDown={(e) => onPointerDown(e, item)}
                  className={`absolute flex flex-col items-center justify-center border-2 shadow-sm ${base} ${
                    selectedId === item.id ? 'ring-2 ring-offset-2 ring-stone-800 z-10' : ''
                  } ${noDrag ? 'cursor-pointer' : 'cursor-move'}`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: s.w,
                    height: s.h,
                    borderRadius: s.radius,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={item.label}
                >
                  {item.label && <span className="text-xs font-bold leading-none">{item.label}</span>}
                  {isTable && <span className="text-[10px] leading-none mt-0.5 opacity-80">{item.seats} seats</span>}
                </div>
              );
            })
          )}
        </div>

        {/* Side panel */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm h-fit">
          {!selected ? (
            <div className="text-center py-8">
              <Armchair className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">
                {canEdit ? 'Select an item to edit it, or add one from the toolbar.' : 'Select a table to set its status.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-800">{selected.label || selected.kind}</h3>
                  {selected.kind === 'table' && (
                    <p className="text-stone-400 text-xs capitalize">{selected.seats} seats · {selected.shape}</p>
                  )}
                </div>
                {canEdit && (
                  <button onClick={() => deleteItem(selected.id)} className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-100" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {canEdit && (
                <div>
                  <label className="text-stone-600 text-xs font-semibold block mb-1">Label</label>
                  <input
                    value={selected.label || ''}
                    onChange={(e) => updateItem(selected.id, { label: e.target.value })}
                    placeholder="e.g. T1"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {selected.kind === 'table' && (
                <>
                  {canEdit && (
                    <div>
                      <label className="text-stone-600 text-xs font-semibold block mb-1">Seats</label>
                      <input
                        type="number" min="1"
                        value={selected.seats}
                        onChange={(e) => updateItem(selected.id, { seats: Number(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-stone-600 text-xs font-semibold block mb-1.5">Status</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['vacant', 'reserved', 'occupied'].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateItem(selected.id, { status: st, ...(st !== 'reserved' ? { reserved_name: null } : {}) })}
                          className={`text-xs font-semibold py-2 rounded-lg capitalize transition-all border ${
                            selected.status === st ? TABLE_STATUS_STYLE[st] : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selected.status === 'reserved' && (
                    <div>
                      <label className="text-stone-600 text-xs font-semibold block mb-1">Reserved for</label>
                      <input
                        value={selected.reserved_name || ''}
                        onChange={(e) => updateItem(selected.id, { reserved_name: e.target.value })}
                        placeholder="Guest name"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {canEdit && (
                    <div>
                      <label className="text-stone-600 text-xs font-semibold block mb-1.5">Shape</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['round', 'square', 'rect'].map((sh) => (
                          <button
                            key={sh}
                            onClick={() => updateItem(selected.id, { shape: sh })}
                            className={`text-xs font-semibold py-2 rounded-lg capitalize transition-all border ${
                              selected.shape === sh ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400'
                            }`}
                          >
                            {sh}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ staff */
const ROLE_STYLE = {
  admin: 'bg-purple-100 text-purple-700',
  employee: 'bg-blue-100 text-blue-700',
  customer: 'bg-stone-100 text-stone-500',
};

function StaffTab() {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', role: 'employee' });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .in('role', ['admin', 'employee'])
      .order('created_at');
    if (error) toast.error(error.message);
    else setPeople(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Email and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setCreating(true);
    const { error } = await createStaffAccount(form);
    setCreating(false);
    if (error) return toast.error(error, { duration: 6000 });
    toast.success(`${form.role === 'admin' ? 'Admin' : 'Employee'} account ready`);
    setForm({ email: '', password: '', role: 'employee' });
    load();
  };

  const changeRole = async (p, role) => {
    const { error } = await updateStaffRole(p.id, role);
    if (error) return toast.error(error);
    toast.success(role === 'customer' ? 'Access revoked' : `Now ${role}`);
    load();
  };

  return (
    <Panel
      title="Staff"
      count={people.length}
      loading={loading}
      empty={false}
      onRefresh={load}
    >
      {/* Add staff */}
      <form onSubmit={create} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm mb-5">
        <h3 className="font-bold text-stone-800 mb-1 flex items-center gap-2"><UserPlus size={18} /> Add a staff member</h3>
        <p className="text-stone-400 text-sm mb-4">Creates their login and assigns the role. Share the password with them.</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3">
          <input
            type="email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
          />
          <input
            type="text" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Temporary password"
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit" disabled={creating}
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusIcon size={16} />}
            Add
          </button>
        </div>
      </form>

      {/* Staff list */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3">Member</th>
                <th className="text-left font-semibold px-3 py-3">Role</th>
                <th className="text-right font-semibold px-5 py-3">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {people.map((p) => {
                const isSelf = user?.email === p.email;
                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-bold uppercase">
                          {p.email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{p.email}{isSelf && <span className="text-stone-400 font-normal"> (you)</span>}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLE[p.role]}`}>
                        {p.role === 'admin' && <ShieldCheck size={12} />} {p.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isSelf ? (
                        <span className="text-stone-300 text-xs block text-right">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {p.role !== 'employee' && (
                            <button onClick={() => changeRole(p, 'employee')} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                              Make employee
                            </button>
                          )}
                          {p.role !== 'admin' && (
                            <button onClick={() => changeRole(p, 'admin')} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
                              Make admin
                            </button>
                          )}
                          <button onClick={() => changeRole(p, 'customer')} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all">
                            Revoke
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {people.length === 0 && (
                <tr><td colSpan={3} className="text-center text-stone-400 py-10">No staff yet — add your first above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------- products */
const EMPTY_PRODUCT = {
  id: '', name: '', price: '', category: 'hot', description: '',
  image_key: 'cappuccino', color: 'from-amber-700 to-yellow-600', rank: 0,
  hasSizes: true,
};

const PRODUCT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'hot', label: 'Hot Coffee' },
  { key: 'frappe', label: 'Frappe' },
  { key: 'pastry', label: 'Pastry' },
  { key: 'available', label: 'Available' },
  { key: 'hidden', label: 'Hidden' },
];

function ProductsTab() {
  const { products, refresh, loading } = useProducts();
  const [editing, setEditing] = useState(null); // product object or EMPTY_PRODUCT
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Product deleted');
    refresh();
  };

  const toggleAvailable = async (p) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !p.isAvailable })
      .eq('id', p.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const q = query.trim().toLowerCase();
  const shown = products.filter((p) => {
    if (filter === 'available' && !p.isAvailable) return false;
    if (filter === 'hidden' && p.isAvailable) return false;
    if (['hot', 'frappe', 'pastry'].includes(filter) && p.category !== filter) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <Panel
      title="Products"
      count={shown.length}
      loading={loading}
      empty={false}
      onRefresh={refresh}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <button
          onClick={() => setEditing({ ...EMPTY_PRODUCT })}
          className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-all shadow shrink-0"
        >
          <Plus size={16} /> Add product
        </button>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {PRODUCT_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-stone-800 text-white shadow'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-400">No products match this filter.</p>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3">Product</th>
                <th className="text-left font-semibold px-3 py-3">Category</th>
                <th className="text-right font-semibold px-3 py-3">Price</th>
                <th className="text-center font-semibold px-3 py-3">Status</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {shown.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-11 h-11 object-contain flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 leading-tight">{p.name}</p>
                        <p className="text-stone-400 text-xs truncate max-w-[280px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full capitalize">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-amber-700 whitespace-nowrap">
                    {p.priceLabel}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => toggleAvailable(p)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all ${
                        p.isAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {p.isAvailable ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing({
                          id: p.id, name: p.name, price: p.price, category: p.category,
                          description: p.description, image_key: p.imageKey || 'cappuccino',
                          color: p.color, rank: p.rank, hasSizes: Boolean(p.sizes), _isEdit: true,
                        })}
                        className="text-stone-400 hover:text-amber-700 p-1.5 rounded-lg hover:bg-stone-100 transition-all"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(p.id, p.name)}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-100 transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {editing && (
        <ProductModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </Panel>
  );
}

function ProductModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial._isEdit);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name || form.price === '') {
      toast.error('ID, name and price are required');
      return;
    }
    setSaving(true);
    const row = {
      id: form.id.trim(),
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      image_key: form.image_key,
      color: form.color,
      rank: Number(form.rank) || 0,
      sizes: form.hasSizes ? { Small: 0, Medium: 30, Large: 50 } : null,
    };
    const { error } = await supabase.from('products').upsert(row);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isEdit ? 'Product updated' : 'Product added');
    onSaved();
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all text-sm';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="font-bold text-stone-800 text-lg">{isEdit ? 'Edit product' : 'Add product'}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-600 text-xs font-semibold block mb-1">ID (slug)</label>
              <input
                value={form.id}
                onChange={(e) => set('id', e.target.value)}
                placeholder="coffee-6"
                disabled={isEdit}
                className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="text-stone-600 text-xs font-semibold block mb-1">Rank</label>
              <input type="number" value={form.rank} onChange={(e) => set('rank', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-stone-600 text-xs font-semibold block mb-1">Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="ICED LATTE" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-600 text-xs font-semibold block mb-1">Price (₱)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-stone-600 text-xs font-semibold block mb-1">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                <option value="hot">Hot Coffee</option>
                <option value="frappe">Frappe</option>
                <option value="pastry">Pastry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-stone-600 text-xs font-semibold block mb-1">Image</label>
            <div className="flex items-center gap-3">
              <img src={resolveImage(form.image_key)} alt="" className="w-12 h-12 object-contain" />
              <select value={form.image_key} onChange={(e) => set('image_key', e.target.value)} className={inputCls}>
                {Object.keys(productImages).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-stone-600 text-xs font-semibold block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="text-stone-600 text-xs font-semibold block mb-1">Badge gradient (Tailwind classes)</label>
            <input value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="from-amber-700 to-yellow-600" className={inputCls} />
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={form.hasSizes} onChange={(e) => set('hasSizes', e.target.checked)} className="accent-amber-600 w-4 h-4" />
            Offer sizes (Small / Medium / Large)
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-full font-bold text-white bg-stone-800 hover:bg-stone-900 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
