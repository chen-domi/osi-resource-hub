-- Persist checkout state on inventory items
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS checked_out boolean NOT NULL DEFAULT false;

-- Organizations table for PIN-based joining
CREATE TABLE IF NOT EXISTS public.organizations (
  id         bigserial primary key,
  name       text not null unique,
  member_pin text not null,
  eboard_pin text not null
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read organizations" ON public.organizations;
CREATE POLICY "Authenticated can read organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- Seed the orgs already present in inventory
INSERT INTO public.organizations (name, member_pin, eboard_pin) VALUES
  ('Campus Activities Board', 'cab-member', 'cab-eboard'),
  ('UGBC',                    'ugbc-member', 'ugbc-eboard'),
  ('Il Circolo Italiano',     'ici-member',  'ici-eboard'),
  ('African Student Organization', 'aso-member', 'aso-eboard'),
  ('American Red Cross of BC',    'arc-member', 'arc-eboard'),
  ('Environmental Club',          'env-member', 'env-eboard')
ON CONFLICT (name) DO NOTHING;
