#!/usr/bin/env node
/**
 * generate-pins.js
 *
 * Generates unique random 4-digit PINs for every BC club and outputs:
 *   - supabase-setup.sql  (run in Supabase SQL Editor)
 *   - eboard-pins.csv     (admin reference — keep private, listed in .gitignore)
 *
 * Usage: node scripts/generate-pins.js
 */

const fs = require('fs');
const path = require('path');

// ── 1. Load club list ─────────────────────────────────────────────────────────

// Parse BC_CLUBS from src/data/clubs.ts without a full TS compiler
const clubsFile = fs.readFileSync(
  path.join(__dirname, '../src/data/clubs.ts'),
  'utf8'
);

// Extract every single-quoted string that is a club name
const clubs = [];
const lineRe = /^\s*'([^']+)'/;
for (const line of clubsFile.split('\n')) {
  const m = line.match(lineRe);
  if (m) clubs.push(m[1]);
}

// Also catch double-quoted entries (none currently, but future-proof)
const lineReDouble = /^\s*"([^"]+)"/;
for (const line of clubsFile.split('\n')) {
  const m = line.match(lineReDouble);
  if (m && !clubs.includes(m[1])) clubs.push(m[1]);
}

console.log(`Loaded ${clubs.length} clubs.`);

// ── 2. Generate unique random 4-digit PINs ────────────────────────────────────

// Build pool of all 10,000 possible PINs ("0000" … "9999")
const pool = [];
for (let i = 0; i < 10000; i++) {
  pool.push(String(i).padStart(4, '0'));
}

// Fisher-Yates shuffle
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}

if (clubs.length > pool.length) {
  throw new Error('More clubs than available 4-digit PINs — impossible.');
}

// Assign first N shuffled PINs to clubs
const assignments = clubs.map((name, idx) => ({ name, pin: pool[idx] }));

// Sanity-check: all PINs unique
const pinSet = new Set(assignments.map(a => a.pin));
if (pinSet.size !== assignments.length) {
  throw new Error('PIN collision detected — this should never happen.');
}

console.log(`Generated ${assignments.length} unique PINs.`);

// ── 3. Write supabase-setup.sql ───────────────────────────────────────────────

const escape = (s) => s.replace(/'/g, "''");

const insertRows = assignments
  .map(({ name, pin }) => `  ('${escape(name)}', '${pin}')`)
  .join(',\n');

const sql = `-- =============================================================================
-- The Commons: Supabase Setup Script
-- Run this entire file in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS and ON CONFLICT guards.
-- =============================================================================

-- ── 1. Ensure columns exist & remove member_pin ──────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_osi_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS eboard_pin VARCHAR(4) NOT NULL DEFAULT '0000';

-- Drop member_pin — only eboard_pin is used
ALTER TABLE public.organizations
  DROP COLUMN IF EXISTS member_pin;

-- ── 2. Enable Row Level Security ──────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_requests  ENABLE ROW LEVEL SECURITY;

-- ── 3. Drop old policies (avoid conflicts on re-run) ─────────────────────────

DROP POLICY IF EXISTS "profiles_select_own"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_bc"            ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"           ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;

DROP POLICY IF EXISTS "organizations_public_read"                ON public.organizations;
DROP POLICY IF EXISTS "Authenticated can read organizations"      ON public.organizations;
DROP POLICY IF EXISTS "Public read organizations"                 ON public.organizations;
DROP POLICY IF EXISTS "Only OSI admins can update organizations"  ON public.organizations;
DROP POLICY IF EXISTS "Authenticated can update organizations"    ON public.organizations;

DROP POLICY IF EXISTS "inventory_public_read"                ON public.inventory;
DROP POLICY IF EXISTS "inventory_eboard_write"               ON public.inventory;
DROP POLICY IF EXISTS "Public read inventory"                ON public.inventory;
DROP POLICY IF EXISTS "Eboard can create inventory"          ON public.inventory;
DROP POLICY IF EXISTS "Eboard can update inventory"          ON public.inventory;
DROP POLICY IF EXISTS "Eboard can delete inventory"          ON public.inventory;
DROP POLICY IF EXISTS "Authenticated can insert inventory"   ON public.inventory;
DROP POLICY IF EXISTS "Authenticated can update inventory"   ON public.inventory;
DROP POLICY IF EXISTS "Authenticated can delete inventory"   ON public.inventory;

DROP POLICY IF EXISTS "item_requests_public_read"            ON public.item_requests;
DROP POLICY IF EXISTS "item_requests_eboard_write"           ON public.item_requests;
DROP POLICY IF EXISTS "Public read item_requests"            ON public.item_requests;
DROP POLICY IF EXISTS "Anyone can create item_requests"      ON public.item_requests;
DROP POLICY IF EXISTS "Eboard can update item_requests"      ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated can insert item_requests" ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated can update item_requests" ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated can delete item_requests" ON public.item_requests;

-- ── 4. PROFILES policies ──────────────────────────────────────────────────────

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── 5. ORGANIZATIONS policies ─────────────────────────────────────────────────

-- Public read so org list is available before login
CREATE POLICY "Public read organizations"
  ON public.organizations FOR SELECT
  USING (true);

-- Only OSI admins can update org records (including PIN changes)
CREATE POLICY "Only OSI admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_osi_admin = true)
  );

-- Eboard members can also update their own org PIN (application-level validation)
CREATE POLICY "Authenticated can update organizations"
  ON public.organizations FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── 6. INVENTORY policies ─────────────────────────────────────────────────────

CREATE POLICY "Public read inventory"
  ON public.inventory FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update inventory"
  ON public.inventory FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete inventory"
  ON public.inventory FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ── 7. ITEM_REQUESTS policies ─────────────────────────────────────────────────

CREATE POLICY "Public read item_requests"
  ON public.item_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert item_requests"
  ON public.item_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update item_requests"
  ON public.item_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete item_requests"
  ON public.item_requests FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ── 8. Seed organizations with unique PINs ────────────────────────────────────
-- ON CONFLICT updates eboard_pin so this is safe to re-run.

INSERT INTO public.organizations (name, eboard_pin)
VALUES
${insertRows}
ON CONFLICT (name) DO UPDATE
  SET eboard_pin = EXCLUDED.eboard_pin;

-- Done!
-- After running this script, distribute PINs to org e-boards via the eboard-pins.csv file.
`;

const sqlPath = path.join(__dirname, '../supabase-setup.sql');
fs.writeFileSync(sqlPath, sql, 'utf8');
console.log(`Wrote ${sqlPath}`);

// ── 4. Write eboard-pins.csv ──────────────────────────────────────────────────

const csv = 'org_name,eboard_pin\n' +
  assignments.map(({ name, pin }) => `"${name.replace(/"/g, '""')}",${pin}`).join('\n') +
  '\n';

const csvPath = path.join(__dirname, '../eboard-pins.csv');
fs.writeFileSync(csvPath, csv, 'utf8');
console.log(`Wrote ${csvPath}`);
console.log('\nDone! Keep eboard-pins.csv private — it contains all e-board PINs.');
