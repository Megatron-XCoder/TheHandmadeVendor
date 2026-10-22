# The Handmade Vendor — Luxury Artisanal E-Commerce & Atelier Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.6.1-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Table](https://img.shields.io/badge/TanStack_Table-v8-FF4154?style=for-the-badge&logo=react-table&logoColor=white)](https://tanstack.com/table)

<p align="center">
  <strong>A state-of-the-art e-commerce boutique engineered for bespoke heirloom creations, master artisans, and discerning patrons.</strong>
</p>

</div>

---

## 🏛️ About The Handmade Vendor

**The Handmade Vendor** is an ultra-premium, bespoke e-commerce platform dedicated to celebrating generational craftsmanship, artisanal heirlooms, and curated masterworks. From Florentine leathercraft to hand-carved walnut decor and sculptural brass, each creation carries a story of timeless beauty and dedication.

The platform blends timeless European atelier aesthetics with a high-performance, modern web architecture:
- **Atelier Visual Palette**: Warm Alabaster (`#FFFAF5`), Deep Espresso (`#3D2B1F`), Terracotta Amber (`#C4896A`), and Burnished Gold (`#E3C9A8`).
- **Harmonious Typography**: Roman *Cinzel* Serif headers paired with clean *Euclid Circular A* & *Inter* interfaces.
- **Micro-Animations & Tactile Feedback**: Subtly responsive components, interactive drawers, and bespoke state transitions.

---

## ✨ Key Platform Features

### 🛍️ 1. Artisanal Shop & Discovery
- **Curated Catalog**: Browse masterworks filtered by artisanal category, material (e.g., Florentine Leather, Black Walnut, Antiqued Brass), price range, and craft attributes.
- **Dual View Layouts**: Seamless toggle between immersive Grid Cards and expansive List Views.
- **Quick Preview Modal**: Instant product inspection with high-resolution imagery, artisan notes, stock status, and single-click cart/wishlist actions.
- **Responsive Mobile Filter Drawer**: Floating glassmorphic filter & sort pill with smooth sliding drawer and automated footer collision detection.

### 🔄 2. Three-Tier Cart & Wishlist Synchronization
- **Tier 1 — In-Memory Redux Store**: Ultra-responsive instant state mutations with zero UI latency.
- **Tier 2 — Client Offline Cache (IndexedDB)**: Native `TheHandmadeVendorDB` preserves cart and wishlist states across page refreshes and browser sessions.
- **Tier 3 — Cloud Persistence (Supabase PostgreSQL)**: Full cloud sync across devices with intelligent two-way merge upon patron sign-in.
- **Collapsible Shopping Bag & Wishlist Drawers**: Slide-over panels with direct checkout navigation, item quantity controls, and stock indicators.

### 👤 3. Atelier Patron Portal (`/my-account`)
- **Patron Profile & Atelier Preferences**: Manage names, phone numbers, craft preferences, and delivery locations backed by real-time Supabase persistence.
- **Synchronized Monogram Initials**: Dynamic 1-to-2 character monogram initials synced seamlessly across the navigation bar, greeting banner, and patron profile crest.
- **Global Country & Region Picker**: Cascading Country, State, and City dropdowns powered by `country-state-city`.
- **Intelligent Address Book**: Multiple address tags (Studio, Residence, Atelier), automatic default handling, tag swapping, and safety confirmation modals.
- **Master Security Key Management**: Update passwords securely with real-time confirmation validation and visual show/hide toggles.

### 📦 4. Bespoke Order Management & Live Tracking
- **Artisan 4-Stage Progress Pipeline**: Interactive tracking modal detailing each commission's lifecycle:
  1. *Commission Received* (Order registered and cataloged)
  2. *Artisan Handcrafting* (Master artisan shaping the piece)
  3. *Hallmark & Quality Inspection* (Final finishing and certification)
  4. *Dispatched via Private Courier* (Dispatched with tracking)
- **Responsive Mobile Order View**: Full-detail mobile card view with zero horizontal scrolling and instant sorting dropdown.
- **Desktop Atelier Table**: High-contrast TanStack Data Table with search filtering, status tabs, order reference sorting, and pagination.

