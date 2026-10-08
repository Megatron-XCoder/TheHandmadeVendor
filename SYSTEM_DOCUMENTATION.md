# The Handmade Vendor — System Architecture & Implementation Reference

> Comprehensive architectural, frontend, backend, database, and integration record for **The Handmade Vendor** e-commerce platform.

---

## Table of Contents
1. [Executive Summary & Tech Stack](#1-executive-summary--tech-stack)
2. [Frontend Architecture & UI/UX Enhancements](#2-frontend-architecture--uiux-enhancements)
   - [Toast Notification Z-Index Stacking](#toast-notification-z-index-stacking)
   - [Wishlist-to-Cart Flow & Auto-Removal](#wishlist-to-cart-flow--auto-removal)
   - [Cart Page Deprecation in Favor of Collapsible Drawer](#cart-page-deprecation-in-favor-of-collapsible-drawer)
   - [IndexedDB Client Persistence Layer](#indexeddb-client-persistence-layer)
   - [Luxury Authentication Pages (Sign In & Sign Up)](#luxury-authentication-pages-sign-in--sign-up)
   - [Contact & Atelier Concierge Page (WhatsApp Integration)](#contact--atelier-concierge-page-whatsapp-integration)
   - [Responsive Title Stacking Rule](#responsive-title-stacking-rule)
3. [Environment Configuration & Secrets](#3-environment-configuration--secrets)
4. [Supabase Authentication & Security Architecture](#4-supabase-authentication--security-architecture)
   - [SSR Architecture & Cookie Management](#ssr-architecture--cookie-management)
   - [5-Minute Personalized Email Verification (Nodemailer)](#5-minute-personalized-email-verification-nodemailer)
   - [Google OAuth Integration](#google-oauth-integration)
   - [Security & Anti-Abuse Controls](#security--anti-abuse-controls)
5. [Database Schema & Migrations (PostgreSQL)](#5-database-schema--migrations-postgresql)
   - [Schema Diagram](#schema-diagram)
   - [Core Tables & Automatic Profile Triggers](#core-tables--automatic-profile-triggers)
   - [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
   - [Executing Migrations](#executing-migrations)
6. [Cross-Device Cart & Wishlist Synchronization](#6-cross-device-cart--wishlist-synchronization)
   - [Hydration & Cloud Sync Lifecycle](#hydration--cloud-sync-lifecycle)
   - [Two-Way Merge Logic](#two-way-merge-logic)
7. [Bespoke Order Tracking & Checkout Flow](#7-bespoke-order-tracking--checkout-flow)
   - [Checkout Integration](#checkout-integration)
   - [Atelier 4-Stage Creation Progress Tracker](#atelier-4-stage-creation-progress-tracker)
   - [Account Profile Dashboard](#account-profile-dashboard)
8. [File Structure & Key Modified Modules](#8-file-structure--key-modified-modules)
9. [Future Setup & Deployment Checklist](#9-future-setup--deployment-checklist)

---

## 1. Executive Summary & Tech Stack

The Handmade Vendor is a high-end luxury e-commerce platform specializing in artisanal goods. The system integrates seamless client-side state handling with persistent cloud storage, responsive luxury aesthetics, and multi-factor email verification.

- **Frontend Framework**: Next.js 16 (App Router)
- **UI & Component Layer**: React 19, Tailwind CSS
- **State Management**: Redux Toolkit (`react-redux`)
- **Client Offline Storage**: Browser IndexedDB (`TheHandmadeVendorDB`)
- **Backend & Database**: Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`)
- **Email Delivery**: Nodemailer via SMTP with branded HTML templates
- **Design Tokens**: Google Fonts `'Cinzel', serif` & Inter, brand palette (`#FFFAF5`, `#3D2B1F`, `#C4896A`, `#E3C9A8`)

---

## 2. Frontend Architecture & UI/UX Enhancements

### Toast Notification Z-Index Stacking
- **Issue**: Standard `react-hot-toast` notifications were rendering behind the collapsible cart and wishlist sidebars (`z-[99999]`), making feedback invisible when sidebars were open.
- **Resolution**: Updated `src/app/layout.tsx` to set the Toaster container's z-index to `9999999`:
  ```tsx
  <Toaster
    position="top-right"
    containerStyle={{
      top: 80,
      right: 16,
      zIndex: 9999999,
    }}
    toastOptions={{
      duration: 3000,
    }}
  />
  ```
- **Files Modified**: `src/app/layout.tsx`

---

### Wishlist-to-Cart Flow & Auto-Removal
- **Requirement**: When a customer clicks **"Add to Bag"** or **"Add All to Bag"** from the Wishlist sidebar or modal, items should be added to the shopping bag and simultaneously removed from the wishlist to prevent duplicates.
- **Implementation**:
  - `SingleItem.tsx`: In `handleAddToCart`, `dispatch(addItemToCart(...))` is immediately followed by `dispatch(removeItemFromWishlist(item.id))`.
  - `WishlistSidebarModal/index.tsx`: In `handleAddAllToCart`, every item in `wishlistItems` is added to cart and the entire wishlist is cleared with `dispatch(removeAllItemsFromWishlist())`.
- **Files Modified**:
  - `src/components/Common/WishlistSidebarModal/SingleItem.tsx`
  - `src/components/Common/WishlistSidebarModal/index.tsx`

---

### Cart Page Deprecation in Favor of Collapsible Drawer
- **Requirement**: Remove the standalone `/cart` URL page; the collapsible drawer sidebar is the unified shopping bag experience.
- **Implementation**: `src/app/(site)/(pages)/cart/page.tsx` was converted to a server redirect to `/`:
  ```tsx
  import { redirect } from "next/navigation";

  export default function CartPage() {
    redirect("/");
  }
  ```
- **Files Modified**: `src/app/(site)/(pages)/cart/page.tsx`

---

### IndexedDB Client Persistence Layer
- **Requirement**: Cart and wishlist items must persist across browser tab reloads without relying purely on ephemeral `localStorage` strings or losing state on refresh.
- **Implementation**:
  - Created `src/utils/indexedDB.ts` utilizing native browser `window.indexedDB`:
    - Database Name: `TheHandmadeVendorDB` (v1)
    - Object Store: `commerce_data`
    - Helper methods: `getStoredItem<T>(key)`, `setStoredItem<T>(key, value)`, `removeStoredItem(key)`
  - Subscribed Redux slices (`cart-slice.ts` and `wishlist-slice.ts`) to write updates to IndexedDB on every mutation (`addItemToCart`, `removeItemFromCart`, `updateCart`, etc.).
  - Integrated `StoreHydrator.tsx` in `layout.tsx` to restore state into Redux on initial page load.
- **Files Modified**:
  - `src/utils/indexedDB.ts`
  - `src/redux/features/cart-slice.ts`
  - `src/redux/features/wishlist-slice.ts`
  - `src/components/Common/StoreHydrator.tsx`

---

### Luxury Authentication Pages (Sign In & Sign Up)
- **Design Philosophy**:
  - Removed outdated breadcrumb bars to give a modern, clean look (`pt-28 lg:pt-32`).
  - Implemented an elegant, responsive two-column card container.
  - Left Column: Dark artisan espresso gradient (`#1F150E` to `#4A3324`), subtle ambient light blur (`opacity-[0.2]`), brand crest logo, and collector privileges list.
  - Right Column: Elegant ivory form panel with floating labels, password visibility toggles, and Google OAuth buttons.
- **Signup Form Fields**:
  1. First Name
  2. Last Name
  3. Phone Number
  4. Email Address
  5. Password
  6. Re-Password (confirm password)
- **Validation**:
  - Passwords must match.
  - Minimum 8 characters.
  - Transitions directly to the 5-minute email verification screen upon submitting valid data.
- **Files Modified**:
  - `src/components/Auth/Signin/index.tsx`
  - `src/components/Auth/Signup/index.tsx`

---

### Contact & Atelier Concierge Page (WhatsApp Integration)
- **Requirement**: Redesign `/contact` to embody the luxury brand aesthetic, presenting concierge contact channels and a button titled **"Send Message on WhatsApp"**.
- **Implementation**:
  - Two-column Atelier Concierge showcase:
    - **Left Column**: Atelier address (Florence, Italy), Priority WhatsApp Line, direct electronic mail, and operating hours.
    - **Right Column**: Bespoke inquiry form with inquiry type selector (Bespoke Commission, Order Status, Private Viewing, Heritage Restoration).
    - **Send Button**: Labeled **"Send Message on WhatsApp"** with a WhatsApp icon.
    - Clicking constructs a formatted message:
      ```
      Hello Atelier Concierge,
      I would like to inquire about: [Subject]
      Name: [Full Name]
      Email: [Email]
      Phone: [Phone]
      Message: [Customer Message]
      ```
      and opens `https://wa.me/390551234567?text=...` in a new browser tab.
    - Three brand value cards at bottom: *Bespoke Commissions*, *Private Consultations*, and *Heritage Restoration*.
- **Files Modified**:
  - `src/components/Contact/index.tsx`

---

### Responsive Title Stacking Rule
- **Rule**: The title `The Handmade Vendor` must stay strictly on a **single line in desktop/tablet view**, but can cleanly stack into a **second line in mobile view**.
- **Implementation**:
  ```tsx
  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 text-center sm:text-left">
    <span className="font-serif text-lg font-bold tracking-widest text-[#1F150E] uppercase whitespace-nowrap">
      The Handmade
    </span>
    <span className="font-serif text-lg font-bold tracking-widest text-[#C4896A] uppercase whitespace-nowrap">
      Vendor
    </span>
  </div>
  ```
  - On screens `< 640px` (`sm:`): Renders as a vertical flex column (`The Handmade` on line 1, `Vendor` on line 2).
  - On screens `>= 640px`: Renders as an inline horizontal row (`sm:flex-row`) with `whitespace-nowrap`.
- **Files Modified**:
  - `src/components/Auth/Signin/index.tsx`
  - `src/components/Auth/Signup/index.tsx`
  - `src/components/Contact/index.tsx`

---

## 3. Environment Configuration & Secrets

Environment variables are managed in `.env` and `.env.local`:

```env
# ── Supabase Credentials ─────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://gctojfyebvekqawzonjj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_59teddVsFB55WTaTmI39DA_cdk5ENww
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_59teddVsFB55WTaTmI39DA_cdk5ENww

# ── Application Base URL ─────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── Nodemailer SMTP (Email Verification) ─────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=crisiscrush525@gmail.com
SMTP_PASS=urzyzhkbdybkopkd
SMTP_FROM="The Handmade Vendor Concierge <concierge@thehandmadevendor.com>"
```

> [!NOTE]
> In local development environments without SMTP credentials, verification codes are logged directly to the server console and displayed in an interactive helper pill on the client.

---

## 4. Supabase Authentication & Security Architecture

### SSR Architecture & Cookie Management
The platform utilizes `@supabase/ssr` to ensure secure authentication in Next.js Server Components, Server Actions, Route Handlers, and client components:

1. **Browser Client** (`src/utils/supabase/client.ts`):
   ```ts
   import { createBrowserClient } from "@supabase/ssr";
   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```
2. **Server Client** (`src/utils/supabase/server.ts`):
   Integrates `createServerClient` with Next.js `cookies()` from `next/headers` to read/write auth tokens into HttpOnly cookies.
3. **Session Middleware** (`src/middleware.ts` & `src/utils/supabase/middleware.ts`):
   Intercepts requests to automatically refresh expiring Supabase JWT sessions. Configured with matcher `(?!api|_next/static|_next/image|favicon.ico)` to allow uninterrupted API payloads.
4. **OAuth Callback Route** (`src/app/auth/callback/route.ts`):
   Receives PKCE auth codes from Google OAuth and Supabase email verification, exchanging them via `supabase.auth.exchangeCodeForSession(code)` before redirecting to `/` or the intended route.

---

### 5-Minute Personalized Email Verification (Nodemailer)

```
User Enters Info
      │
      ▼
POST /api/auth/send-verification ──► Generate 6-Digit Code
      │                                       │
      ▼                                       ▼
Store in In-Memory Map               Send Luxury HTML Email
(Expires in 300,000ms / 5 min)       (via Nodemailer SMTP)
      │
      ▼
User Enters Code in UI (Live 5:00 Timer)
      │
      ▼
POST /api/auth/verify-code
      │
      ├─► Valid: Calls supabase.auth.signUp() ──► Auto-login ──► Redirect
      └─► Invalid / Expired: Increments attempt counter (Max 5 attempts)
```

1. **Email Service** (`src/utils/email.ts`):
   - Renders a responsive luxury HTML email with gold borders, Cinzel typography, and a centered 6-digit verification code.
   - Highlights the 5-minute security lifetime.
2. **Verification Store** (`src/utils/verificationStore.ts`):
   - `CODE_LIFETIME_MS = 5 * 60 * 1000` (Strict 5-minute expiration).
   - `MAX_ATTEMPTS = 5` (Destroys the token if 5 incorrect attempts are made).
   - `RESEND_COOLDOWN_MS = 60 * 1000` (Rate limits resend requests to once per minute).
3. **Countdown UI** (`src/components/Auth/Signup/index.tsx`):
   - Live JavaScript `setInterval` countdown timer formatted as `MM:SS`.
   - Disabled input state when expired with an immediate "Request New Code" button.

---

### Google OAuth Integration
- Built into both Sign In and Sign Up components.
- Invokes:
  ```ts
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  ```
- Works out-of-the-box on the Supabase free tier once Google Client ID and Secret are configured in the Supabase Dashboard.

---

### Security & Anti-Abuse Controls
- **HttpOnly Secure Cookies**: Prevents client-side script token theft.
- **Brute-Force Lockout**: 5 failed verification attempts invalidate the code.
- **Input Sanitization**: Email lowercasing and trimming across endpoints.
- **Row Level Security**: All Postgres tables restrict read/write access to `auth.uid() = user_id`.

---

## 5. Database Schema & Migrations (PostgreSQL)

Located in: `supabase/migrations/20261008_init_ecommerce_schema.sql`

```
┌──────────────────────────────────────────────────────────────┐
│                       auth.users                             │
│       (Managed by Supabase Auth — id: UUID PK)               │
└──────────────────────────────┬───────────────────────────────┘
                               │
                (on_auth_user_created trigger)
                               ▼
┌──────────────────────────────┴───────────────────────────────┐
│                       public.profiles                        │
│  - id: UUID PRIMARY KEY REFERENCES auth.users                │
│  - first_name: TEXT                                          │
│  - last_name: TEXT                                           │
│  - phone: TEXT                                               │
│  - email: TEXT                                               │
│  - avatar_url: TEXT                                          │
│  - created_at: TIMESTAMPTZ DEFAULT now()                     │
│  - updated_at: TIMESTAMPTZ DEFAULT now()                     │
└──────────────────────────────┬───────────────────────────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        ▼                      ▼                       ▼
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│  cart_items  │       │wishlist_items │       │    orders    │
│  - id (UUID) │       │  - id (UUID)  │       │  - id (UUID) │
│  - user_id   │       │  - user_id    │       │  - user_id   │
│  - product_id│       │  - product_id │       │  - order_num │
│  - title     │       │  - title      │       │  - status    │
│  - price     │       │  - price      │       │  - total     │
│  - image     │       │  - image      │       │  - notes     │
│  - quantity  │       │  - created_at │       │  - created_at│
│  - updated_at│       └───────────────┘       └───────┬──────┘
└──────────────┘                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │ order_items  │
                                               │  - id (UUID) │
                                               │  - order_id  │
                                               │  - product_id│
                                               │  - title     │
                                               │  - quantity  │
                                               │  - price     │
                                               └──────────────┘
```

### Core Tables & Automatic Profile Triggers

#### 1. Automatic Profile Creation Function & Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2)),
    NEW.raw_user_meta_data->>'phone',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### 2. Row Level Security (RLS)
All tables enable Row Level Security to guarantee multi-tenant data isolation:
- `profiles`: Users can select and update only their own profile (`auth.uid() = id`).
- `cart_items`: Users can select, insert, update, delete only their own cart rows (`auth.uid() = user_id`).
- `wishlist_items`: Users can select, insert, delete only their own wishlist rows (`auth.uid() = user_id`).
- `orders`: Users can select only orders where `auth.uid() = user_id`.
- `order_items`: Users can select order items if their order belongs to them (`EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())`).

### Executing Migrations
1. Open the [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/gctojfyebvekqawzonjj/sql).
2. Paste the contents of `supabase/migrations/20261008_init_ecommerce_schema.sql`.
3. Click **Run** to execute all table creations, foreign keys, triggers, and RLS policies.

---

## 6. Cross-Device Cart & Wishlist Synchronization

### Hydration & Cloud Sync Lifecycle
```
Page Load / Browser Start
       │
       ▼
Read IndexedDB ('TheHandmadeVendorDB') ──► Populate Redux Cart & Wishlist
       │
       ▼
StoreHydrator listens to supabase.auth.onAuthStateChange()
       │
       ├─► Guest User:
       │     └─► Cart & wishlist mutations persist to IndexedDB
       │
       └─► Authenticated User:
             │
             ▼
       Fetch public.cart_items & public.wishlist_items from Supabase
             │
             ▼
       Run Two-Way Merge (cartSync.ts)
             │
             ├─► Push local guest items up to Supabase
             ├─► Pull missing cloud items down into Redux & IndexedDB
             └─► Resolve duplicates using Math.max(localQty, remoteQty)
```

### Key Modules:
- `src/utils/cartSync.ts`:
  - `fetchRemoteCart(userId)`
  - `saveRemoteCartItem(userId, item)`
  - `removeRemoteCartItem(userId, productId)`
  - `syncLocalCartWithRemote(userId, localItems)`
- `src/components/Common/StoreHydrator.tsx`: Runs invisibly inside `layout.tsx`, listening for auth state transitions and syncing storage without manual user action.

---

## 7. Bespoke Order Tracking & Checkout Flow

### Checkout Integration (`src/components/Checkout/index.tsx`)
- Pulls live items and subtotal from Redux.
- Submits full order payload to `POST /api/orders`:
  - Shipping address, customer name, phone, email.
  - Bespoke monogramming/artisan notes.
  - Calculates subtotal and White-Glove delivery fees.
- Links order record to `auth.uid()`.
- Flushes the cart in Redux, IndexedDB, and Supabase upon successful order placement.
- Redirects user to `/my-account` with an active order confirmation toast.

---

### Atelier 4-Stage Creation Progress Tracker (`src/components/Orders/OrderModal.tsx`)
When clicking **"Track Order"** or viewing order details in `/my-account`, an Atelier Creation Progress modal appears:

```
[ Stage 1: Order Confirmed ] ──► [ Stage 2: Artisan Crafting ] ──► [ Stage 3: Quality Inspection ] ──► [ Stage 4: White-Glove Dispatch ]
```
- **Live Statuses**:
  - `processing` / `pending`: Stage 1 active
  - `crafting`: Stage 2 active
  - `inspection`: Stage 3 active
  - `dispatched`: Stage 4 active
  - `delivered`: All stages complete
- Displays artisan progress line with glowing bronze indicators, estimated completion dates, and itemized commission summaries.

---

### Account Profile Dashboard (`src/components/MyAccount/index.tsx`)
- Fetches real user profile directly from `public.profiles`.
- Displays:
  - Full Name, Email, Phone Number.
  - Dynamic Member Initials Avatar.
  - Member Since registration date.
  - Real active and past orders loaded from `GET /api/orders`.
- **Header Profile Integration** (`src/components/Header/index.tsx`):
  - Shows an active status dot when the user is logged in.
  - Dropdown reveals profile details, link to My Account, and a **Sign Out** button that clears Supabase session, IndexedDB cache, and Redux state.

---

## 8. File Structure & Key Modified Modules

```
├── .env.local                                      # Supabase and SMTP environment keys
├── supabase/
│   └── migrations/
│       └── 20261008_init_ecommerce_schema.sql      # Full PostgreSQL schema, RLS, and triggers
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── send-verification/route.ts      # 5-min verification code dispatcher
│   │   │   │   └── verify-code/route.ts            # Verification validation & Supabase signup
│   │   │   └── orders/route.ts                     # GET and POST orders for auth.uid()
│   │   ├── auth/
│   │   │   └── callback/route.ts                   # OAuth & PKCE exchange callback
│   │   ├── (site)/(pages)/
│   │   │   ├── cart/page.tsx                       # Redirects to / (sidebar drawer is primary)
│   │   │   ├── contact/page.tsx                    # Contact & Concierge page
│   │   │   ├── signin/page.tsx                     # Sign In page
│   │   │   └── signup/page.tsx                     # Sign Up page
│   │   └── layout.tsx                              # Toaster z-index (9999999) & StoreHydrator
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Signin/index.tsx                    # Luxury Signin UI & Google OAuth
│   │   │   └── Signup/index.tsx                    # Luxury Signup UI & 5-min timer modal
│   │   ├── Checkout/index.tsx                      # Order placement with auth.uid()
│   │   ├── Common/
│   │   │   ├── CartSidebarModal/                   # Collapsible shopping bag drawer
│   │   │   ├── WishlistSidebarModal/               # Wishlist drawer (Add to Bag removes item)
│   │   │   └── StoreHydrator.tsx                   # Auto IndexedDB & Supabase synchronizer
│   │   ├── Contact/index.tsx                       # WhatsApp Concierge & Atelier showcase
│   │   ├── Header/index.tsx                        # Auth dot, profile dropdown, Sign Out
│   │   ├── MyAccount/index.tsx                     # Real profile & orders dashboard
│   │   └── Orders/
│   │       ├── index.tsx                           # Orders list view
│   │       └── OrderModal.tsx                      # 4-stage Atelier creation progress modal
│   ├── redux/
│   │   └── features/
│   │       ├── cart-slice.ts                       # Cart state with IndexedDB sync
│   │       └── wishlist-slice.ts                   # Wishlist state with IndexedDB sync
│   └── utils/
│       ├── cartSync.ts                             # Cloud <-> IndexedDB cart reconciliation
│       ├── email.ts                                # Luxury Nodemailer HTML template
│       ├── indexedDB.ts                            # Browser IndexedDB wrapper
│       ├── verificationStore.ts                    # 5-min code expiry, 5-attempt brute-force guard
│       └── supabase/
│           ├── client.ts                           # Browser Supabase client
│           ├── server.ts                           # Server Supabase client with cookies()
│           └── middleware.ts                       # Automatic JWT session refresher
```

---

## 9. Future Setup & Deployment Checklist

When deploying to a new environment or production hosting (e.g. Vercel, Supabase):

1. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr nodemailer @types/nodemailer
   ```
2. **Execute Database Migration**:
   - Go to the **Supabase Dashboard > SQL Editor**.
   - Open and execute [supabase/migrations/20261008_init_ecommerce_schema.sql](file:///c:/Users/crisi/Downloads/nextjs-ecommerce-template-main/nextjs-ecommerce-template-main/supabase/migrations/20261008_init_ecommerce_schema.sql).
3. **Configure Environment Variables**:
   - In production (Vercel/Hosting Dashboard), configure:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_SITE_URL` (Set to `https://yourdomain.com`)
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
4. **Google OAuth Configuration**:
   - In Google Cloud Console, add `https://<your-project>.supabase.co/auth/v1/callback` to Authorized Redirect URIs.
   - In Supabase Dashboard (**Authentication > Providers > Google**), input Client ID & Client Secret.
5. **Verify Build**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

*Documentation maintained for The Handmade Vendor repository.*
