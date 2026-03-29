-- Create inventory table
create table if not exists public.inventory (
  id          bigserial   primary key,
  qr_code     text        not null unique,
  name        text        not null,
  category    text        not null,
  org         text        not null,
  location    text        not null,
  quantity    int         not null default 1,
  last_used   text        not null default '—',
  shared      boolean     not null default false,
  created_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.inventory enable row level security;

-- Drop policies if they already exist (makes this script safe to re-run)
drop policy if exists "Authenticated users can view all inventory" on public.inventory;
drop policy if exists "Eboard can insert own org items" on public.inventory;
drop policy if exists "Eboard can update own org items" on public.inventory;
drop policy if exists "Eboard can delete own org items" on public.inventory;

-- Anyone authenticated can read all items (needed for global view + marketplace)
create policy "Authenticated users can view all inventory"
  on public.inventory for select
  to authenticated
  using (true);

-- Only eboard of the item's org (or OSI admin) can insert
create policy "Eboard can insert own org items"
  on public.inventory for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.is_osi_admin = true
        or exists (
          select 1 from jsonb_array_elements(p.organizations) as o
          where o->>'org' = org
          and o->>'role' = 'eboard'
        )
      )
    )
  );

-- Only eboard of the item's org (or OSI admin) can update
create policy "Eboard can update own org items"
  on public.inventory for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.is_osi_admin = true
        or exists (
          select 1 from jsonb_array_elements(p.organizations) as o
          where o->>'org' = org
          and o->>'role' = 'eboard'
        )
      )
    )
  );

-- Only eboard of the item's org (or OSI admin) can delete
create policy "Eboard can delete own org items"
  on public.inventory for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.is_osi_admin = true
        or exists (
          select 1 from jsonb_array_elements(p.organizations) as o
          where o->>'org' = org
          and o->>'role' = 'eboard'
        )
      )
    )
  );

-- Seed demo data (runs with superuser privileges, bypasses RLS)
insert into public.inventory (qr_code, name, category, org, location, quantity, last_used, shared) values
  ('BC-CAB-TABLE-001',    'Folding Tables (set of 6)',  'Furniture',     'Campus Activities Board',      'Carney Hall, Suite 147', 6, 'Student Involvement Fair', true),
  ('BC-CAB-SOUND-001',    'Sound System & Speakers',   'AV Equipment',  'Campus Activities Board',      'Carney Storage',         1, 'Mudstock',                 false),
  ('BC-UGBC-BANNER-001',  'Event Banners (x4)',         'Signage',       'UGBC',                         'Carney Hall, Suite 147', 4, 'Homecoming',               true),
  ('BC-ICI-TENT-001',     'Pop-up Tents (x3)',          'Outdoor',       'Il Circolo Italiano',          'Mod Lot Storage',        3, 'ALC Showdown',             true),
  ('BC-ASO-LIGHTS-001',   'String Lights (200ft)',      'Décor',         'African Student Organization', 'Carney Storage',         2, 'Stokes Set',               false),
  ('BC-ARC-FIRSTAID-001', 'First Aid Kits (x5)',        'Safety',        'American Red Cross of BC',     'Carney Hall, Suite 147', 5, 'Student Involvement Fair', true),
  ('BC-ENV-COMPOST-001',  'Compost Bins (x8)',          'Sustainability', 'Environmental Club',           'Mod Lot Storage',        8, 'Mudstock',                 true)
on conflict (qr_code) do nothing;
