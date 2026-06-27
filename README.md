# ☕ Aroma Cafe

A full-stack web app for a coffee shop — a customer-facing storefront for online
ordering **plus** a complete back-of-house management suite (admin dashboard,
employee POS, and a dine-in floor-plan / reservation system). Built with **React +
Vite** on the front end and **Supabase** (PostgreSQL, Auth, Row-Level Security, and
Realtime) as the backend.

---

## 📖 What is this project?

Aroma Cafe digitises everything a small cafe needs in one app, for three kinds of users:

| Who          | Where         | What they do                                                                 |
| ------------ | ------------- | ---------------------------------------------------------------------------- |
| **Customer** | `/`           | Browse the menu, add to cart, sign up, order (pickup/delivery), track orders live, rate completed orders, send messages. |
| **Employee** | `/#/staff`    | Take counter orders on a **POS**, work the live order queue, and manage dine-in **table reservations** (status only). |
| **Admin**    | `/#/admin`    | A full dashboard: sales analytics, order queue with priority, product CRUD, floor-plan editor, customer messages, feedback, and **staff management**. |

Everything is backed by a single Supabase project, and access is controlled per role
using Postgres Row-Level Security (RLS) — the browser only ever uses the safe public
("anon") key.

---

## ✨ Features

### Customer storefront
- Animated landing page, menu with search & category filters, product detail with sizes.
- Cart with persistent state; **checkout requires an account**.
- **Order tracking** two ways: a live **"My Orders"** history (real-time status, no refresh) and a guest **code + phone** lookup at `/#/track`.
- **Post-order ratings** that adapt to the order type (product + service for pickup, delivery service for delivery).
- Contact form that lands in the admin inbox.