### 🔐 5. Authentication & Security Architecture
- **Supabase SSR**: Secure cookie-based session management across Server Components, Server Actions, and Route Handlers.
- **5-Minute Personalized Email Verification**: Automated verification codes sent via Nodemailer with high-converting, luxury branded HTML email templates.
- **Google OAuth Integration**: One-click authentication for collectors and patrons.
- **Minimalist Luxury Toast Engine**: Snug beneath the navbar on desktop (`top: 60px`) and mobile (`top: 56px`), equipped with instant close buttons (`✕`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions) |
| **Core UI** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/), PostCSS, Custom Atelier Design Tokens |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) (`react-redux`) |
| **Client Storage** | Native Browser [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (`TheHandmadeVendorDB`) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth SSR) |
| **Data Tables** | [TanStack React Table v8](https://tanstack.com/table) |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) (Branded HTML SMTP dispatch) |
| **Location Data** | [country-state-city](https://www.npmjs.com/package/country-state-city) |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com/) (Custom luxury styled wrapper) |

---

## 📂 Project Structure

```bash
the-handmade-vendor/
├── public/                       # Static brand assets, artisan photography, icons
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (site)/               # Public storefront routes
│   │   │   ├── (pages)/          # Shop, Contact, Signin, Signup, My-Account, Checkout
│   │   │   └── page.tsx          # Atelier homepage
│   │   ├── api/                  # Route Handlers (Orders, Auth, Sync, Email)
│   │   ├── context/              # Drawer & modal context providers
│   │   ├── css/                  # Atelier design tokens, font definitions & global CSS
│   │   ├── layout.tsx            # Global layout, Redux provider, Toast container
│   │   └── not-found.tsx         # Branded 404 heirloom page
│   ├── components/               # Modular React UI components
│   │   ├── Auth/                 # Luxury Sign In, Sign Up, and Password Reset
│   │   ├── Common/               # AtelierTable, Modals, Breadcrumbs, Drawers
│   │   │   ├── CartSidebarModal/ # Collapsible shopping bag drawer
│   │   │   └── WishlistSidebarModal/ # Curated wishlist slide-over
│   │   ├── Header/               # Sticky luxury navbar with monogram avatar
│   │   ├── Footer/               # Brand manifesto & footer navigation
│   │   ├── MyAccount/            # Patron Profile, Preferences, Address Book, Security
│   │   ├── Orders/               # Order tracking modal & order history
│   │   ├── Shop/                 # Product cards, grid/list view, filtering engine
│   │   └── ShopDetails/          # High-resolution product showcase & artisan stories
│   ├── redux/                    # Redux Toolkit store & feature slices
│   │   ├── store.ts              # Redux store configuration
│   │   └── features/             # Cart, Wishlist, QuickView slices
│   ├── types/                    # TypeScript interfaces & database schemas
│   └── utils/                    # Utility libraries
│       ├── cartSync.ts           # Two-way Supabase cart & wishlist sync
│       ├── indexedDB.ts          # Native browser IndexedDB persistence
│       ├── supabase/             # Client, Server, and SSR Supabase instances
│       ├── toast.tsx             # Custom minimalist luxury toast notifications
│       └── email.ts              # Branded Nodemailer verification & welcome emails
├── supabase/                     # PostgreSQL database schema & migrations
├── SYSTEM_DOCUMENTATION.md       # Comprehensive 1200+ line technical reference
├── README.md                     # Project documentation
└── package.json                  # Dependencies & execution scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher (Node.js 20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Database**: A [Supabase](https://supabase.com/) project with PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/Megatron-XCoder/TheHandmadeVendor.git
cd TheHandmadeVendor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and supply your credentials:

```env
# ── Supabase Configuration ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# ── Application Base URL ────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── Nodemailer SMTP (Email Verification & Welcome Letters) ──────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="The Handmade Vendor Concierge <concierge@thehandmadevendor.com>"
```

> **Note**: If SMTP credentials are left blank in local development, email verification codes are automatically logged to the terminal console and accessible via an on-screen debug pill.

### 4. Database Setup & Migrations
Execute the SQL schema in your Supabase SQL Editor. The schema establishes:
- `patron_profiles` — Collector names, monograms, phone numbers, and preferences.
- `addresses` — Multi-tag patron address book (Studio, Residence, Atelier).
- `cart_items` & `wishlist_items` — Synchronized shopping bag and wishlist records.
- `orders` & `order_items` — Bespoke commissions and 4-stage tracking records.
- **Row Level Security (RLS)** — Enforces strict per-user authorization policies.

*(Detailed SQL definitions can be reviewed in [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md#5-database-schema--migrations-postgresql)).*

### 5. Launch the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience **The Handmade Vendor**.

### 6. Production Build & Linting
```bash
# Type check and production build
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint
```

---

## 🛡️ Database & Security Architecture

All database tables in Supabase leverage PostgreSQL Row Level Security (RLS):
- Patrons can only read and modify their own profile, addresses, cart items, wishlist records, and orders.
- Unauthenticated guest carts and wishlists are safely kept in client IndexedDB and merged to Supabase upon sign-in.
- Passwords and master security keys are securely encrypted using industry-standard hashing protocols through Supabase Auth.

---

## 📖 In-Depth System Documentation

For complete, deep-dive architectural specifications, refer to [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md):
- Detailed Two-Way State Synchronization Lifecycle
- Server Instrumentation & Diagnostic Database Connectivity
- TanStack Table Architecture & Responsive Breakpoints
- Step-by-step Supabase PostgreSQL Migration Scripts
- Complete Daily Engineering Logs & Changelog

---

## 📜 License & Credits

Crafted with dedication by **The Handmade Vendor Team**.  
All rights reserved © 2026.