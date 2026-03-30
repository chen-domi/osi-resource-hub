# The Commons — OSI Resource Hub

A shared inventory and resource-sharing platform for Boston College student organizations. Built for the Office of Student Involvement (OSI) to help clubs track equipment, share resources across organizations, and reduce waste on campus.

---

## What It Does

- **Inventory management** — Track your org's items with QR codes, quantities, locations, and checkout status
- **Sharing marketplace** — List items other orgs can borrow and request items you need
- **QR check-in/out** — Scan QR codes to mark items as checked out or returned, state persists across sessions
- **Wanted board** — Post items your org is looking for; other orgs can respond
- **Role-based access** — Members can view; eboard members can add/edit/delete items; OSI admins see everything

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth + email) |
| QR Codes | `qrcode.react`, `html5-qrcode` |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/chen-domi/osi-resource-hub.git
cd osi-resource-hub
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase project under **Settings → API**.

### 3. Run the database migrations

In the Supabase SQL Editor, run each migration file in order:

```
supabase/migrations/001_profiles.sql
supabase/migrations/002_inventory.sql
supabase/migrations/003_item_requests.sql
supabase/migrations/004_checkouts_and_orgs.sql
```

### 4. Configure Supabase Auth

In **Authentication → URL Configuration**:
- Set **Site URL** to `http://localhost:3000` (or your Vercel URL for production)
- Add your URL to **Redirect URLs**

Enable **Google** as an OAuth provider under **Authentication → Providers**.

### 5. Start the app

```bash
npm start
```

---

## Project Structure

```
src/
  App.tsx                  # Root app, tab management, Supabase data fetching
  components/
    Header.tsx             # Top nav with org switcher and sign out
    ImpactDashboard.tsx    # Stats cards, quick actions, org manager
    InventoryTable.tsx     # Item table with QR popover, status indicators
    AddItemModal.tsx       # Add / edit item form
    SharingMarketplace.tsx # Browse shared items from all orgs
    RequestsBoard.tsx      # Wanted items board
    QRScannerModal.tsx     # Camera QR scanner
    LoginPage.tsx          # Sign in / sign up / profile setup
    Combobox.tsx           # Reusable searchable dropdown
  context/
    AuthContext.tsx        # Auth state, joinOrg, leaveOrg, switchOrg
  data/
    clubs.ts               # Full list of BC student organizations
    inventory.ts           # Demo QR scan data
  lib/
    supabase.ts            # Supabase client
  types/
    index.ts               # Shared TypeScript types

supabase/
  migrations/              # SQL migrations (run in order)
```

---

## Roles & Permissions

| Role | Can do |
|---|---|
| **Member** | View all inventory, browse marketplace, post wanted requests |
| **Eboard** | All of the above + add/edit/delete items for their org, toggle marketplace listing |
| **OSI Admin** | Full access across all organizations |

Users sign up with a BC email (`@bc.edu`) and join organizations using a PIN. The default PIN for all organizations is `0000`.

---

## Deployment

The app is deployed on Vercel. Any push to `main` triggers an automatic redeploy.

Set the following environment variables in Vercel **Settings → Environment Variables**:

```
REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY
GENERATE_SOURCEMAP=false
```

---

## Development Notes

- A **dev login** button appears in development mode (`localhost`) to bypass OAuth — useful for testing without a Supabase session
- Supabase Row Level Security (RLS) is enforced at the database level; dev login bypasses this and falls back to local state for mutations
- QR codes are auto-generated from org abbreviation + item name + ID (e.g. `BC-UGBC-TABLE-001`)
