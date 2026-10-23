# Sokher Store — Full E-commerce Web Application

A modern, mobile-responsive, full-featured e-commerce platform built with **Next.js (App Router)**, **Tailwind CSS**, **Prisma ORM**, and a **Shared PostgreSQL Backend Database**. Designed for cosmetics & beauty retail with 100% dynamic administration (no hardcoding).

![Sokher Store Design Reference](/images/design-reference.jpg)

---

## 🌟 Key Architectural Features

1. **Shared Database Backend (Single Source of Truth)**
   - Powered by **Prisma ORM** with **PostgreSQL** (compatible with Supabase, Neon, Railway, RDS, or local Postgres).
   - Zero `localStorage`-only data architecture — changes made by admins on any device reflect in real-time across all customer devices.
   - Seamless offline fallback for instant local evaluation.

2. **Design Reference Fidelity**
   - Exact red theme (`#E11D2E` / `#CC272D`) with soft pink pastel accents (`#FFF0F3`, `#FDE2E4`).
   - Top red announcement bar with live free-shipping thresholds from Settings.
   - Sticky header with search, auto-suggestions (Bangla & English keywords), wishlist badge, and slide-out cart drawer.
   - Interactive hero slider, trust badge cards, circular category cards, and featured product grid.
   - Bottom navigation bar on mobile devices (Home, Shop, Categories, Wishlist, Cart).

3. **Robust Business & Data Rules Enforced**
   - **Price Parser Protection**: Handles commas (`"1,200"`), currency symbols (`৳1200`), spaces, and Bengali numerals (`১২০০`). Blocks `0` or negative values.
   - **Field Preservation on Edit**: Editing a product preserves untouched fields (such as `regularPrice`, `sku`, `subcategory`).
   - **Unique SKU Enforcement**: Duplicate SKU creation is blocked with clear Bengali/English error responses.
   - **Order Snapshot**: Order items permanently store real product name, SKU, price, variant, and image at the time of purchase.
   - **Idempotent Stock Restoration**: Cancelling an order restores product inventory **exactly once** (`isStockRestored` flag prevents double increments if cancelled again).
   - **Clear Cart Reliability**: Clears cart completely and resets subtotal, delivery, and total to 0.

4. **Tracking & Analytics (Pixel, CAPI, GA4, GTM)**
   - Admin settings fields for Meta Pixel ID, Meta CAPI Access Token, GA4 Measurement ID (`G-XXXXXXX`), and GTM Container ID (`GTM-XXXXXXX`).
   - **Blank ID Omission**: If tracking IDs are blank, scripts are completely omitted from the HTML/DOM.
   - Dual-event dispatch: Browser Meta Pixel + Server-side Meta Conversions API (CAPI) with matching `event_id` to prevent duplicate counts.

5. **AI Features**
   - **AI Shopping Assistant**: Floating beauty advisor widget grounded in real database inventory.
   - **Smart Search**: Handles Bengali phonetic queries and beauty aliases.
   - **Admin AI Description**: Instant generation of engaging Bengali & English product descriptions.
   - **Admin AI Sales Insight**: Generates executive sales summaries from actual completed orders and inventory.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/rayhan-w/sokher-store.git
cd sokher-store
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
# Shared PostgreSQL Database (Supabase, Neon, Railway)
# Leave empty for zero-config offline mode
DATABASE_URL=""

JWT_SECRET="sokher_store_super_secret_jwt_key_2026"
ADMIN_EMAIL="admin@sokherstore.com"
ADMIN_PASSWORD="admin123456"
GEMINI_API_KEY="" # Optional for AI Features
```

### 3. Initialize Database & Seed Demo Data
```bash
node scripts/db-setup.js
node scripts/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

- **Admin Login:** `/admin/login`
  - **Email:** `admin@sokherstore.com`
  - **Password:** `admin123456`
- **Demo Customer:**
  - **Email:** `customer@sokherstore.com`
  - **Password:** `customer123`

---

## 🧪 Acceptance Test Suite

Run the built-in 9-point automated acceptance suite:
```bash
npx tsx scripts/acceptance-tests.js
```
Verified tests:
1. `[PASS]` Price Parser (`"1,200"` -> 1200, 0/empty blocked)
2. `[PASS]` Product Edit preserves Regular Price, SKU, and Subcategory
3. `[PASS]` Multi-Category product association & real DB counts
4. `[PASS]` Product Delete safely cleans up database
5. `[PASS]` Order item snapshot & Idempotent stock restoration on Cancel
6. `[PASS]` Clear Cart resets items, subtotal, and total to 0
7. `[PASS]` Single Source of Truth delivery calculation (Dhaka ৳70 / Outside ৳130 / Free over ৳999)
8. `[PASS]` Tracking ID format validation and omission rules
9. `[PASS]` Discount % calculation formula consistency

---

## 📦 Deployment (Vercel & Supabase)

1. **Database:** Create a free project on [Supabase](https://supabase.com) or [Neon](https://neon.tech) and copy your PostgreSQL connection string into `DATABASE_URL`.
2. **Push Schema:**
   ```bash
   npx prisma db push --schema=prisma/schema.prisma
   node scripts/seed.js
   ```
3. **Deploy on Vercel:**
   - Connect your GitHub repo `rayhan-w/sokher-store`.
   - Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`.
   - Build command: `npm run build`
   - Output directory: `.next`
