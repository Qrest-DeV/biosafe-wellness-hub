## Comprehensive Admin Dashboard — Full Build Plan

Build the complete admin dashboard in one pass, covering all 12 sections discussed, with orders/checkout, three staff roles (admin/staff/doctor), and a full audit log.

---

### 1. Database changes (single migration)

**New enum**
- Extend `app_role` to include `staff` and `doctor` (in addition to existing `admin`, `user`).

**New tables**
- `categories` — `id, slug, name, description, image_url, sort_order, active, timestamps`
- `product_images` — `id, product_id (fk), url, alt, sort_order, timestamps` (multi-image gallery)
- `addresses` — `id, user_id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default, timestamps`
- `orders` — `id, user_id, order_number (unique), status (enum: pending/paid/processing/shipped/delivered/cancelled/refunded), subtotal, shipping, tax, discount, total, currency, payment_method, payment_status, shipping_address_id, billing_address_id, tracking_number, carrier, notes, timestamps`
- `order_items` — `id, order_id (fk), product_id, name_snapshot, price_snapshot, quantity, subtotal, timestamps`
- `announcements` — `id, title, body, type (info/warning/promo), active, starts_at, ends_at, timestamps`
- `promo_codes` — `id, code (unique), discount_type (percent/fixed), discount_value, min_order, max_uses, used_count, active, expires_at, timestamps`
- `customer_notes` — `id, user_id (subject), author_id, note, pinned, timestamps`
- `admin_audit_log` — `id, actor_id, actor_email, action, entity_type, entity_id, before (jsonb), after (jsonb), ip, user_agent, created_at`
- `store_settings` — single-row keyed table (`key, value jsonb`) for store info, shipping, tax, email templates

**Inventory**
- Add `stock_count int default 0`, `low_stock_threshold int default 5`, `sku text` to `products`.

**RLS**
- All new tables: admin/staff full access via `has_role`. Doctors get read on `profiles`, `prescriptions`, `lab_results`, `consultations`, write on clinical tables only. Customers read their own `orders`, `order_items`, `addresses`.
- Audit log: admin-only read; insert via SECURITY DEFINER function only.

**Functions / triggers**
- `log_admin_action(action, entity_type, entity_id, before, after)` — SECURITY DEFINER inserter.
- `generate_order_number()` — sequential `BSW-YYYYMM-NNNN`.
- Order trigger: on insert, allocate number; on status change, log to audit.
- Update `handle_new_user_role` so the first user remains admin; subsequent users default to `user`.

---

### 2. Admin shell

Replace the current sidebar with the shadcn `Sidebar` (collapsible icon mode) containing all sections. Add a top header with `SidebarTrigger`, breadcrumbs, search, user menu.

```text
Sidebar
├── Overview              (KPIs, charts, activity)
├── Catalog
│   ├── Products
│   ├── Categories
│   └── Inventory
├── Sales
│   ├── Orders
│   ├── Promo Codes
│   └── Reports
├── Customers
│   ├── All Customers
│   └── Subscriptions
├── Clinical              (doctor + admin)
│   ├── Prescriptions
│   ├── Lab Results
│   └── Consultations
├── Marketing
│   ├── Hero Carousel
│   └── Announcements
├── Media (storage browser)
├── Staff & Roles
├── Audit Log
└── Settings
```

Role gating in `AdminLayout`:
- `admin` → all
- `staff` → everything except Staff & Roles, Audit, Settings
- `doctor` → only Clinical + read-only Customers

---

### 3. Pages to build (~20 new files)

**Overview** (`AdminOverview.tsx` rewrite)
- KPI cards: revenue (30d), orders (30d), new signups, active subscriptions, low-stock count.
- Charts (recharts): revenue trend (line), signups (bar), top products (bar), plan breakdown (pie).
- Recent activity feed (last 20 audit entries).

**Catalog**
- `AdminProducts.tsx` (rewrite) — table with bulk actions, stock badges, edit drawer with multi-image gallery upload to `product-images` bucket, drag-reorder.
- `AdminCategories.tsx` — CRUD + sort.
- `AdminInventory.tsx` — stock levels, low-stock alerts, quick-adjust.

**Sales**
- `AdminOrders.tsx` — list with filters (status, date, customer), detail drawer (line items, address, status timeline, tracking entry, refund button, internal notes).
- `AdminPromoCodes.tsx` — CRUD.
- `AdminReports.tsx` — sales/customer/subscription reports with date range + CSV export.

**Customers**
- `AdminCustomers.tsx` (enhance existing) — keep search/filter, add full-profile drawer with tabs (Profile, Health, Orders, Subscriptions, Notes), CSV export, manual verify toggle, plan change.
- `AdminSubscriptions.tsx` — list of subscribers, plan distribution, manual upgrade/downgrade/cancel.

**Clinical** (doctor-accessible)
- `AdminPrescriptions.tsx`, `AdminLabResults.tsx`, `AdminConsultations.tsx` — list across all customers with filters; create/edit/delete with audit logging.

**Marketing**
- `AdminSlides.tsx` (enhance) — drag-reorder, schedule fields, live preview.
- `AdminAnnouncements.tsx` — CRUD with type/scheduling.

**Media**
- `AdminMedia.tsx` — browse `product-images`, `hero-images`, `medical-files` (admin only on medical); upload, rename, delete.

**Staff & Roles** (admin only)
- `AdminStaff.tsx` — list users with roles, invite by email (creates pending invite + sends magic link), assign/revoke roles.

**Audit Log** (admin only)
- `AdminAuditLog.tsx` — paginated, filter by actor/entity/action/date, JSON diff viewer.

**Settings** (admin only)
- `AdminSettings.tsx` — tabs: Store info, Shipping & tax, Email templates, Auth (HIBP toggle), Payments (toggle providers).

---

### 4. Hooks & utilities

- `useOrders`, `useCategories`, `useInventory`, `usePromoCodes`, `useAnnouncements`, `useAuditLog`, `useStaff`, `useStoreSettings`, `useCustomerOrders`.
- `useRole()` — returns `{ isAdmin, isStaff, isDoctor, can(section) }` for gating UI.
- `auditLog.ts` helper — wraps mutating Supabase calls and writes to audit log via RPC.
- `formatters.ts` — money, dates, status pills.
- `csvExport.ts` — generic CSV download.

---

### 5. Storefront integration

- Add lightweight checkout flow on `Cart.tsx`: address form → create `order` + `order_items` (status `pending`) → mark `paid` (mock; payments toggle later). This gives the orders dashboard real data to show. Decrement `stock_count` on order creation.
- Show order history on the customer Dashboard ("My Orders" tab).
- Promo code field on cart applies discount.

---

### 6. Security & quality

- Every admin mutation routes through audit logger.
- Doctor cannot see `auth.users.email` or `subscription_plan` of customers (RLS column-level via dedicated RPC).
- Run `supabase--linter` after migration; fix any warnings.
- Skip payments wiring (mock paid status); we can enable Stripe in a follow-up.

---

### Out of scope (call out)
- Real Stripe payment processing — orders will use a mock "mark paid" button for now. Enable Stripe later via the payments tool.
- Email sending for staff invites — uses Supabase magic-link only; transactional templates stubbed in Settings UI.

---

### Deliverable size
~1 migration, ~20 new pages, ~10 hooks, sidebar shell rewrite, checkout MVP. Large change — proceed only after approval.