### Employee POS (`/#/staff`)
- Tap-to-add menu grid, **dine-in / takeout** toggle, table assignment, cash & change calculation, one-tap charge.
- Live order queue and a **read-only floor plan** (set table vacant/reserved/occupied, but can't edit the layout).

### Admin dashboard (`/#/admin`)
- **Overview**: KPI cards with day-over-day trends, a revenue area chart, sales-by-category & order-type donuts, busiest-hours and order-status breakdowns, plus a live "orders to prepare" queue.
- **Orders**: status-filtered **priority queue** (FIFO + bump-to-front), search, new-order **chime + toast + badge** in real time.
- **Floor Plan**: drag-and-drop editor to build the dining room (tables, chairs, counter, etc.).
- **Products / Messages / Feedback / Staff** management.

---

## 🧱 Tech stack

| Layer        | Technology                                                            |
| ------------ | -------------------------------------------------------------------- |
| UI           | React 19, React Router (HashRouter), Tailwind CSS, lucide-react, Swiper |
| Build        | Vite                                                                 |
| Backend      | Supabase — PostgreSQL, Auth, Row-Level Security, Realtime            |
| Notifications| react-hot-toast                                                     |
| Hosting      | Static SPA (e.g. GitHub Pages); Supabase is fully managed           |

---

## 🏗️ System architecture

```
                         ┌──────────────────────────────────────────────┐
                         │                  BROWSER (SPA)                 │
                         │            React + Vite + Tailwind             │
                         │                                                │
   Customer  ───────────▶│  Storefront   Auth/Cart    My Orders / Track  │
   Employee  ───────────▶│  POS          Orders       Reservations       │
   Admin     ───────────▶│  Dashboard    Floor Plan   Products / Staff   │
                         │                                                │
                         │  Context: Auth · Products · Cart               │
                         │  lib/supabase.js  ·  lib/api.js                │
                         └───────────────┬───────────────┬──────────────┘
                                         │               │
                          HTTPS (anon key)         WebSocket (Realtime)
                                         │               │
                         ┌───────────────▼───────────────▼──────────────┐
                         │                  SUPABASE                      │
                         │                                                │
                         │  Auth (email/password, JWT, roles via profile) │
                         │                                                │
                         │  PostgREST API ──▶ PostgreSQL                  │
                         │     guarded by Row-Level Security (RLS)        │
                         │                                                │
                         │  Tables: profiles · products · orders ·        │
                         │          order_items · feedback ·              │
                         │          contact_messages · cafe_tables        │
                         │  Functions: is_admin() · is_staff() ·          │
                         │             gen_order_code() · track_order()   │
                         │  Trigger: handle_new_user() → profiles         │
                         │  Realtime publication: orders · cafe_tables    │
                         └────────────────────────────────────────────────┘
```

**Key architectural points**

- **Single page app, no custom server.** The React SPA talks directly to Supabase's
  auto-generated REST API and Realtime sockets using the public anon key.
- **Security lives in the database.** Every table has RLS policies; the SQL helper
  functions `is_admin()` / `is_staff()` decide what each signed-in user can read or
  write. Because the rules are enforced in Postgres, a malicious client can't bypass
  them even though it holds the anon key.
- **Roles are data, not config.** A row in `profiles` (`customer` / `employee` /
  `admin`) determines access. A trigger creates a profile on sign-up; admins change
  roles from the Staff tab.
- **Realtime, not polling.** Customers' order status and the admin's new-order alerts
  arrive over a WebSocket; RLS still applies, so clients only receive rows they may read.
- **Graceful degradation.** If Supabase env vars are missing, the app falls back to the
  bundled demo menu so the UI still renders (see `src/lib/supabase.js`).

---

## 🔄 How it works (core flows)

**Authentication & roles**
`AuthContext` loads the Supabase session and the user's `role` from `profiles`.
`ProtectedRoute` gates `/admin` (role `admin`) and `/staff` (roles `admin` or
`employee`); customers self-sign-up at `/account`, staff are provisioned by an admin.

**Placing an order (customer)**
Cart → `lib/api.placeOrder()` inserts a row in `orders` (with a generated
`order_code`) and its `order_items`. The order is linked to the customer's `user_id`,
so it appears in **My Orders**.

**Live status updates**
The admin/employee advances an order through `pending → preparing → ready →
completed`. Because `orders` is in the Realtime publication, the customer's **My
Orders** page updates instantly and shows a toast; the admin gets a chime + badge when
a new order is inserted.

**POS sale (employee)**
The POS builds a cart locally, then calls `placeOrder()` with `order_type` `dine-in`
or `takeout` and (optionally) a `table_label`. A dine-in sale also flips the chosen
table to **occupied** on the floor plan.

**Floor plan / reservations**
Admins design the layout in a drag-and-drop canvas; positions are saved as
percentages in `cafe_tables` so it scales on any screen. Employees see the same plan
read-only and can toggle table status / add a guest name.

**Ratings**
After an order is `completed`, the customer can rate it once. Ratings are linked to
the order and aggregated (overall + product/service/delivery) in the admin Feedback tab.

---

## 🗃️ Database overview

| Table              | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `profiles`         | One row per auth user; holds the `role` that drives access.   |
| `products`         | Menu items (DB-driven; images mapped to bundled assets).     |
| `orders`           | Orders with `order_code`, type, status, priority, table.     |
| `order_items`      | Line items for each order.                                    |
| `feedback`         | Per-order ratings (overall + product/service/delivery).      |
| `contact_messages` | Contact-form submissions.                                    |
| `cafe_tables`      | Floor-plan objects with position, seats, and status.         |

Full SQL (tables, RLS, functions, realtime) lives in
[`supabase/schema.sql`](supabase/schema.sql); starter menu data in
[`supabase/seed.sql`](supabase/seed.sql).

---

## 📁 Project structure

```
src/
├── components/     Navbar, Footer, ProductCard, ProtectedRoute, …
├── context/        AuthContext, ProductsContext, CartContext
├── data/           products.js (image map + fallback menu)
├── lib/            supabase.js (client), api.js (orders/feedback/staff)
├── pages/
│   ├── Home, MenuPage, ProductDetail, CartPage, ContactPage
│   ├── AccountPage, MyOrdersPage, TrackOrderPage
│   ├── admin/      AdminDashboard, AdminLogin
│   └── staff/      StaffPortal (POS + queue + reservations)
└── App.jsx         Routes + providers
supabase/
├── schema.sql      Tables, RLS, functions, realtime
└── seed.sql        Starter menu
```

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env      # then fill in your Supabase URL + anon key
npm run dev
```

Then set up the database (run `supabase/schema.sql` and `supabase/seed.sql`) and
create your first admin. Full step-by-step instructions — including roles, the POS,
and the floor plan — are in **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**.

### Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the Vite dev server         |
| `npm run build`   | Production build to `dist/`        |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint                         |
| `npm run deploy`  | Build & publish to GitHub Pages    |

---

## 🔐 Security notes

- Only the **anon (public)** key is used in the browser; never ship the service-role key.
- All data access is gated by **Row-Level Security** in Postgres.
- Staff sign-up is closed — accounts are created/assigned by an admin.
- Guest order tracking requires **both** the order code and the matching phone number,
  via a `SECURITY DEFINER` function, so orders can't be enumerated.
