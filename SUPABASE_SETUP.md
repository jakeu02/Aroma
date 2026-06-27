# Aroma Cafe — Supabase setup

The app runs on bundled demo data until you connect Supabase. Follow these steps
to enable online ordering, the contact/feedback inbox, DB‑driven products, and the
admin dashboard.

## 1. Add your credentials

Open `.env` in the project root and paste your project values (Supabase dashboard →
**Settings → API**):

```
VITE_SUPABASE_URL=https://YOUR-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

The anon/public key is safe to use in the browser — Row Level Security (below)
protects your data. `.env` is gitignored.

## 2. Create the tables

In the dashboard go to **SQL Editor → New query**, then run each file's contents:

1. `supabase/schema.sql` — tables, Row Level Security policies, and triggers.
2. `supabase/seed.sql` — inserts the 10 starter menu items.

Both scripts are safe to re-run.

## 3. Create staff accounts (whitelist)

There is **no public sign-up for staff** — accounts are created by you, on purpose.
There are two staff roles:

| Role       | Signs in at | Can do                                                              |
| ---------- | ----------- | ------------------------------------------------------------------ |
| `admin`    | `/#/admin`  | Everything: dashboard, products, floor-plan editing, orders, etc.  |
| `employee` | `/#/staff`  | POS, order queue, and reservations (view + set table status only)  |

To create one:

1. In Supabase go to **Authentication → Users → Add user**.
2. Enter the email + a password, tick **Auto Confirm User**, and click **Create user**.
3. Grant the role in **SQL Editor** (use that email):

   ```sql
   -- For an admin:
   update public.profiles set role = 'admin'    where email = 'owner@example.com';
   -- For a counter employee:
   update public.profiles set role = 'employee' where email = 'barista@example.com';
   ```

4. Start the app (`npm run dev`) and sign in — admins at `/#/admin`, employees at `/#/staff`.
   (Admins can also open `/#/staff` to use the POS.)

Anyone without an `admin`/`employee` role is denied, even with an account.

## Staff terminal (POS)

`/#/staff` is the counter app for employees:

- **Point of Sale** — tap menu items to build an order, choose **Dine-in** (optionally
  assign a vacant table, which is then marked occupied) or **Takeout**, take cash and
  see the change due, then charge. The sale drops into the kitchen queue.
- **Orders** — the same live queue admins see (advance status, prioritize).
- **Reservations** — the floor plan in read-only layout: employees can set a table
  **vacant / reserved / occupied** and add a guest name, but can't move or delete
  tables (only admins design the layout, under Admin → Floor Plan).

## What's wired to the database

| Feature                       | Table(s)                     | Who can write / read                          |
| ----------------------------- | ---------------------------- | --------------------------------------------- |
| Menu / products               | `products`                   | Public read · admin write                     |
| Customer accounts             | `auth.users` + `profiles`    | Self sign-up (role = `customer`)              |
| Checkout / orders             | `orders`, `order_items`      | Signed-in create · owner + admin read         |
| Customer order history        | `orders` (own rows via RLS)  | Each customer sees only their own orders      |
| Guest order tracking (backup) | `track_order()` RPC          | Public, but only with order code **+** phone  |
| Order rating (after completion)| `feedback`                  | Owner rates own completed order · admin read  |
| Contact form                  | `contact_messages`           | Public create · admin read/update             |
| Admin accounts & roles        | `profiles` (+ `auth.users`)  | Own row · admin read                          |

### Customer accounts & order history

Customers **sign up / sign in** at `/#/account` (separate from admin — they get
`role = 'customer'`). Checkout requires being signed in; each order is linked to the
account via `orders.user_id`. Customers then see all their orders and live status at
`/#/my orders` → `/#/orders`. Row Level Security guarantees a customer can only read
their **own** orders.

The order **code + phone** lookup at `/#/track` still exists as a no-login backup.

### ⚠️ Email confirmation setting

By default Supabase requires **email confirmation** before a new account can sign in
(Authentication → Providers → Email → "Confirm email"). With it ON, after signing up
a customer must click the link in their inbox before ordering — the app shows a
"check your email" screen. For a smoother demo you can turn it OFF so accounts work
instantly. Your call based on how strict you want signups to be.

## Admin dashboard

`/#/admin` gives you:

- **Orders** — every order with line items; update status (pending → preparing → ready → completed/cancelled).
- **Messages** — contact‑form inbox with read/unread.
- **Feedback** — ratings + comments with an average score.
- **Products** — add, edit, delete, and show/hide menu items. New product images
  are picked from the bundled set in `src/lib`/`src/data/products.js`
  (`productImages`); add a key there to offer a new image.

> Note: product images are bundled assets keyed by `image_key`. To add a brand‑new
> image, drop the file in `src/assets/categories/`, import it in
> `src/data/products.js`, add it to the `productImages` map, then reference that key
> when creating the product.
